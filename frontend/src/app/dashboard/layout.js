"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getActiveUser, getProfile, signOutUser } from "../../backend/auth";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Profile states
  const [avatar, setAvatar] = useState("");
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("pemagang");

  const loadUserProfile = async () => {
    try {
      const user = await getActiveUser();
      if (!user) {
        const localRole = localStorage.getItem("sipantau_role");
        const localName = localStorage.getItem("sipantau_name");
        if (localRole) {
          setUserRole(localRole.toLowerCase());
          setUserName(localName || "User");
        }
        return;
      }
      const profile = await getProfile(user.id);
      if (profile) {
        setUserName(profile.full_name || profile.name || "User");
        setUserRole(profile.role ? profile.role.toLowerCase() : "pemagang");
        setAvatar(profile.avatar_url || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      const localRole = localStorage.getItem("sipantau_role");
      const localName = localStorage.getItem("sipantau_name");
      if (localRole) {
        setUserRole(localRole.toLowerCase());
        setUserName(localName || "User");
      }
    }
  };

  useEffect(() => {
    loadUserProfile();

    window.addEventListener("sipantau-avatar-updated", loadUserProfile);
    window.addEventListener("sipantau-profile-updated", loadUserProfile);

    return () => {
      window.removeEventListener("sipantau-avatar-updated", loadUserProfile);
      window.removeEventListener("sipantau-profile-updated", loadUserProfile);
    };
  }, []);

  const baseNavItems = [
    {
      href: "/dashboard",
      label: "Beranda",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: "/dashboard/team",
      label: "Team",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
  ];

  const navItems = userRole === "admin"
    ? [
      ...baseNavItems,
      {
        href: "/dashboard/accounts",
        label: "Akun",
        icon: (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        )
      }
    ]
    : baseNavItems;

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=f1f5f9&color=64748b&bold=true`;

  return (
    <div className="h-screen w-screen bg-[#f4f4f5] flex font-sans overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col justify-between py-3 pl-4 pr-3 h-full">
        <div className="space-y-8">
          {/* Avatar Link */}
          {userRole === "admin" ? (
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md block">
              <img
                src={avatar || defaultAvatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <Link
              href="/dashboard/settings"
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200 block cursor-pointer"
            >
              <img
                src={avatar || defaultAvatar}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </Link>
          )}

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
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-sm transition-all duration-200 ${isActive
                    ? "bg-white text-slate-900 border border-slate-100 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                    }`}
                >
                  <span className={`text-lg transition-colors duration-200 ${isActive ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"}`}>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Nav */}
        <div className="space-y-1 border-t border-slate-200/60 pt-4">
          {userRole !== "admin" && (
            <Link
              href="/dashboard/settings"
              className={`group w-full flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-sm transition-all duration-200 ${pathname?.startsWith("/dashboard/settings")
                ? "bg-white text-slate-900 border border-slate-100 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
            >
              <span className={`text-lg transition-colors duration-200 ${pathname?.startsWith("/dashboard/settings") ? "text-violet-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span>Pengaturan</span>
            </Link>
          )}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-2xl px-4 py-2.5 font-semibold text-sm transition-all duration-200 text-left cursor-pointer group"
          >
            <svg className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-rose-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 py-3 pr-3 min-w-0 h-full flex flex-col">
        <div className={`bg-white rounded-[2.5rem] shadow-xl border border-slate-100 flex-1 p-6 sm:p-8 flex flex-col ${pathname === "/dashboard/accounts" ? "overflow-hidden" : "overflow-y-auto"}`}>
          {children}
        </div>
      </main>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl space-y-5 border border-slate-100 transform scale-100 transition-all duration-300 animate-in fade-in zoom-in-95">
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
