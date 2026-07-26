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
        if (profile.status === 'rejected' && profile.full_name === 'DELETED_USER') {
          await signOutUser().catch(() => {});
          localStorage.clear();
          router.push("/");
          return;
        }
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close menu when route changes on mobile
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || "User")}&background=f1f5f9&color=64748b&bold=true`;

  return (
    <div className="h-screen w-screen bg-[#f4f4f5] flex flex-col md:flex-row font-sans overflow-hidden relative">
      
      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0 z-40 relative shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 -ml-1.5 rounded-xl text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <span className="font-extrabold text-slate-800 tracking-tight text-lg">SIPANTAU</span>
        </div>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
          <img src={avatar || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* ================= MOBILE MENU OVERLAY ================= */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[90] md:hidden transition-opacity" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[100] transform ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 w-64 md:w-64 bg-[#f4f4f5] md:bg-transparent shrink-0 flex flex-col justify-between py-5 md:py-3 pl-4 pr-3 h-full transition-transform duration-300 shadow-2xl md:shadow-none bg-white md:bg-transparent`}
      >
        <div className="space-y-8">
          {/* Mobile Close Button & Desktop Avatar Link */}
          <div className="flex items-center justify-between pl-1 pr-2 md:pr-0">
            {userRole === "admin" ? (
              <div className="hidden md:block w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md">
                <img src={avatar || defaultAvatar} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <Link 
                href="/dashboard/settings" 
                className="hidden md:block w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <img src={avatar || defaultAvatar} alt="User Avatar" className="w-full h-full object-cover" />
              </Link>
            )}

            {/* Mobile close button inside drawer */}
            <div className="md:hidden flex items-center gap-3">
               <div className="w-10 h-10 rounded-full overflow-hidden border shadow-sm">
                  <img src={avatar || defaultAvatar} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">{userName}</span>
                  <span className="text-[10px] font-semibold text-slate-400 capitalize">{userRole}</span>
               </div>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 mt-4 md:mt-0">
            {navItems.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href) && !pathname.startsWith("/dashboard/settings");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-sm transition-all duration-200 ${isActive
                    ? "bg-violet-50 md:bg-white text-slate-900 md:border md:border-slate-100 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 md:hover:bg-white/50"
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
        <div className="space-y-1 border-t border-slate-200/60 pt-4 mt-auto">
          {userRole !== "admin" && (
            <Link
              href="/dashboard/settings"
              className={`group w-full flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold text-sm transition-all duration-200 ${pathname?.startsWith("/dashboard/settings")
                ? "bg-violet-50 md:bg-white text-slate-900 md:border md:border-slate-100 shadow-sm font-bold"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 md:hover:bg-white/50"
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

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 py-4 px-2 md:px-0 md:py-3 md:pr-3 min-w-0 h-full flex flex-col sm:pt-4 md:pt-3">
        <div className={`bg-white rounded-3xl md:rounded-[2.5rem] shadow-xl border border-slate-100 flex-1 p-4 md:p-6 lg:p-8 flex flex-col ${pathname === "/dashboard/accounts" ? "overflow-hidden" : "overflow-y-auto"}`}>
          {children}
        </div>
      </main>

      {/* ================= LOGOUT CONFIRMATION MODAL ================= */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
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
