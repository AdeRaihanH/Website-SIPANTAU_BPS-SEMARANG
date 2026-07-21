"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getActiveUser, getProfile } from "../../backend/auth";
import { getAllUsers } from "../../backend/admin";
import { getAdminStats, getPersonalStats, getPersonalLogs } from "../../backend/dashboard";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userFullName, setUserFullName] = useState("User Name");
  const [userAvatar, setUserAvatar] = useState("");
  const [userRole, setUserRole] = useState("intern");
  const [adminUsers, setAdminUsers] = useState([]);
  const [personalLogs, setPersonalLogs] = useState([]);
  const logRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [adminStats, setAdminStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [personalStats, setPersonalStats] = useState({ completed: 0, scheduled: 0, updated: 0, overdue: 0 });
  const [activityLogs, setActivityLogs] = useState([]);

  const loadProfile = async () => {
    try {
      const user = await getActiveUser();
      if (!user) {
        router.push("/");
        return;
      }
      setUserId(user.id);
      
      const profile = await getProfile(user.id);
      if (profile) {
        const role = profile.role ? profile.role.toLowerCase() : "pemagang";
        setUserRole(role);
        setUserName(profile.full_name ? profile.full_name.split(" ")[0] : "User");
        setUserFullName(profile.full_name || "User Name");
        setUserAvatar(profile.avatar_url || "");
        
        if (role === "admin") {
          const users = await getAllUsers();
          setAdminUsers(users);
          
          const stats = await getAdminStats();
          setAdminStats(stats);
        } else {
          const stats = await getPersonalStats(user.id);
          setPersonalStats(stats);
          
          const logs = await getPersonalLogs(user.id);
          setActivityLogs(logs);
        }
      }
    } catch (e) {
      console.error("Error loading profile or stats", e);
    }
  };

  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  useEffect(() => {
    loadProfile();
  }, []);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=f1f5f9&color=64748b&bold=true`;
  const avatarToUse = userAvatar || defaultAvatar;

  const handleDownloadPDF = async () => {
    try {
      const { getUserTasks } = await import("../../backend/tasks");
      const tasks = await getUserTasks(userId);
      
      const total = tasks.length;
      const selesai = tasks.filter(t => t.status === "completed" || t.status === "done" || t.status === "Selesai").length;
      const proses = total - selesai;
      const progress = total === 0 ? 0 : Math.round((selesai / total) * 100);

      const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>Laporan Tugas & Perkembangan Magang - ${userFullName}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
              h2 { text-align: center; margin-bottom: 30px; font-size: 24px; color: #111; }
              .info-container { margin-bottom: 30px; font-size: 14px; line-height: 1.6; }
              .info-row { display: flex; }
              .info-label { width: 180px; }
              table { w-full; border-collapse: collapse; margin-top: 20px; width: 100%; font-size: 12px; }
              th { background-color: #7c3aed; color: white; text-align: left; padding: 12px 15px; font-weight: 600; }
              td { padding: 12px 15px; border-bottom: 1px solid #f1f5f9; color: #475569; }
              tr:nth-child(even) { background-color: #f8fafc; }
              .status-badge { padding: 4px 8px; border-radius: 9999px; font-weight: bold; font-size: 10px; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <h2>Laporan Tugas & Perkembangan Magang</h2>
            <div class="info-container">
              <div class="info-row"><div class="info-label">Nama Pemagang</div><div>: ${userFullName}</div></div>
              <div class="info-row"><div class="info-label">Progress Penyelesaian</div><div>: ${progress}%</div></div>
              <div class="info-row"><div class="info-label">Total Tugas Kelompok</div><div>: ${total} (${selesai} Selesai, ${proses} Proses)</div></div>
              <div class="info-row"><div class="info-label">Tanggal Cetak</div><div>: ${today}</div></div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="border-top-left-radius: 8px;">No</th>
                  <th>Kelompok/Tim</th>
                  <th>Nama Tugas</th>
                  <th>Status</th>
                  <th>Prioritas</th>
                  <th style="border-top-right-radius: 8px;">Tenggat</th>
                </tr>
              </thead>
              <tbody>
                ${tasks.map((t, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${t.group ? t.group.name : "-"}</td>
                    <td style="font-weight: 600; color: #1e293b;">${t.title}</td>
                    <td>${t.status}</td>
                    <td>${t.priority}</td>
                    <td>${t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                  </tr>
                `).join('')}
                ${tasks.length === 0 ? '<tr><td colspan="6" style="text-align: center;">Tidak ada tugas</td></tr>' : ''}
              </tbody>
            </table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } catch (e) {
      console.error("Failed to generate PDF", e);
      alert("Gagal mengunduh laporan PDF.");
    }
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
                { icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ), color: "violet", label: `${adminStats.total} Akun`, desc: "Jumlah pendaftar SIPANTAU." },
                { icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), color: "amber", label: `${adminStats.pending} Menunggu`, desc: "Akun perlu diverifikasi." },
                { icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), color: "emerald", label: `${adminStats.approved} Disetujui`, desc: "Akun yang telah disetujui." },
                { icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ), color: "rose", label: `${adminStats.rejected} Ditolak`, desc: "Akun yang telah ditolak." },
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

                  const uAvatar = u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || "User")}`;

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
                            <strong className="text-slate-700 font-bold">{u.full_name}</strong> {text}{" "}
                            {roleText && <span className="text-violet-600 font-bold hover:underline cursor-pointer">{roleText}</span>}
                          </span>
                          <div className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-${color}-100 text-${color}-600`}>
                            {statusText}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0 self-start mt-1">
                        {new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
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
                { icon: "✓", color: "emerald", label: `${personalStats.completed} Selesai`, desc: "Tugas yang sudah terselesaikan." },
                { icon: "📄", color: "blue", label: `${personalStats.scheduled} Dijadwalkan`, desc: "Tugas yang segera dimulai." },
                { icon: "🔄", color: "amber", label: `${personalStats.updated} Diperbarui`, desc: "Perubahan dalam penugasan." },
                { icon: "⚠️", color: "rose", label: `${personalStats.overdue} Terlambat`, desc: "Penugasan melewati batas waktu." },
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
                {activityLogs.length > 0 ? activityLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between py-3.5 log-item">
                    <div className="flex items-center gap-3.5 log-info">
                      <img
                        src={avatarToUse}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover border border-slate-100"
                      />
                      <span className="text-[11px] text-slate-600 font-medium log-text">
                        <strong className="text-slate-800 font-bold">{userFullName}</strong> {log.description || "telah beraktivitas"}{" "}
                        <span className="text-violet-600 font-bold hover:underline cursor-pointer log-task">{log.task?.title || ""}</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 log-time">
                      {new Date(log.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                )) : (
                  <div className="py-6 text-center text-sm font-semibold text-slate-400">Belum ada aktivitas.</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
