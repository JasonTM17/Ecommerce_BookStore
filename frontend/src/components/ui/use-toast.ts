// Toast hook cho phép sử dụng toast trong các component
"use client";

import { toast } from "sonner";

export function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => toast.dismiss(id),
  };
}
