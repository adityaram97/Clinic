import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentDoctor } from "@/lib/auth";
import { hasDoctorAccount } from "@/lib/account";
import { Dashboard } from "@/components/dashboard";

export const metadata: Metadata = {
  title: "Consultation revenue | Clinic ledger",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const [doctorId, accountExists] = await Promise.all([
    currentDoctor(),
    hasDoctorAccount(),
  ]);
  if (!accountExists) redirect("/setup");
  if (!doctorId) redirect("/login");
  return <Dashboard />;
}
