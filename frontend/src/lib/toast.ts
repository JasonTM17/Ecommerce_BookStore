export type ToastOptions = {
  description?: string;
};

export type ToastApi =
  | ((message: string, options?: ToastOptions) => void)
  | {
      success?: (message: string, options?: ToastOptions) => void;
      error?: (message: string, options?: ToastOptions) => void;
    };

export function notifyToast(
  toastApi: ToastApi,
  method: "success" | "error",
  message: string,
  options?: ToastOptions
) {
  if (typeof toastApi === "function") {
    const methodFn = (toastApi as unknown as Record<string, unknown>)[method];
    if (typeof methodFn === "function") {
      methodFn(message, options);
      return;
    }

    toastApi(message, options);
    return;
  }

  const methodFn = toastApi[method];
  if (typeof methodFn === "function") {
    methodFn(message, options);
  }
}
