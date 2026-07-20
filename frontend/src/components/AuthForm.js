"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ defaultRole = "pemagang" }) {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPhone, setSignUpPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [signUpAddress, setSignUpAddress] = useState("");
  const [signUpRole, setSignUpRole] = useState(defaultRole);
  const [signUpInstitution, setSignUpInstitution] = useState("");
  const [signUpMajor, setSignUpMajor] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [statusMessage, setStatusMessage] = useState(null);
  const [loginError, setLoginError] = useState(false);

  // Helper to detect if email is a mentor email
  const isMentorEmail = (email) => {
    if (!email) return false;
    const lowerEmail = email.toLowerCase();
    return (
      lowerEmail.endsWith("@bps.go.id") ||
      lowerEmail.endsWith("@mentor.sipantau.com") ||
      lowerEmail.includes("mentor")
    );
  };

  // Clear any existing active session and initialize mock database if needed
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear active login sessions
      localStorage.removeItem("sipantau_role");
      localStorage.removeItem("sipantau_name");
      localStorage.removeItem("sipantau_email");

      // Initialize default accounts in database if empty, or inject missing ones
      const existingUsersStr = localStorage.getItem("sipantau_users");
      let usersList = [];
      if (existingUsersStr) {
        usersList = JSON.parse(existingUsersStr);
      }

      const defaultUsers = [
        {
          email: "admin123@gmail.com",
          password: "admin123",
          name: "Admin Utama",
          phone: "08111111111",
          address: "Kantor Pusat BPS",
          institution: "BPS Kota Semarang",
          role: "admin",
          status: "approved"
        },
        {
          email: "mentor@bps.go.id",
          password: "password123",
          name: "Budi Hartono",
          phone: "08123456789",
          address: "Kantor BPS Kota Semarang",
          institution: "BPS Kota Semarang",
          role: "mentor",
          status: "approved"
        },
        {
          email: "pemagang@gmail.com",
          password: "password123",
          name: "Andi Basudara",
          phone: "08987654321",
          address: "Jl. Pemuda No. 1",
          institution: "Universitas Diponegoro",
          role: "pemagang",
        },
        {
          email: "pemagang123@gmail.com",
          password: "password123",
          name: "Pemagang Dummy",
          phone: "08123456780",
          address: "-",
          institution: "-",
          role: "pemagang",
          status: "approved"
        },
        {
          email: "mentor123@bps.go.id",
          password: "password123",
          name: "Mentor Dummy",
          phone: "08123456781",
          address: "-",
          institution: "BPS Kota Semarang",
          role: "mentor",
          status: "approved"
        }
      ];

      let isUpdated = false;
      defaultUsers.forEach(defaultUser => {
        if (!usersList.find(u => u.email === defaultUser.email)) {
          usersList.push(defaultUser);
          isUpdated = true;
        }
      });

      if (isUpdated || !existingUsersStr) {
        localStorage.setItem("sipantau_users", JSON.stringify(usersList));
      }
    }
  }, []);



  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSignUp) {
      // Basic fallback if empty
      const finalRole = signUpRole || "pemagang";
      const finalName = signUpName || "Pengguna Baru";
      const finalEmail = signUpEmail || "baru@gmail.com";

      // Check user existence in mock database
      const usersListStr = localStorage.getItem("sipantau_users") || "[]";
      const usersList = JSON.parse(usersListStr);
      
      const newUser = {
        email: finalEmail,
        password: signUpPassword || "12345678",
        name: finalName,
        phone: signUpPhone || "08123456789",
        address: signUpAddress || "-",
        institution: signUpInstitution || "-",
        major: signUpMajor || "-",
        role: finalRole,
        status: "pending" // New sign-ups are pending verification
      };
      
      if (!usersList.find(u => u.email.toLowerCase() === finalEmail.toLowerCase())) {
        usersList.push(newUser);
        localStorage.setItem("sipantau_users", JSON.stringify(usersList));
      }

      // Save active session state
      localStorage.setItem("sipantau_role", finalRole);
      localStorage.setItem("sipantau_name", finalName);
      localStorage.setItem("sipantau_email", finalEmail);

      // Redirect to verification view
      router.push("/verification");
    } else {
      // Validation for empty inputs
      if (!signInEmail || !signInPassword) {
        setLoginError(true);
        return;
      }

      // Lookup user in mock database
      const usersListStr = localStorage.getItem("sipantau_users") || "[]";
      const usersList = JSON.parse(usersListStr);
      const foundUser = usersList.find(u => u.email.toLowerCase() === signInEmail.toLowerCase() && u.password === signInPassword);

      if (foundUser) {
        localStorage.setItem("sipantau_role", foundUser.role);
        localStorage.setItem("sipantau_name", foundUser.name);
        localStorage.setItem("sipantau_email", foundUser.email);
        
        if (foundUser.status === "pending" || foundUser.status === "rejected") {
          router.push("/verification");
        } else {
          router.push("/dashboard");
        }
      } else {
        setLoginError(true);
      }
    }
  };

  return (
    <div className="w-full max-w-[480px] h-[600px] bg-white p-6 sm:p-10 flex flex-col rounded-[2.5rem] shadow-xl border border-slate-100/50">
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
          Hi, Selamat Datang <span className="animate-bounce">👋</span>
        </h2>
      </div>

      {/* Tabs Selector */}
      <div className="bg-slate-200/80 p-1.5 rounded-full flex relative mb-8 w-full">
        {/* Sliding background */}
        <div 
          className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-md transition-all duration-300 ease-in-out ${
            isSignUp ? "left-[calc(50%+3px)]" : "left-1.5"
          }`}
        />
        
        <button
          type="button"
          onClick={() => {
            setIsSignUp(false);
            setStatusMessage(null);
          }}
          className={`relative z-10 flex-1 text-center py-2.5 rounded-full text-sm font-bold transition-colors duration-300 ${
            !isSignUp ? "text-violet-700" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setIsSignUp(true);
            setStatusMessage(null);
          }}
          className={`relative z-10 flex-1 text-center py-2.5 rounded-full text-sm font-bold transition-colors duration-300 ${
            isSignUp ? "text-violet-700" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Sign Up
        </button>
      </div>



      {/* Authentication Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pr-1 space-y-5 transition-all duration-300">
          {!isSignUp ? (
          /* ==========================================
             SIGN IN FORM
             ========================================== */
          <div className="space-y-4">
            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Alamat Email
              </label>
              <input
                type="email"
                value={signInEmail}
                onChange={(e) => {
                  setSignInEmail(e.target.value);
                  if (loginError) setLoginError(false);
                }}
                placeholder="nama@email.com"
                className={`w-full border rounded-full px-5 py-3 text-sm outline-none transition-all duration-200 ${
                  loginError
                    ? "border-rose-400 bg-rose-50/50 text-rose-600 placeholder-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    : "border-slate-200 bg-slate-50/30 text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                }`}
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={signInPassword}
                  onChange={(e) => {
                    setSignInPassword(e.target.value);
                    if (loginError) setLoginError(false);
                  }}
                  placeholder="Masukkan password"
                  className={`w-full border rounded-full pl-5 pr-20 py-3 text-sm outline-none transition-all duration-200 ${
                    loginError
                      ? "border-rose-400 bg-rose-50/50 text-rose-600 placeholder-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-200 bg-slate-50/30 text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {loginError && (
                    <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`${loginError ? "text-rose-400 hover:text-rose-600" : "text-slate-400 hover:text-slate-600"} transition-colors duration-150 p-1`}
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
              {loginError && (
                <p className="text-[10px] text-rose-500 font-medium pl-2 mt-0.5">Password atau akun tidak valid</p>
              )}
            </div>
          </div>
        ) : (
          /* ==========================================
             SIGN UP FORM
             ========================================== */
          <div className="space-y-4">
            {/* Nama Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Nama
              </label>
              <input
                type="text"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="w-full border border-slate-200 bg-slate-50/30 rounded-full px-5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                required
              />
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Email
              </label>
              <input
                type="email"
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full border border-slate-200 bg-slate-50/30 rounded-full px-5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                required
              />
            </div>

            {/* Nomor Telepon Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Nomor Telepon
              </label>
              <input
                type="tel"
                value={signUpPhone}
                onChange={(e) => {
                  const val = e.target.value;
                  setSignUpPhone(val);
                  if (val && !/^\d+$/.test(val)) {
                    setPhoneError("Nomor telepon hanya boleh berisi angka (tidak boleh huruf/simbol)!");
                  } else {
                    setPhoneError("");
                  }
                }}
                placeholder="Contoh: 08123456789"
                className="w-full border border-slate-200 bg-slate-50/30 rounded-full px-5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                required
              />
              {phoneError && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold px-2">
                  {phoneError}
                </p>
              )}
            </div>

            {/* Alamat Rumah Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Alamat Rumah
              </label>
              <input
                type="text"
                value={signUpAddress}
                onChange={(e) => setSignUpAddress(e.target.value)}
                placeholder="Masukkan alamat lengkap"
                className="w-full border border-slate-200 bg-slate-50/30 rounded-full px-5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                required
              />
            </div>

            {/* Role Radio buttons */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Role
              </label>
              <div className="flex items-center gap-6 mt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="signUpRole"
                    value="pemagang"
                    checked={signUpRole === "pemagang"}
                    onChange={() => {
                      setSignUpRole("pemagang");
                      if (signUpInstitution === "BPS Kota Semarang") {
                        setSignUpInstitution("");
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    signUpRole === "pemagang" ? "border-violet-600 bg-white" : "border-slate-300 group-hover:border-slate-400"
                  }`}>
                    {signUpRole === "pemagang" && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Pemagang</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="signUpRole"
                    value="mentor"
                    checked={signUpRole === "mentor"}
                    onChange={() => {
                      setSignUpRole("mentor");
                      setSignUpInstitution("BPS Kota Semarang");
                      setSignUpMajor("");
                    }}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    signUpRole === "mentor" ? "border-violet-600 bg-white" : "border-slate-300 group-hover:border-slate-400"
                  }`}>
                    {signUpRole === "mentor" && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Mentor</span>
                </label>
              </div>
            </div>

            {/* Asal Instansi Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Asal Instansi
              </label>
              <input
                type="text"
                value={signUpInstitution}
                onChange={(e) => setSignUpInstitution(e.target.value)}
                readOnly={signUpRole === "mentor"}
                placeholder={signUpRole === "mentor" ? "BPS Kota Semarang" : "Masukkan nama universitas / instansi"}
                className={`w-full border rounded-full px-5 py-2.5 text-sm text-slate-800 outline-none focus:ring-1 transition-all duration-200 ${
                  signUpRole === "mentor" 
                    ? "border-slate-200 bg-slate-100/70 text-slate-500 cursor-not-allowed" 
                    : "border-slate-200 bg-slate-50/30 placeholder-slate-400 focus:border-violet-500 focus:ring-violet-500"
                }`}
                required
              />
            </div>

            {/* Jurusan / Jabatan Field */}
            {signUpRole !== "mentor" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                  <span className="text-rose-500 font-bold">*</span> Jurusan
                </label>
                <input
                  type="text"
                  value={signUpMajor}
                  onChange={(e) => setSignUpMajor(e.target.value)}
                  placeholder="Contoh: Teknik Komputer"
                  className="w-full border border-slate-200 bg-slate-50/30 rounded-full px-5 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                  required
                />
              </div>
            )}

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-0.5">
                <span className="text-rose-500 font-bold">*</span> Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full border border-slate-200 bg-slate-50/30 rounded-full pl-5 pr-12 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-200"
                  required
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
          </div>
        )}
        </div> {/* Close overflow-y-auto container */}

        {/* Submit Button */}
        <div className="pt-4 mt-auto">
          <button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-violet-100 hover:shadow-violet-200 transition-all duration-200 text-sm cursor-pointer"
          >
            {isSignUp ? "Daftar" : "Log In"}
          </button>
        </div>
      </form>
    </div>
  );
}
