"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerificationStatus() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeEmail = localStorage.getItem("sipantau_email");
      if (!activeEmail) {
        router.push("/");
        return;
      }
      
      const usersListStr = localStorage.getItem("sipantau_users") || "[]";
      const usersList = JSON.parse(usersListStr);
      const foundUser = usersList.find(u => u.email.toLowerCase() === activeEmail.toLowerCase());
      
      if (foundUser) {
        setUser(foundUser);
        setName(foundUser.name || "");
        setEmail(foundUser.email || "");
        setPhone(foundUser.phone || "");
        setAddress(foundUser.address || "");
        setInstitution(foundUser.institution || "");
        setMajor(foundUser.major || "");

        // If approved somehow, redirect them to dashboard
        if (foundUser.status === "approved") {
          router.push("/dashboard");
        }
      } else {
        router.push("/");
      }
    }
  }, [router]);

  if (!user) return null;

  const isPending = user.status === "pending";

  const handleBack = () => {
    localStorage.removeItem("sipantau_role");
    localStorage.removeItem("sipantau_name");
    localStorage.removeItem("sipantau_email");
    router.push("/");
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    if (!name || !phone || !address || !institution) {
      setToast({ type: "error", message: "Semua field wajib diisi!" });
      setTimeout(() => setToast(null), 3000);
      return;
    }
    if (phone.length < 10) {
      setToast({ type: "error", message: "Nomor telepon minimal 10 angka!" });
      setTimeout(() => setToast(null), 3000);
      return;
    }

    // Update in mock database list
    const usersStr = localStorage.getItem("sipantau_users") || "[]";
    let usersList = JSON.parse(usersStr);
    const userIndex = usersList.findIndex((u) => u.email === user.email);
    
    if (userIndex !== -1) {
      usersList[userIndex] = {
        ...usersList[userIndex],
        name,
        email,
        phone,
        address,
        institution,
        major
      };
      localStorage.setItem("sipantau_users", JSON.stringify(usersList));
      
      // Update local session if email changed
      if (email !== user.email) {
        localStorage.setItem("sipantau_email", email);
      }

      const updatedUser = usersList[userIndex];
      setUser(updatedUser);
      
      // Update session values
      localStorage.setItem("sipantau_name", name);

      setToast({ type: "success", message: "Perubahan profil berhasil disimpan!" });
      setTimeout(() => setToast(null), 3000);
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] bg-[#f4f4f5] flex flex-col items-center justify-center relative p-6 sm:p-8 rounded-3xl">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
        }`}>
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Icon */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border-2 ${
        isPending ? "bg-amber-50 border-amber-100 text-amber-500" : "bg-rose-50 border-rose-100 text-rose-500"
      }`}>
        {isPending ? (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>

      {/* Title & Desc */}
      <div className="text-center space-y-3 mb-8">
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          {isPending ? "Verifikasi Diperlukan" : "Verifikasi Ditolak"}
        </h2>
        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
          {isPending 
            ? "Akun Anda saat ini sedang berada dalam antrean peninjauan oleh Admin."
            : "Pendaftaran akun Anda ditolak oleh admin karena terdapat ketidaksesuaian."
          }
        </p>
      </div>

      {/* Badge */}
      <div className="mb-10">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
          isPending ? "bg-amber-100/50 text-amber-500" : "bg-rose-100/50 text-rose-500"
        }`}>
          {isPending ? "Status: Menunggu Persetujuan" : "Status: Pendaftaran Ditolak"}
        </span>
      </div>

      {/* User Details Card */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <h3 className="text-xs font-bold text-slate-800 mb-5">Detail Profil</h3>
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">
          
          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Nama</p>
              {isEditing ? (
                <input
                  key="name-edit"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full min-h-[36px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                />
              ) : (
                <div key="name-view" className="min-h-[36px] flex items-center">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Alamat Rumah</p>
              {isEditing ? (
                <input
                  key="address-edit"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full min-h-[36px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                />
              ) : (
                <div key="address-view" className="min-h-[36px] flex items-center">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.address}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Email</p>
              {isEditing ? (
                <input
                  key="email-edit"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[36px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                />
              ) : (
                <div className="min-h-[36px] flex items-center">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Asal Instansi</p>
              {isEditing ? (
                <input
                  key="institution-edit"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full min-h-[36px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                />
              ) : (
                <div key="institution-view" className="min-h-[36px] flex items-center">
                  <p className="text-xs font-bold text-slate-800 truncate">{user.institution}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Nomor Telepon</p>
              {isEditing ? (
                <input
                  key="phone-edit"
                  type="text"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) setPhone(val);
                  }}
                  maxLength={14}
                  className="w-full min-h-[36px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                />
              ) : (
                <div key="phone-view" className="min-h-[36px] flex items-center">
                  <p className="text-xs font-bold text-slate-800">{user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {user.role !== "mentor" && (
            <div className="flex items-start gap-3">
              <div className="text-indigo-500 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-bold mb-0.5">Jurusan</p>
                {isEditing ? (
                  <input
                    key="major-edit"
                    type="text"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full min-h-[36px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                  />
                ) : (
                  <div key="major-view" className="min-h-[36px] flex items-center">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.major || "-"}</p>
                  </div>
                )}
              </div>
            </div>
          )}

      </div>

      {/* Action Buttons */}
      <div className="w-full flex gap-3">
        {isPending ? (
          <>
            <button
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setName(user.name || "");
                  setEmail(user.email || "");
                  setPhone(user.phone || "");
                  setAddress(user.address || "");
                  setInstitution(user.institution || "");
                  setMajor(user.major || "");
                } else {
                  setIsEditing(true);
                }
              }}
              className={`flex-1 font-bold py-3 px-4 rounded-full transition-all duration-200 text-xs cursor-pointer text-center ${
                isEditing 
                  ? "bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700"
                  : "bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm"
              }`}
            >
              {isEditing ? "Batalkan" : "Ubah Detail Profil"}
            </button>

            <button
              onClick={isEditing ? handleSaveChanges : null}
              disabled={!isEditing}
              className={`flex-1 font-bold py-3 px-4 rounded-full transition-all duration-200 text-xs text-center ${
                isEditing
                  ? "bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white shadow-lg shadow-violet-100 hover:shadow-violet-200 cursor-pointer"
                  : "bg-violet-300 text-white cursor-not-allowed opacity-70"
              }`}
            >
              Simpan Perubahan
            </button>

            {!isEditing && (
              <button
                onClick={handleBack}
                className="flex-1 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold py-3 px-4 rounded-full transition-all duration-200 text-xs cursor-pointer text-center"
              >
                Kembali
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleBack}
            className="w-full bg-slate-200 hover:bg-slate-300 active:bg-slate-400 text-slate-700 font-bold py-3 px-4 rounded-full transition-all duration-200 text-xs cursor-pointer text-center"
          >
            Kembali
          </button>
        )}
      </div>
    </div>
    </div>
  );
}
