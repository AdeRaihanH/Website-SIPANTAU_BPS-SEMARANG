"use client";
import React from "react";

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const isWarning = toast.type === "warning";
        const isInfo = toast.type === "info";
        const isSuccess = toast.type === "success" || (!isWarning && !isInfo);

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl shadow-lg p-4 min-w-[320px] max-w-[380px] border-l-4 transform transition-all animate-[slideIn_0.3s_ease-out_forwards] ${
              isWarning
                ? "bg-[#fffbeb] border-[#f97316]"
                : isInfo
                ? "bg-[#eff6ff] border-[#3b82f6]"
                : "bg-[#f0fdf4] border-[#22c55e]"
            }`}
          >
            {/* Badge Icon */}
            <div
              className={`rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-white text-xs font-extrabold ${
                isWarning
                  ? "bg-[#f97316]"
                  : isInfo
                  ? "bg-[#3b82f6]"
                  : "bg-[#22c55e]"
              }`}
            >
              {isWarning ? (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : isInfo ? (
                <span className="text-[11px] font-extrabold italic">i</span>
              ) : (
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>

            {/* Title & Message */}
            <div className="flex-1">
              <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                {toast.title || (isWarning ? "Warning" : isInfo ? "Info" : "Success")}
              </h4>
              <p className="text-xs font-semibold text-slate-500 mt-0.5 leading-snug">
                {toast.message}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className={`transition-colors p-0.5 cursor-pointer font-bold shrink-0 ${
                isWarning
                  ? "text-[#f97316] hover:text-[#ea580c]"
                  : isInfo
                  ? "text-[#3b82f6] hover:text-[#1d4ed8]"
                  : "text-[#22c55e] hover:text-[#15803d]"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}
