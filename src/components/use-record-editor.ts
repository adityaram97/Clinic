"use client";

import { useEffect, useRef, useState } from "react";
import type { RecordRow } from "@/lib/types";

export function useRecordEditor(
  record: RecordRow | undefined,
  onSaved: () => void,
) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  function close() {
    setOpen(false);
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      patientName: form.get("patientName"),
      consultationDate: form.get("consultationDate"),
      amountRupees: Number(form.get("amountRupees")),
      paymentMode: form.get("paymentMode"),
    };
    try {
      const response = await fetch(
        record ? `/api/records/${record.id}` : "/api/records",
        {
          method: record ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Could not save this consultation.");
        return;
      }
      close();
      onSaved();
    } catch {
      setError(
        "Could not reach the server. Your changes are still here; try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return { dialog, error, pending, open, setOpen, close, submit };
}
