"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userFullName, setUserFullName] = useState("User Name");
  const [userAvatar, setUserAvatar] = useState("");
  const [userRole, setUserRole] = useState("intern");
  const [adminUsers, setAdminUsers] = useState([]);
  const [personalLogs, setPersonalLogs] = useState([]);
  const logRef = useRef(null);

  // Helper to parse relative time strings
  const parseRelativeTime = (timeStr) => {
    if (!timeStr) return 9999;
    const s = timeStr.toLowerCase().trim();
    if (s === "baru saja" || s === "sekarang") return 0;
    if (s === "kemarin") return 1;
    const match = s.match(/^(\d+)\s+hari\s+lalu/);
    if (match) return parseInt(match[1]);
    return 999;
  };

  const loadPersonalLogs = (nameToMatch) => {
    if (!nameToMatch || typeof window === "undefined") return;
    
    const savedTeamsStr = localStorage.getItem("sipantau_teams");
    let teams = [{id: "1"}, {id: "2"}, {id: "3"}, {id: "4"}];
    if (savedTeamsStr) {
      try {
        teams = JSON.parse(savedTeamsStr);
      } catch (e) {}
    }
    
    let allTasks = [];
    teams.forEach(t => {
      const stored = localStorage.getItem(`sipantau_tasks_${t.id}`);
      if (stored) {
        try {
          allTasks = [...allTasks, ...JSON.parse(stored)];
        } catch(e) {}
      } else if (t.id === "1") {
        // Fallback to default tasks if not yet loaded in team page
        allTasks = [...allTasks, 
          { id: 1, title: "Pembuatan UI/UX Website", riwayat: [{ name: "Aisha", text: "menambahkan desain referensi", time: "kemarin" }, { name: "Myesha Azka", text: "telah mengubah penerima tugas.", time: "2 hari lalu" }, { name: "Andi Basudara", text: "telah membuat penugasan ini", time: "3 hari lalu" }] },
          { id: 2, title: "Pembuatan Repository GitHub", riwayat: [{ name: "Citra Lestari", text: "melakukan inisiasi kode dasar", time: "kemarin" }, { name: "Andi Basudara", text: "telah membuat tugas ini", time: "2 hari lalu" }] },
          { id: 3, title: "Pembuatan Database ERD", riwayat: [{ name: "Eko Pratama", text: "telah meninjau struktur ERD", time: "2 hari lalu" }, { name: "Nurul Kumala", text: "telah merancang ERD awal", time: "4 hari lalu" }] },
          { id: 4, title: "Pembuatan Pitch Deck", riwayat: [{ name: "Andi Basudara", text: "telah menyelesaikan tugas ini", time: "3 hari lalu" }, { name: "Aisha", text: "melakukan revisi presentasi", time: "5 hari lalu" }] },
          { id: 5, title: "Testing & QA Aplikasi", riwayat: [{ name: "Nurul", text: "memeriksa daftar bug", time: "baru saja" }, { name: "Citra Lestari", text: "telah membuat skenario testing", time: "kemarin" }] },
          { id: 6, title: "Deploy ke Staging Server", riwayat: [{ name: "Myesha", text: "mengatur variabel environment", time: "kemarin" }, { name: "Eko Pratama", text: "telah mempersiapkan server", time: "2 hari lalu" }] }
        ];
      }
    });

    let myLogs = [];
    allTasks.forEach(task => {
      if (task.riwayat && Array.isArray(task.riwayat)) {
        task.riwayat.forEach(r => {
          if (r.name.toLowerCase() === nameToMatch.toLowerCase()) {
            myLogs.push({
              text: r.text,
              task: task.title,
              time: r.time,
              timestamp: r.timestamp
            });
          }
        });
      }
    });
    
    myLogs.sort((a, b) => {
      const timeDiff = parseRelativeTime(a.time) - parseRelativeTime(b.time);
      if (timeDiff !== 0) return timeDiff;
      if (a.timestamp && b.timestamp) return b.timestamp - a.timestamp;
      if (a.timestamp) return -1;
      if (b.timestamp) return 1;
      return 0;
    });
    const nextLogs = myLogs.slice(0, 20);
    setPersonalLogs(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(nextLogs)) return nextLogs;
      return prev;
    });
  };

  const loadProfile = () => {
    const name = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
    const email = typeof window !== "undefined" ? localStorage.getItem("sipantau_email") : null;
    const rawRole = typeof window !== "undefined" ? localStorage.getItem("sipantau_role") : null;
    const role = rawRole ? rawRole.toLowerCase() : null;

    if (role) setUserRole(role);
    if (name) {
      setUserName(name.split(" ")[0]);
      setUserFullName(name);
      loadPersonalLogs(name);
    }
    if (email) {
      const avatar = localStorage.getItem(`sipantau_avatar_${email.toLowerCase()}`);
      if (avatar) setUserAvatar(avatar);
    }

    // Load all users for admin view
    if (role === "admin" && typeof window !== "undefined") {
      const usersStr = localStorage.getItem("sipantau_users") || "[]";
      try {
        const parsed = JSON.parse(usersStr);
        setAdminUsers(prev => {
          if (JSON.stringify(prev) !== usersStr) return parsed;
          return prev;
        });
      } catch (e) {
        setAdminUsers([]);
      }
    }
  };

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  useEffect(() => {
    loadProfile();
    window.addEventListener("sipantau-profile-updated", loadProfile);
    window.addEventListener("sipantau-avatar-updated", loadProfile);
    
    // Also set up an interval to refresh logs automatically every 2 seconds
    // to catch any changes from background or other tabs without needing a hard reload
    const interval = setInterval(() => {
      loadProfile();
    }, 2000);

    const handleStorageChange = (e) => {
      if (e.key && (e.key.startsWith("sipantau_tasks_") || e.key.startsWith("sipantau_profile_"))) {
        loadProfile();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("sipantau-profile-updated", loadProfile);
      window.removeEventListener("sipantau-avatar-updated", loadProfile);
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [pathname]);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=f1f5f9&color=64748b&bold=true`;
  const avatarToUse = userAvatar || defaultAvatar;

  const handleDownloadPDF = () => {
    const logContent = logRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Log Aktivitas Pribadi - ${userFullName}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h3 { margin-bottom: 5px; }
            p { margin-top: 0; color: #666; font-size: 14px; }
            .log-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
            .log-info { display: flex; align-items: center; gap: 12px; }
            .log-info img { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; }
            .log-text { font-size: 14px; color: #444; }
            .log-text strong { color: #111; }
            .log-task { color: #5b21b6; font-weight: bold; }
            .log-time { font-size: 12px; color: #888; font-weight: bold; }
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div style="margin-bottom: 20px;">
            <h3>Log Aktivitas Pribadi</h3>
            <p>Informasi terbaru mengenai aktivitas yang telah Anda lakukan.</p>
          </div>
          ${logContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    // Use a slight delay to ensure images load
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <div className="flex flex-col justify-between min-h-full">
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Beranda</h1>
          <p className="text-sm text-slate-400 font-medium mt-1">Selamat datang kembali {userName}!</p>
        </div>

        {userRole === "admin" ? (
          <>
            {/* Welcome Banner - Admin */}
            <div className="w-full bg-[#8b5cf6] rounded-3xl p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="space-y-3 max-w-2xl">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Selamat Pagi, Admin!</h2>
                <p className="text-sm text-white/90 leading-relaxed font-medium">
                  &ldquo;Tanpa data, Anda hanyalah orang lain dengan pendapat.&rdquo; Mari bantu BPS menyediakan data berkualitas untuk Indonesia hari ini.
                </p>
                <button
                  onClick={() => router.push("/dashboard/accounts")}
                  className="mt-2 bg-white hover:bg-slate-50 text-violet-600 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all duration-200 cursor-pointer w-fit flex items-center gap-2"
                >
                  Lihat Akun Perlu Verifikasi <span className="text-lg leading-none">&rarr;</span>
                </button>
              </div>
            </div>

            {/* Stats Cards - Admin */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ), color: "violet", label: `${adminUsers.length} Akun`, desc: "Jumlah pendaftar SIPANTAU."
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ), color: "amber", label: `${adminUsers.filter(u => u.status === 'pending').length} Menunggu`, desc: "Akun perlu diverifikasi."
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ), color: "emerald", label: `${adminUsers.filter(u => u.status === 'approved').length} Disetujui`, desc: "Akun yang telah disetujui."
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ), color: "rose", label: `${adminUsers.filter(u => u.status === 'rejected').length} Ditolak`, desc: "Akun yang telah ditolak."
                },
              ].map((stat, idx) => (
                <div key={idx} className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-${stat.color}-100 text-${stat.color}-500 bg-${stat.color}-50`}>
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{stat.label}</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{stat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Log Akun - Admin */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-4">
                <h3 className="text-sm font-extrabold text-slate-800">Log Akun</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Informasi terbaru mengenai pendaftaran dan verifikasi akun SIPANTAU.</p>
              </div>

              <div className="divide-y divide-slate-50/80 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {[...adminUsers].reverse().slice(0, 10).map((u, index) => {
                  let text = "";
                  let roleText = "";
                  let statusText = "";
                  let color = "";

                  const currentStatus = u.status || "approved";

                  if (currentStatus === "pending") {
                    text = "mendaftar akun baru sebagai";
                    roleText = u.role === "mentor" ? "Mentor." : "Pemagang.";
                    statusText = "Menunggu";
                    color = "amber";
                  } else if (currentStatus === "rejected") {
                    text = "telah ditolak pendaftarannya.";
                    statusText = "Ditolak";
                    color = "rose";
                  } else {
                    // Default for approved or any unknown status
                    text = "telah disetujui pendaftarannya.";
                    statusText = "Disetujui";
                    color = "emerald";
                  }

                  const uAvatar = typeof window !== "undefined" ? localStorage.getItem(`sipantau_avatar_${u.email.toLowerCase()}`) || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=f1f5f9&color=64748b&bold=true` : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}`;

                  return (
                    <div key={index} className="flex items-center justify-between py-3.5">
                      <div className="flex items-center gap-4">
                        <img
                          src={uAvatar}
                          alt="Avatar"
                          className="w-9 h-9 rounded-full object-cover border border-slate-100 shrink-0"
                        />
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-slate-500 font-medium">
                            <strong className="text-slate-700 font-bold">{u.name}</strong> {text}{" "}
                            {roleText && <span className="text-violet-600 font-bold hover:underline cursor-pointer">{roleText}</span>}
                          </span>
                          <div className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-${color}-100 text-${color}-600`}>
                            {statusText}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 self-start mt-1">{u.signupDate || "15 Juli 2026, 08:10"}</span>
                    </div>
                  );
                })}

                {adminUsers.length === 0 && (
                  <div className="py-6 text-center text-sm font-semibold text-slate-400">Belum ada data pendaftar.</div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Welcome Banner - Intern/Mentor */}
            <div className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-violet-100 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden mb-8">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
              <div className="space-y-2 max-w-2xl relative z-10">
                <h2 className="text-lg sm:text-xl font-extrabold">Selamat Pagi, {userName}!</h2>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-medium">
                  &ldquo;Tanpa data, Anda hanyalah orang lain dengan pendapat.&rdquo; Mari bantu BPS menyediakan data berkualitas untuk Indonesia hari ini.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard/team")}
                className="shrink-0 bg-white hover:bg-slate-50 text-indigo-600 text-xs sm:text-sm font-extrabold px-5 py-3 rounded-2xl shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer self-start md:self-center"
              >
                Lihat Tugas Hari Ini →
              </button>
            </div>

            {/* Stats Cards - Intern/Mentor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: "✓", color: "emerald", label: "2 Selesai", desc: "Tugas yang sudah terselesaikan." },
                { icon: "📄", color: "blue", label: "4 Dijadwalkan", desc: "Tugas yang segera dimulai." },
                { icon: "🔄", color: "amber", label: "1 Diperbarui", desc: "Perubahan dalam penugasan." },
                { icon: "⚠️", color: "rose", label: "1 Terlambat", desc: "Penugasan melewati batas waktu." },
              ].map((stat, idx) => (
                <div key={idx} className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between min-h-[90px]">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full border border-${stat.color}-500 flex items-center justify-center text-${stat.color}-500 font-extrabold text-xs`}>
                      {stat.icon}
                    </div>
                    <span className="text-sm font-extrabold text-slate-800">{stat.label}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 mt-3">{stat.desc}</span>
                </div>
              ))}
            </div>

            {/* Log Aktivitas - Intern/Mentor */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Log Aktivitas Pribadi</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">Informasi terbaru mengenai aktivitas yang telah Anda lakukan.</p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Unduh Log Aktivitas
                </button>
              </div>

              <div ref={logRef} className="divide-y divide-slate-50/80 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {personalLogs.length === 0 ? (
                  <p className="text-center py-6 text-xs text-slate-400 font-semibold">Belum ada aktivitas tercatat untuk Anda.</p>
                ) : (
                  personalLogs.map((log, index) => (
                    <div key={index} className="flex items-center justify-between py-3.5 log-item">
                      <div className="flex items-center gap-3.5 log-info">
                        <img
                          src={avatarToUse}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover border border-slate-100"
                        />
                        <span className="text-[11px] text-slate-600 font-medium log-text">
                          <strong className="text-slate-800 font-bold">{userFullName}</strong> {log.text}{" "}
                          <span className="text-violet-600 font-bold hover:underline cursor-pointer log-task">{log.task}</span>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 log-time">{log.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
