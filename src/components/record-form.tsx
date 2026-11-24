"use client";

import { RecordFields } from "@/components/record-fields";
import { useRecordEditor } from "@/components/use-record-editor";
import type { RecordRow } from "@/lib/types";

export function RecordForm({
  record,
  onSaved,
}: {
  record?: RecordRow;
  onSaved: () => void;
}) {
  const { dialog, error, pending, setOpen, close, submit } = useRecordEditor(
    record,
    onSaved,
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          record
            ? "min-h-11 rounded-control px-3 font-medium text-primary underline-offset-4 hover:underline"
            : "min-h-11 rounded-control bg-primary px-4 font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.98]"
        }
      >
        {record ? "Edit" : "Add consultation"}
      </button>
      <dialog
        ref={dialog}
        onCancel={close}
        onClick={(event) => {
          if (event.target === dialog.current) close();
        }}
        className="m-auto w-[min(94vw,32rem)] rounded-container border border-border bg-card p-0 text-card-foreground shadow-xl backdrop:bg-foreground/40"
      >
        <form onSubmit={submit} className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-heading text-2xl font-semibold">
              {record ? "Edit consultation" : "New consultation"}
            </h2>
            <button
              type="button"
              aria-label="Close form"
              onClick={close}
              className="min-h-11 min-w-11 rounded-control text-xl hover:bg-muted"
            >
              ×
            </button>
          </div>
          <RecordFields record={record} />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={close}
              className="min-h-11 rounded-control border border-border px-4 hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-control bg-primary px-4 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save consultation"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}
