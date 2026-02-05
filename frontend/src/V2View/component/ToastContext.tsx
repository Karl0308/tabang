import React, { createContext, useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheckCircle, faTimesCircle, faInfoCircle, faExclamationTriangle, faTimes } from "@fortawesome/free-solid-svg-icons";

interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastContextProps {
  showToast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextProps | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success": return faCheckCircle;
      case "error": return faTimesCircle;
      case "warning": return faExclamationTriangle;
      default: return faInfoCircle;
    }
  };

  return (
// showToast("Failed to save your data", "error");
// showToast("Something looks unusual...", "warning");
// showToast("This is just an FYI message", "info");
// showToast("Uploading file...", "info");
// showToast("File uploaded!", "success");
// showToast("Profile updated!", "success");
// showToast("Server slow, try again later.", "warning");

    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div
        className="
          fixed z-50 flex flex-col gap-3
          bottom-6 right-6
          max-w-xs w-full
          sm:bottom-6 sm:right-6
          px-4
          sm:px-0
        "
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-lg shadow-lg text-white
              animate-slide-in
              backdrop-blur-md
              relative overflow-hidden
              w-full sm:w-80
              ${
                toast.type === "success"
                  ? "bg-green-600"
                  : toast.type === "error"
                  ? "bg-red-600"
                  : toast.type === "warning"
                  ? "bg-yellow-500 text-black"
                  : "bg-blue-600"
              }
            `}
          >
            <FontAwesomeIcon icon={getIcon(toast.type)} className="text-xl mt-0.5" />

            <span className="flex-1 text-sm">{toast.message}</span>

            {/* Close button */}
            <button
              className="text-white/80 hover:text-white absolute right-2 top-2"
              onClick={() => removeToast(toast.id)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        ))}
      </div>

      {/* Animations */}
      <style>
        {`
          @keyframes slideIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .animate-slide-in {
            animation: slideIn 0.25s ease-out forwards;
          }
        `}
      </style>
    </ToastContext.Provider>
  );
};
