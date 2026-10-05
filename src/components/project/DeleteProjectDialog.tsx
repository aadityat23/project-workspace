import { useState } from "react";

import { Field, Modal } from "@/components/kit/Modal";
import { deleteProject } from "@/lib/api";
import { notify } from "@/lib/notify";
import type { Project } from "@/lib/types";

/** Project deletion needs the exact project name typed. Escape / outside click only closes. */
export function DeleteProjectDialog({
  project,
  open,
  onClose,
  onDeleted,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const match = typed.trim() === project.name;
  const close = () => {
    if (busy) return;
    setTyped("");
    onClose();
  };
  const confirm = async () => {
    if (!match || busy) return;
    setBusy(true);
    try {
      await deleteProject(project.id);
      notify.success("Project deleted", project.name);
      setTyped("");
      onDeleted();
    } catch {
      notify.error("Could not delete project", "Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      width="sm"
      title={`Delete "${project.name.toUpperCase()}"?`}
      description="This will permanently remove the project and its associated data from the workspace. This action cannot be undone."
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={close}>
            Cancel
          </button>
          <button type="button" className="btn btn-danger" disabled={!match || busy} onClick={confirm}>
            {busy ? "Deleting…" : "Delete project"}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void confirm();
        }}
      >
        <Field label={`Type ${project.name} to confirm`}>
          <input
            className="field font-mono"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder={project.name}
          />
        </Field>
      </form>
    </Modal>
  );
}
