"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  useEffect(() => {
    // Check if there is an email to reset
    if (typeof window !== "undefined") {
      const email = localStorage.getItem("sipantau_reset_email");
      if (email) {
        setResetEmail(email);
      } else {
        // If no email is set in the session, they shouldn't be here (in a real app, this would be an invalid token)
        router.push("/");
      }
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("Silakan isi kedua kolom password.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    // In a real app, we'd send the new password to the server here.
    // For this simulation, we update the mock database in localStorage.
    if (resetEmail) {
      const usersListStr = localStorage.getItem("sipantau_users") || "[]";
      let usersList = JSON.parse(usersListStr);
      
      const userIndex = usersList.findIndex(u => u.email.toLowerCase() === resetEmail.toLowerCase());
      
      if (userIndex !== -1) {
        usersList[userIndex].password = password;
        localStorage.setItem("sipantau_users", JSON.stringify(usersList));
      } else {
        // Just for simulation, if email doesn't exist, we don't do anything but pretend it succeeded
      }

      setSuccess(true);
      
      // Clean up the simulation state
      localStorage.removeItem("sipantau_reset_email");
      
      // Redirect back to login after showing success
      setTimeout(() => {
        router.push("/");
      }, 2500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col items-center justify-center p-4">
      {/* Background Decorators */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-violet-200/40 to-fuchsia-200/40 blur-3xl opacity-50" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-cyan-200/40 to-blue-200/40 blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-[480px] bg-white p-8 sm:p-10 flex flex-col rounded-[2.5rem] shadow-xl border border-slate-100/50 relative overflow-hidden">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">
            Password Baru
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Silakan buat password baru yang aman untuk akun Anda.
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-emerald-700 font-extrabold text-lg">Berhasil!</h3>
              <p className="text-xs font-semibold text-emerald-600/80">
                Password Anda telah diperbarui. Mengarahkan ke halaman login...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-[11px] font-bold flex items-start gap-2">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Password Baru */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Password Baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password baru"
                  className="w-full border border-slate-200 bg-slate-50/30 rounded-full pl-5 pr-12 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-150 p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Konfirmasi Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Konfirmasi Password Baru
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password baru"
                  className="w-full border border-slate-200 bg-slate-50/30 rounded-full pl-5 pr-12 py-3 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-150 p-1"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-4 mt-2">
              <button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-violet-100 hover:shadow-violet-200 transition-all duration-200 text-sm cursor-pointer"
              >
                Simpan Password Baru
              </button>
            </div>
            
            <div className="text-center mt-2">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
              >
                Kembali ke Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
