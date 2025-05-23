import { Toaster, toast } from "sonner";

export const ToastProvider = () => <Toaster position="top-right" richColors />;

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showErrorToast = (message: string) => {
  toast.error(message);
};
