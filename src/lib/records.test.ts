import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { test } from "node:test";
import { NextRequest } from "next/server";

function request(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    form?: Record<string, string>;
    cookie?: string;
    origin?: string;
  } = {},
) {
  const headers = new Headers({
    host: "clinic.test",
    origin: options.origin ?? "http://clinic.test",
    "sec-fetch-site": "same-origin",
  });
  if (options.form) {
    headers.set("content-type", "application/x-www-form-urlencoded");
  } else if (options.body !== undefined) {
    headers.set("content-type", "application/json");
  }
  if (options.cookie) headers.set("cookie", options.cookie);
  return new NextRequest(`http://clinic.test${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.form
      ? new URLSearchParams(options.form).toString()
      : options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });
}

test("doctor auth, records, ownership, editing and revenue summaries", async () => {
  const databasePath = `${process.cwd()}/.clinic-test.sqlite`;
  process.env.DATABASE_PATH = databasePath;
  const [{ db, sqlite }, { migrate }] = await Promise.all([
    import("@/lib/db"),
    import("drizzle-orm/better-sqlite3/migrator"),
  ]);
  await migrate(db, { migrationsFolder: "drizzle" });
  const [{ POST: setupDoctor }, { POST: loginDoctor }] = await Promise.all([
    import("@/app/api/auth/setup/route"),
    import("@/app/api/auth/login/route"),
  ]);
  const { GET: getRecords, POST: createRecord } =
    await import("@/app/api/records/route");
  const { PATCH: updateRecord } = await import("@/app/api/records/[id]/route");
  const { GET: getSummary } = await import("@/app/api/summary/route");
  const { doctors } = await import("@/lib/db/schema");
  const { listRecords, saveRecord } = await import("@/lib/records");
  try {
    const anonymous = await getRecords(request("/api/records"));
    assert.equal(anonymous.status, 401);

    const invalidSetup = await setupDoctor(
      request("/api/auth/setup", {
        method: "POST",
        body: { email: "bad", password: "short" },
      }),
    );
    assert.equal(invalidSetup.status, 400);

    const crossSite = await setupDoctor(
      request("/api/auth/setup", {
        method: "POST",
        origin: "https://attacker.test",
        body: {
          email: "doctor@example.test",
          password: "very-secure-password",
        },
      }),
    );
    assert.equal(crossSite.status, 403);

    const invalidFormSetup = await setupDoctor(
      request("/api/auth/setup", {
        method: "POST",
        form: { email: "bad", password: "short" },
      }),
    );
    assert.equal(invalidFormSetup.status, 303);
    assert.equal(
      invalidFormSetup.headers.get("location"),
      "/setup?error=invalid",
    );

    const created = await setupDoctor(
      request("/api/auth/setup", {
        method: "POST",
        form: {
          email: "doctor@example.test",
          password: "very-secure-password",
        },
      }),
    );
    assert.equal(created.status, 303);
    assert.equal(created.headers.get("location"), "/");
    const cookieValue = created.cookies.get("clinic_session")?.value;
    assert.ok(cookieValue);
    const cookie = `clinic_session=${cookieValue}`;
    const duplicateSetup = await setupDoctor(
      request("/api/auth/setup", {
        method: "POST",
        body: {
          email: "doctor@example.test",
          password: "very-secure-password",
        },
      }),
    );
    assert.equal(duplicateSetup.status, 409);
    const acceptedLogin = await loginDoctor(
      request("/api/auth/login", {
        method: "POST",
        body: {
          email: "doctor@example.test",
          password: "very-secure-password",
        },
      }),
    );
    assert.equal(acceptedLogin.status, 200);

    const formLogin = await loginDoctor(
      request("/api/auth/login", {
        method: "POST",
        form: {
          email: "doctor@example.test",
          password: "very-secure-password",
        },
      }),
    );
    assert.equal(formLogin.status, 303);
    assert.equal(formLogin.headers.get("location"), "/");

    const rejectedPassword = await loginDoctor(
      request("/api/auth/login", {
        method: "POST",
        body: { email: "doctor@example.test", password: "wrong-password" },
      }),
    );
    assert.equal(rejectedPassword.status, 401);

    const invalidRecord = await createRecord(
      request("/api/records", {
        method: "POST",
        cookie,
        body: { patientName: "", amountRupees: -4 },
      }),
    );
    assert.equal(invalidRecord.status, 400);

    const cashResponse = await createRecord(
      request("/api/records", {
        method: "POST",
        cookie,
        body: {
          patientName: "Asha Menon",
          consultationDate: "2026-11-23",
          amountRupees: 1500,
          paymentMode: "cash",
          clinicName: "North Clinic",
        },
      }),
    );
    assert.equal(cashResponse.status, 201);
    const cashRecord = (await cashResponse.json()) as {
      id: string;
      clinicName: string | null;
    };
    assert.equal(cashRecord.clinicName, "North Clinic");

    const edited = await updateRecord(
      request(`/api/records/${cashRecord.id}`, {
        method: "PATCH",
        cookie,
        body: {
          patientName: "Asha Menon",
          consultationDate: "2026-11-23",
          amountRupees: 1650,
          paymentMode: "cash",
          clinicName: "City Clinic",
        },
      }),
      { params: Promise.resolve({ id: cashRecord.id }) },
    );
    assert.equal(edited.status, 200);
    const editedData = (await edited.json()) as { clinicName: string | null };
    assert.equal(editedData.clinicName, "City Clinic");

    const digitalResponse = await createRecord(
      request("/api/records", {
        method: "POST",
        cookie,
        body: {
          patientName: "Rohan Shah",
          consultationDate: "2026-11-24",
          amountRupees: 2600,
          paymentMode: "digital",
        },
      }),
    );
    assert.equal(digitalResponse.status, 201);

    const recordsResponse = await getRecords(
      request("/api/records", { cookie }),
    );
    const list = (await recordsResponse.json()) as {
      items: Array<{ amountPaise: number; clinicName: string | null }>;
      total: number;
    };
    assert.equal(list.total, 2);
    assert.ok(list.items.some((record) => record.clinicName === "City Clinic"));
    assert.deepEqual(
      list.items.map((record) => record.amountPaise).sort(),
      [165000, 260000],
    );

    const doctorId = (await db.select({ id: doctors.id }).from(doctors))[0]?.id;
    assert.ok(doctorId);
    await db.insert(doctors).values({
      id: "other-doctor",
      email: "other@example.test",
      passwordHash: "unused",
      createdAt: new Date().toISOString(),
    });
    const otherDoctorRecord = await saveRecord("other-doctor", {
      patientName: "Private patient",
      consultationDate: "2026-11-24",
      amountRupees: 720,
      paymentMode: "cash",
    });
    const scopedRecords = await listRecords({ doctorId, page: 1 });
    assert.equal(scopedRecords.total, 2);

    const dailyResponse = await getSummary(
      request("/api/summary?date=2026-11-24", { cookie }),
    );
    const daily = (await dailyResponse.json()) as Record<
      string,
      { cash: number; digital: number; total: number }
    >;
    assert.equal(daily.day?.cash, 0);
    assert.equal(daily.day?.digital, 260000);
    assert.equal(daily.day?.total, 260000);
    assert.equal(daily.week?.cash, 165000);
    assert.equal(daily.week?.digital, 260000);
    assert.equal(daily.month?.total, 425000);

    assert.ok(otherDoctorRecord);
    const notOwnedRecord = await updateRecord(
      request(`/api/records/${otherDoctorRecord.id}`, {
        method: "PATCH",
        cookie,
        body: {
          patientName: "Private patient",
          consultationDate: "2026-11-24",
          amountRupees: 720,
          paymentMode: "cash",
        },
      }),
      { params: Promise.resolve({ id: otherDoctorRecord.id }) },
    );
    assert.equal(notOwnedRecord.status, 404);
  } finally {
    sqlite.close();
    await Promise.all(
      [databasePath, `${databasePath}-wal`, `${databasePath}-shm`].map((file) =>
        rm(file, { force: true }),
      ),
    );
  }
});
