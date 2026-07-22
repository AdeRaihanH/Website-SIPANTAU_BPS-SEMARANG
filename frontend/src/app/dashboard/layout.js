"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getActiveUser, getProfile, signOutUser } from "../../backend/auth";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);

  // Profile states
  const [avatar, setAvatar] = useState("");
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("pemagang");

  const loadUserProfile = async () => {
    try {
      const user = await getActiveUser();
      if (!user) {
        // Fallback check: if there's evidence they are logged in, don't kick them out yet
        const localName = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
        if (!localName) {
          router.push("/");
        }
        return;
      }
      const profile = await getProfile(user.id);
      if (profile) {
        setUserName(profile.full_name || "User");
        setUserRole(profile.role ? profile.role.toLowerCase() : "pemagang");
        setAvatar(profile.avatar_url || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  useEffect(() => {
    loadUserProfile();

    // Event listeners to handle profile/avatar updates instantly
    window.addEventListener("sipantau-avatar-updated", loadUserProfile);
    window.addEventListener("sipantau-profile-updated", loadUserProfile);

    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("sipantau-avatar-updated", loadUserProfile);
      window.removeEventListener("sipantau-profile-updated", loadUserProfile);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const baseNavItems = [
    { href: "/dashboard", label: "Beranda", icon: "🏠" },
    { href: "/dashboard/team", label: "Team", icon: "👥" },
  ];

  const navItems = userRole === "admin"
    ? [...baseNavItems, { href: "/dashboard/accounts", label: "Akun", icon: "✅" }]
    : baseNavItems;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=f1f5f9&color=64748b&bold=true`;

  return (
    <div className="min-h-screen bg-[#f4f4f5] flex font-sans relative">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col justify-between py-6 px-4 sticky top-0 h-screen">
        <div className="space-y-8">
          {/* Avatar + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
            >
            <img
              key={avatar}
              src={avatar || defaultAvatar}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
            </button>

            {showDropdown && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50">
                {userRole === "admin" ? (
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50/50 flex items-center justify-between cursor-pointer"
                  >
                    <span>Keluar</span>
                    <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                ) : (
                  <>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <span>Pengaturan</span>
                      <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm("Apakah Anda yakin ingin menghapus semua tugas?")) alert("Semua tugas berhasil dihapus!");
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50/50 flex items-center justify-between border-t border-slate-50 cursor-pointer"
                    >
                      <span>Hapus Tugas</span>
                      <svg className="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href) && !pathname.startsWith("/dashboard/settings");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-sm transition-all duration-200 ${isActive
                      ? "bg-white text-slate-900 border border-slate-100 shadow-sm font-bold"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                    }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Nav */}
        <div className="space-y-1 border-t border-slate-200/60 pt-4">
          <Link
            href="/dashboard/settings"
            className={`w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 font-semibold text-sm transition-all duration-200 ${pathname === "/dashboard/settings"
                ? "bg-white text-slate-900 border border-slate-100 shadow-sm font-bold"
                : "text-slate-400 hover:text-slate-750"
              }`}
          >
            <span className="text-base">⚙️</span>
            <span>Pengaturan</span>
          </Link>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 text-slate-400 hover:text-rose-600 rounded-2xl px-4 py-2.5 font-semibold text-sm transition-all duration-200 text-left cursor-pointer"
          >
            <span className="text-base">🚪</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 py-6 pr-6 min-w-0">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 min-h-full p-6 sm:p-8">
          {children}
        </div>
      </main>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl space-y-5 border border-slate-100 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
            {/* Warning Triangle Icon */}
            <div className="mx-auto w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-sm font-bold text-slate-800">Logout Akun</h3>
              <p className="text-xs font-semibold text-slate-400">Anda akan keluar dari akun ini</p>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                Tidak, jangan keluar.
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOutUser();
                    // Fallback cleanup
                    localStorage.removeItem("sipantau_role");
                    localStorage.removeItem("sipantau_name");
                    localStorage.removeItem("sipantau_email");
                    router.push("/");
                  } catch (e) {
                    console.error("Logout error", e);
                    router.push("/");
                  }
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white transition-colors cursor-pointer shadow-md shadow-rose-100"
              >
                Ya, keluar.
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
