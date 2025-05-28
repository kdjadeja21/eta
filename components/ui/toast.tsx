import { toast } from "sonner";

export const showSuccessToast = (
  message: string = "Operation successful",
  options?: {
    description?: string;
    duration?: number;
  }
) => {
  toast.success(message, {
    ...options,
  });
};

export const showErrorToast = (
  message: string = "Operation failed",
  options?: {
    description?: string;
    duration?: number;
  }
) => {
  toast.error(message, {
    ...options,
  });
};

export const showWarningToast = (
  message: string = "Warning",
  options?: {
    description?: string;
    duration?: number;
  }
) => {
  toast.warning(message, {
    ...options,
  });
};

export const showInfoToast = (
  message: string = "Information",
  options?: {
    description?: string;
    duration?: number;
  }
) => {
  toast.info(message, {
    ...options,
  });
};

export const showLoadingToast = (
  message: string = "Loading...",
  options?: {
    description?: string;
    duration?: number;
  }
) => {
  return toast.loading(message, {
    ...options,
  });
};

// export const showPromiseToast = <T,>(
//   promise: Promise<T>,
//   messages: {
//     loading?: string;
//     success?: string;
//     error?: string;
//   } = {
//     loading: "Loading...",
//     success: "Completed successfully!",
//     error: "Something went wrong",
//   }
// ) => {
//   return toast.promise(
//     promise,
//     {
//       loading: messages.loading,
//       success: messages.success,
//       error: messages.error,
//     },
//     {
//       style: { color: "white" },
//       loading: {
//         style: { backgroundColor: "#6366F1" },
//         icon: "⏳",
//       },
//       success: {
//         style: { backgroundColor: "#059669" },
//         icon: "✅",
//       },
//       error: {
//         style: { backgroundColor: "#DC2626" },
//         icon: "❌",
//       },
//     }
//   );
// };

export const showDeleteToast = (
  message: string = "Item deleted successfully",
  options?: {
    description?: string;
    duration?: number;
  }
) => {
  toast.success(message, {
    icon: "🗑️",
    ...options,
  });
};
