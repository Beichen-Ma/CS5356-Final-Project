"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ToastVariant = "default" | "destructive";

type Toast = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextType = {
  toast: (props: Toast) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (props: Toast) => {
    setToasts((prev) => [...prev, props]);
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast, i) => (
          <div
            key={i}
            className={`p-4 rounded-md shadow-md max-w-xs ${
              toast.variant === "destructive"
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            <div className="font-medium">{toast.title}</div>
            {toast.description && (
              <div className="text-sm mt-1">{toast.description}</div>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
