"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, getActiveUser, getProfile, signOutUser } from "../backend/auth";

export default function VerificationStatus() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const activeSbUser = await getActiveUser();
        if (activeSbUser) {
          const profile = await getProfile(activeSbUser.id);
          if (profile) {
            setUser(profile);
            const originalName = profile.full_name || "";
            setEditData({
              name: originalName === "DELETED_USER" ? "" : originalName,
              address: profile.address || "",
              phone: profile.phone || "",
              institution: profile.institution || "",
              major: profile.major || "",
              role: profile.role || "pemagang",
            });
            if (profile.status === "active") {
              router.push("/dashboard");
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Supabase fetch failed:", err);
      }
      router.push("/");
    };

    if (typeof window !== "undefined") {
      fetchUser();
    }
  }, [router]);

  if (!user) return null;

  const isPending = user.status === "pending";



  const handleReapply = async () => {
    if (!user) return;
    
    // If not in editing mode yet, just enter edit mode
    if (!isEditing) {
      setIsEditing(true);
      return;
    }

    setIsUpdating(true);
    
    try {
      const updates = { 
        status: "pending",
        full_name: editData.name,
        address: editData.address,
        phone: editData.phone,
        institution: editData.institution,
        major: editData.major,
        role: editData.role
      };

      // 1. Update ke Supabase
      if (user.id && typeof user.id === 'string' && user.id.includes('-')) {
        await updateProfile(user.id, updates);
      }
      
      // 2. Ubah State Lokal & kembalikan view
      setUser({ ...user, ...updates, full_name: editData.name });
      setIsEditing(false);
       
    } catch (err) {
      console.error("Gagal melakukan pengajuan ulang:", err);
      alert("Gagal mengirim ulang pendaftaran.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBack = async () => {
    try { await signOutUser(); } catch (e) {}
    router.push("/");
  };

  return (
    <div className="w-full max-w-[420px] lg:h-[650px] flex flex-col justify-center items-center relative py-4 lg:py-0">

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
          {isPending 
            ? "Verifikasi Diperlukan" 
            : user.status === "deleted" 
              ? "Akun Dihapus" 
              : "Verifikasi Ditolak"}
        </h2>
        <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
          {isPending
            ? "Akun Anda saat ini sedang berada dalam antrean peninjauan oleh Admin."
            : user.status === "deleted"
              ? "Akun Anda telah dihapus oleh Admin dari sistem SIPANTAU."
              : "Pendaftaran akun Anda ditolak oleh admin karena terdapat ketidaksesuaian."
          }
        </p>
      </div>

      {/* Status Badge */}
      <div className="mb-8">
        <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${
          isPending ? "bg-amber-100/50 text-amber-500" : "bg-rose-100/50 text-rose-500"
        }`}>
          {isPending 
            ? "Status: Menunggu Persetujuan" 
            : user.status === "deleted" 
              ? "Status: Dihapus" 
              : "Status: Pendaftaran Ditolak"}
        </span>
      </div>

      {/* User Details Card */}
      <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <h3 className="text-xs font-bold text-slate-800 mb-5">Detail Profil</h3>
        <div className="grid grid-cols-2 gap-y-5 gap-x-4">

          {/* Nama */}
          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Nama</p>
              <div className="min-h-[36px] flex items-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-indigo-300 focus:border-indigo-600 outline-none pb-0.5 bg-transparent"
                  />
                ) : (
                  <p className="text-xs font-bold text-slate-800 truncate">{user.name || user.full_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Alamat Rumah */}
          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Alamat Rumah</p>
              <div className="min-h-[36px] flex items-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.address}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-indigo-300 focus:border-indigo-600 outline-none pb-0.5 bg-transparent"
                  />
                ) : (
                  <p className="text-xs font-bold text-slate-800 truncate">{user.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Email</p>
              <div className="min-h-[36px] flex items-center">
                <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Asal Instansi */}
          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Asal Instansi</p>
              <div className="min-h-[36px] flex items-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.institution}
                    onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-indigo-300 focus:border-indigo-600 outline-none pb-0.5 bg-transparent"
                  />
                ) : (
                  <p className="text-xs font-bold text-slate-800 truncate">{user.institution}</p>
                )}
              </div>
            </div>
          </div>

          {/* Nomor Telepon */}
          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Nomor Telepon</p>
              <div className="min-h-[36px] flex items-center">
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.phone}
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-indigo-300 focus:border-indigo-600 outline-none pb-0.5 bg-transparent"
                  />
                ) : (
                  <p className="text-xs font-bold text-slate-800">{user.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role / Peran */}
          <div className="flex items-start gap-3">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-slate-400 font-bold mb-0.5">Peran</p>
              <div className="min-h-[36px] flex items-center">
                {isEditing ? (
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="w-full text-xs font-bold text-slate-800 border-b border-indigo-300 focus:border-indigo-600 outline-none pb-0.5 bg-transparent"
                  >
                    <option value="pemagang">Pemagang</option>
                    <option value="mentor">Mentor</option>
                  </select>
                ) : (
                  <p className="text-xs font-bold text-slate-800 capitalize">{user.role}</p>
                )}
              </div>
            </div>
          </div>

          {/* Jurusan */}
          {(isEditing ? editData.role !== "mentor" : user.role !== "mentor") && (
            <div className="flex items-start gap-3">
              <div className="text-indigo-500 mt-0.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-bold mb-0.5">Jurusan</p>
                <div className="min-h-[36px] flex items-center">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.major}
                      onChange={(e) => setEditData({ ...editData, major: e.target.value })}
                      className="w-full text-xs font-bold text-slate-800 border-b border-indigo-300 focus:border-indigo-600 outline-none pb-0.5 bg-transparent"
                    />
                  ) : (
                    <p className="text-xs font-bold text-slate-800 truncate">{user.major || "-"}</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex-col gap-3 flex mt-4">
        {!isPending && (
          <button
            onClick={handleReapply}
            disabled={isUpdating}
            className={`w-full text-white font-bold py-3.5 px-6 rounded-full shadow-lg transition-all duration-200 text-sm cursor-pointer text-center disabled:opacity-70 flex items-center justify-center gap-2 ${
              isEditing 
                ? 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 shadow-emerald-100/50 hover:shadow-emerald-200' 
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 shadow-blue-100/50 hover:shadow-blue-200'
            }`}
          >
            {isUpdating ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isEditing ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              )
            )}
            {isEditing ? "Simpan & Kirim Ulang" : "Koreksi & Ajukan Ulang Pendaftaran"}
          </button>
        )}
        {isEditing ? (
          <button
            onClick={() => setIsEditing(false)}
            disabled={isUpdating}
            className="w-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 font-bold py-3.5 px-6 rounded-full transition-all duration-200 text-sm cursor-pointer text-center"
          >
            Batal Koreksi
          </button>
        ) : (
          <button
            onClick={handleBack}
            className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-violet-100 hover:shadow-violet-200 transition-all duration-200 text-sm cursor-pointer text-center"
          >
            Kembali ke Halaman Login
          </button>
        )}
      </div>

    </div>
  );
}
