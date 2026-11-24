import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { MAX_CLINIC_NAME_LENGTH } from "@/lib/constants";

function request(
  path: string,
  options: { method?: string; body?: unknown; cookie?: string } = {},
) {
  const headers = new Headers({
    host: "clinic.test",
    origin: "http://clinic.test",
    "sec-fetch-site": "same-origin",
  });
  if (options.body !== undefined)
    headers.set("content-type", "application/json");
  if (options.cookie) headers.set("cookie", options.cookie);
  return new NextRequest(`http://clinic.test${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
}

test("multiple doctor accounts have separate consultation records", async () => {
  const databasePath = `${process.cwd()}/.clinic-accounts-test.sqlite`;
  process.env.DATABASE_PATH = databasePath;
  const [
    { db, sqlite },
    { migrate },
    { POST: createAccount },
    { POST: loginDoctor },
    { GET: getRecords, POST: createRecord },
  ] = await Promise.all([
    import("@/lib/db"),
    import("drizzle-orm/better-sqlite3/migrator"),
    import("@/app/api/auth/setup/route"),
    import("@/app/api/auth/login/route"),
    import("@/app/api/records/route"),
  ]);
  await migrate(db, { migrationsFolder: "drizzle" });
  try {
    const firstAccount = await createAccount(
      request("/api/auth/setup", {
        method: "POST",
        body: {
          email: "first@example.test",
          password: "first-secure-password",
        },
      }),
    );
    assert.equal(firstAccount.status, 201);
    const firstToken = firstAccount.cookies.get("clinic_session")?.value;
    assert.ok(firstToken);

    const secondAccount = await createAccount(
      request("/api/auth/setup", {
        method: "POST",
        body: {
          email: "second@example.test",
          password: "second-secure-password",
        },
      }),
    );
    assert.equal(secondAccount.status, 201);
    const secondToken = secondAccount.cookies.get("clinic_session")?.value;
    assert.ok(secondToken);

    const duplicateEmail = await createAccount(
      request("/api/auth/setup", {
        method: "POST",
        body: {
          email: "first@example.test",
          password: "another-secure-password",
        },
      }),
    );
    assert.equal(duplicateEmail.status, 409);

    const secondLogin = await loginDoctor(
      request("/api/auth/login", {
        method: "POST",
        body: {
          email: "second@example.test",
          password: "second-secure-password",
        },
      }),
    );
    assert.equal(secondLogin.status, 200);
    const secondLoginToken = secondLogin.cookies.get("clinic_session")?.value;
    assert.ok(secondLoginToken);

    const firstConsultation = await createRecord(
      request("/api/records", {
        method: "POST",
        cookie: `clinic_session=${firstToken}`,
        body: {
          patientName: "First Account Patient",
          consultationDate: "2026-11-24",
          amountRupees: 900,
          paymentMode: "cash",
          clinicName: "Central Clinic",
        },
      }),
    );
    assert.equal(firstConsultation.status, 201);

    const secondConsultation = await createRecord(
      request("/api/records", {
        method: "POST",
        cookie: `clinic_session=${secondLoginToken}`,
        body: {
          patientName: "Second Account Patient",
          consultationDate: "2026-11-24",
          amountRupees: 1200,
          paymentMode: "digital",
        },
      }),
    );
    assert.equal(secondConsultation.status, 201);

    const oversizedClinic = await createRecord(
      request("/api/records", {
        method: "POST",
        cookie: `clinic_session=${secondLoginToken}`,
        body: {
          patientName: "Second Account Patient",
          consultationDate: "2026-11-24",
          amountRupees: 1200,
          paymentMode: "digital",
          clinicName: "C".repeat(MAX_CLINIC_NAME_LENGTH + 1),
        },
      }),
    );
    assert.equal(oversizedClinic.status, 400);

    const firstListResponse = await getRecords(
      request("/api/records", { cookie: `clinic_session=${firstToken}` }),
    );
    const firstList = (await firstListResponse.json()) as {
      items: Array<{ patientName: string; clinicName: string | null }>;
      total: number;
    };
    assert.equal(firstList.total, 1);
    assert.deepEqual(
      firstList.items.map(({ patientName, clinicName }) => ({
        patientName,
        clinicName,
      })),
      [{ patientName: "First Account Patient", clinicName: "Central Clinic" }],
    );

    const secondListResponse = await getRecords(
      request("/api/records", { cookie: `clinic_session=${secondLoginToken}` }),
    );
    const secondList = (await secondListResponse.json()) as {
      items: Array<{ patientName: string; clinicName: string | null }>;
      total: number;
    };
    assert.equal(secondList.total, 1);
    assert.deepEqual(
      secondList.items.map(({ patientName, clinicName }) => ({
        patientName,
        clinicName,
      })),
      [{ patientName: "Second Account Patient", clinicName: null }],
    );
  } finally {
    sqlite.close();
    await Promise.all(
      [databasePath, `${databasePath}-wal`, `${databasePath}-shm`].map((file) =>
        rm(file, { force: true }),
      ),
    );
  }
});
