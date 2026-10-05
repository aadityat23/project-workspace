import { toast } from "sonner";

/** User feedback. `prototype` marks actions that need the future file service. */
export const notify = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message: string, description?: string) => toast.error(message, { description }),
  prototype: (action: string) =>
    toast(action, { description: "Prototype — this will run once the file service is connected." }),
};
