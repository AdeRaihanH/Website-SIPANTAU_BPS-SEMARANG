"use client";

import React, { useState, useEffect, useRef } from "react";
import { getActiveUser, getProfile, updateProfile } from "../../../backend/auth";

export default function SettingsPage() {
  const fileInputRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [institution, setInstitution] = useState("");
  const [major, setMajor] = useState("");
  const [avatar, setAvatar] = useState("");
  const [role, setRole] = useState("pemagang");

  const [toast, setToast] = useState(null);

  const loadUser = async () => {
    try {
      const activeUser = await getActiveUser();
      if (activeUser) {
        const profile = await getProfile(activeUser.id);
        if (profile) {
          setCurrentUser(profile);
          setName(profile.full_name || "");
          setEmail(profile.email || "");
          setPhone(profile.phone || "");
          setAddress(profile.address || "");
          setInstitution(profile.institution || "");
          setMajor(profile.major || "");
          setRole(profile.role || "pemagang");
          setAvatar(profile.avatar_url || "");
        }
      }
    } catch (e) {
      console.error("Gagal memuat profil:", e);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setAvatar(base64String);

        if (currentUser && currentUser.id) {
          try {
            await updateProfile(currentUser.id, { avatar_url: base64String });
            window.dispatchEvent(new Event("sipantau-avatar-updated"));
          } catch (error) {
            console.error("Failed to update avatar", error);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!name || !phone || !address || !institution) {
      setToast({ type: "error", message: "Semua field wajib diisi!" });
      return;
    }
    if (phone.length < 10) {
      setToast({ type: "error", message: "Nomor telepon minimal 10 angka!" });
      return;
    }

    if (!currentUser || !currentUser.id) return;

    try {
      await updateProfile(currentUser.id, {
        full_name: name,
        phone,
        address,
        institution,
        major
      });

      // Dispatch event to update sidebar display name
      window.dispatchEvent(new Event("sipantau-profile-updated"));

      setToast({ type: "success", message: "Perubahan profil berhasil disimpan!" });
      setTimeout(() => setToast(null), 3000);
      setIsEditing(false);
    } catch (error) {
      setToast({ type: "error", message: "Gagal menyimpan perubahan: " + error.message });
    }
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=f1f5f9&color=64748b&bold=true`;

  return (
    <div className="relative space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold transition-all duration-300 flex items-center gap-2 ${toast.type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
          }`}>
          <span>{toast.type === "success" ? "✓" : "⚠️"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-500 to-indigo-600 rounded-3xl p-6 text-white relative overflow-hidden min-h-[140px] flex flex-col justify-center">
        <h1 className="text-xl font-extrabold tracking-tight">Pengaturan</h1>
        <p className="text-xs font-medium text-violet-100/90 mt-1">Simpan perubahan profil Anda.</p>

        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
      </div>

      {/* Profile Avatar Header */}
      <div className="flex flex-col items-start px-4 -mt-14 relative z-10 space-y-3">
        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-slate-100">
          <img
            key={avatar}
            src={avatar || defaultAvatar}
            alt="Avatar Profile"
            className="w-full h-full object-cover"
          />
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-white text-[10px] shadow-md hover:scale-110 active:scale-95 transition-all">
            📷
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <div>
          <h2 className="text-lg font-extrabold text-slate-800 leading-tight">{name || "User Name"}</h2>
          <p className="text-xs font-bold text-slate-400 capitalize">{role}</p>
        </div>
      </div>

      {/* Profile Details Form Card */}
      <form onSubmit={handleSaveChanges} className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden mb-6 relative z-10">
        <div className="px-6 py-4 border-b border-slate-50">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Detail Profil</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Nama & Email */}
          <div className="space-y-5">
            {/* Nama */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Nama</label>
                {isEditing ? (
                  <input
                    key="name-edit"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full min-h-[32px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                  />
                ) : (
                  <div key="name-view" className="min-h-[32px] flex items-center">
                    <p className="text-xs font-bold text-slate-800 p-0 m-0 border-0 leading-tight">{name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Email</label>
                {isEditing ? (
                  <input
                    key="email-edit"
                    type="email"
                    value={email}
                    disabled
                    className="w-full min-h-[32px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight cursor-not-allowed"
                  />
                ) : (
                  <div className="min-h-[32px] flex items-center">
                    <p className="text-xs font-bold text-slate-800 p-0 m-0 border-0 leading-tight">{email}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: Nomor Telepon & Alamat Rumah */}
          <div className="space-y-5">
            {/* Nomor Telepon */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Nomor Telepon</label>
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
                    className="w-full min-h-[32px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                  />
                ) : (
                  <div key="phone-view" className="min-h-[32px] flex items-center">
                    <p className="text-xs font-bold text-slate-800 p-0 m-0 border-0 leading-tight">{phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Alamat Rumah */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Alamat Rumah</label>
                {isEditing ? (
                  <input
                    key="address-edit"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full min-h-[32px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                  />
                ) : (
                  <div key="address-view" className="min-h-[32px] flex items-center">
                    <p className="text-xs font-bold text-slate-800 p-0 m-0 border-0 leading-tight pr-10">{address}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Asal Instansi & Jurusan */}
          <div className="space-y-5">
            {/* Asal Instansi */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">Asal Instansi</label>
                {isEditing ? (
                  <input
                    key="institution-edit"
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full min-h-[32px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                  />
                ) : (
                  <div key="institution-view" className="min-h-[32px] flex items-center">
                    <p className="text-xs font-bold text-slate-800 p-0 m-0 border-0 leading-tight">{institution}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Jurusan */}
            {role !== "mentor" && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 mt-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-none">
                    Jurusan
                  </label>
                  {isEditing ? (
                    <input
                      key="major-edit"
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      className="w-full min-h-[32px] text-xs font-bold text-slate-500 bg-transparent border-0 p-0 m-0 outline-none focus:ring-0 focus:text-violet-600 transition-colors leading-tight"
                    />
                  ) : (
                    <div key="major-view" className="min-h-[32px] flex items-center">
                      <p className="text-xs font-bold text-slate-800 p-0 m-0 border-0 leading-tight">{major || "-"}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center pb-6 pt-4 border-t border-slate-50 bg-slate-50/30">
          {isEditing ? (
            <button
              type="button"
              onClick={handleSaveChanges}
              className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white transition-all shadow-md shadow-violet-100 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Simpan Perubahan
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsEditing(true);
              }}
              className="px-8 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-xs font-bold text-white transition-all shadow-md shadow-violet-100 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Ubah Detail Profil
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
