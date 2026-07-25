"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getActiveUser, getProfile } from "../../backend/auth";
import { getAllUsers } from "../../backend/admin";
import { getAdminStats, getPersonalStats, getPersonalLogs } from "../../backend/dashboard";
import { supabase } from "../../backend/client";

// Module-level in-memory cache (0ms latency, zero quota limits, 100% safe)
const memoryCache = new Map();

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("User");
  const [userFullName, setUserFullName] = useState("User Name");
  const [userAvatar, setUserAvatar] = useState("");
  const [userRole, setUserRole] = useState("intern");
  const [adminUsers, setAdminUsers] = useState([]);
  const logRef = useRef(null);

  const [userId, setUserId] = useState(null);
  const [adminStats, setAdminStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  const [personalStats, setPersonalStats] = useState({ completed: 0, scheduled: 0, updated: 0, overdue: 0 });
  const [activityLogs, setActivityLogs] = useState([]);
  const [adminActivityLogs, setAdminActivityLogs] = useState([]);
  const adminReloadRef = useRef(null);

  // Instant cache restore on mount (0ms delay)
  useEffect(() => {
    try {
      const cachedRole = localStorage.getItem("sipantau_role");
      const cachedName = localStorage.getItem("sipantau_name");
      if (cachedName) setUserName(cachedName.split(" ")[0]);
      if (cachedRole) setUserRole(cachedRole.toLowerCase());

      const cachedAdminStats = memoryCache.get("adminStats");
      if (cachedAdminStats) setAdminStats(cachedAdminStats);
      
      const cachedPersonalStats = memoryCache.get("personalStats");
      if (cachedPersonalStats) setPersonalStats(cachedPersonalStats);

      const cachedLogs = memoryCache.get("activityLogs");
      if (cachedLogs && Array.isArray(cachedLogs)) {
        setActivityLogs(cachedLogs);
        setAdminActivityLogs(cachedLogs);
      }
    } catch (e) {}
  }, []);

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
          const [users, stats, logs] = await Promise.all([
            getAllUsers().catch(() => []),
            getAdminStats().catch(() => ({ total: 0, pending: 0, approved: 0, rejected: 0 })),
            getPersonalLogs(user.id, "admin").catch(() => [])
          ]);
          setAdminUsers(users);
          setAdminStats(stats);
          setAdminActivityLogs(logs || []);

          memoryCache.set("adminStats", stats);
          memoryCache.set("activityLogs", logs || []);
        } else {
          const [stats, logs] = await Promise.all([
            getPersonalStats(user.id, role).catch(() => ({ completed: 0, scheduled: 0, updated: 0, overdue: 0 })),
            getPersonalLogs(user.id, role).catch(() => [])
          ]);
          setPersonalStats(stats);
          setActivityLogs(logs || []);

          memoryCache.set("personalStats", stats);
          memoryCache.set("activityLogs", logs || []);
        }
      }
    } catch (e) {
      console.error("Error loading profile or stats", e);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ========== ADMIN REALTIME REFRESH ==========
  useEffect(() => {
    if (!userId || userRole !== "admin") return;

    const refreshAdminData = async () => {
      try {
        const [users, stats, logs] = await Promise.all([
          getAllUsers(),
          getAdminStats(),
          getPersonalLogs(userId, "admin")
        ]);
        setAdminUsers(users);
        setAdminStats(stats);
        setAdminActivityLogs(logs || []);
      } catch (e) {
        console.warn("Admin refresh error:", e);
      }
    };

    // Real-time subscription: profiles table (new registrations, status changes)
    const profilesChannel = supabase
      .channel('admin-profiles')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          if (adminReloadRef.current) clearTimeout(adminReloadRef.current);
          adminReloadRef.current = setTimeout(refreshAdminData, 500);
        }
      )
      .subscribe();

    // Real-time subscription: activity_logs table (new admin actions)
    const activityChannel = supabase
      .channel('admin-activity')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_logs' },
        () => {
          if (adminReloadRef.current) clearTimeout(adminReloadRef.current);
          adminReloadRef.current = setTimeout(refreshAdminData, 500);
        }
      )
      .subscribe();

    // Periodic polling fallback every 30s
    const pollInterval = setInterval(refreshAdminData, 30000);

    // Cleanup
    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(activityChannel);
      clearInterval(pollInterval);
      if (adminReloadRef.current) clearTimeout(adminReloadRef.current);
    };
  }, [userId, userRole]);

  // ========== NON-ADMIN STATS UPDATE ==========
  useEffect(() => {
    if (!userId || !userRole || userRole === "admin") return;

    // Periodic polling every 30s untuk refresh stats & logs
    const pollInterval = setInterval(async () => {
      try {
        const stats = await getPersonalStats(userId, userRole);
        setPersonalStats(stats);
        const logs = await getPersonalLogs(userId, userRole);
        setActivityLogs(logs);
      } catch (e) {
        console.warn("Polling refresh error:", e);
      }
    }, 30000);

    // Cleanup
    return () => {
      clearInterval(pollInterval);
    };
  }, [userId, userRole]);

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userFullName)}&background=f1f5f9&color=64748b&bold=true`;
  const avatarToUse = userAvatar || defaultAvatar;

  const handleDownloadPDF = async () => {
    try {
      const { getUserTasks } = await import("../../backend/tasks");
      const dbTasks = await getUserTasks(userId, userRole).catch(() => []);
      
      let cachedTasks = [];
      if (typeof window !== "undefined" && window._sipantauMemoryCache) {
        window._sipantauMemoryCache.forEach((value, key) => {
          if (key.startsWith("tasks_") && Array.isArray(value)) {
            const teamId = key.replace("tasks_", "");
            const teamObj = (window._sipantauMemoryCache.get("teams") || []).find(t => t.id === teamId);
            value.forEach(t => {
              cachedTasks.push({
                ...t,
                group: t.group || { name: teamObj ? teamObj.name : "Kelompok Magang" }
              });
            });
          }
        });
      }

      const taskMap = new Map();
      [...dbTasks, ...cachedTasks].forEach(t => {
        if (t && (t.id || t.title)) {
          const key = t.id || t.title;
          taskMap.set(key, t);
        }
      });
      const tasks = Array.from(taskMap.values());

      const roleName = userRole === "mentor" ? "Mentor" : userRole === "admin" ? "Admin" : "Pemagang";
      const today = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });

      const now = new Date();
      const m = now.getMonth() + 1;
      const d = now.getDate();
      const yy = String(now.getFullYear()).slice(-2);
      let hh = now.getHours();
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ampm = hh >= 12 ? 'PM' : 'AM';
      hh = hh % 12 || 12;
      const printTimeHeader = `${m}/${d}/${yy}, ${hh}:${mm} ${ampm}`;

      const statusMap = {
        todo: "To Do",
        inprogress: "In Progress",
        in_progress: "In Progress",
        review: "In Review",
        in_review: "In Review",
        done: "Selesai",
        completed: "Selesai"
      };

      const prioMap = {
        urgent: "Tertinggi",
        critical: "Tertinggi",
        high: "Tinggi",
        medium: "Sedang",
        low: "Rendah"
      };

      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Laporan Aktivitas Pribadi - ${userFullName}</title>
            <style>
              @page { size: A4; margin: 12mm 15mm; }
              * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
              body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; padding: 15px 25px 40px 25px; color: #1e293b; max-width: 850px; margin: 0 auto; line-height: 1.5; position: relative; min-height: 98vh; box-sizing: border-box; }
              
              /* Top Browser Header Simulation */
              .top-header-bar { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #475569; font-weight: 500; margin-bottom: 25px; }
              .top-header-left { text-align: left; }
              .top-header-right { text-align: center; margin-left: auto; padding-right: 60px; font-weight: 500; color: #334155; }
              
              .title { text-align: center; margin-bottom: 25px; font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 10px; }
              .meta-section { margin-bottom: 30px; font-size: 13px; color: #334155; font-weight: 600; line-height: 1.8; }
              .meta-row { display: flex; }
              .meta-label { width: 150px; color: #475569; }
              
              .section-header { margin-top: 30px; margin-bottom: 12px; }
              .section-title { font-size: 16px; font-weight: 800; color: #1e293b; border-bottom: 3px solid #7c3aed; padding-bottom: 4px; display: inline-block; }
              
              table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; margin-bottom: 25px; font-size: 11px; border: 1px solid #7c3aed; border-radius: 8px; overflow: hidden; table-layout: fixed; }
              thead tr { background-color: #7c3aed !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              th { background-color: #7c3aed !important; color: #ffffff !important; text-align: center; padding: 11px 14px; font-weight: 700; border-right: 1px solid rgba(255,255,255,0.4) !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
              th:last-child { border-right: none !important; }
              th.left { text-align: left; }
              td { padding: 10px 14px; border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; color: #334155; text-align: center; font-weight: 500; }
              td:last-child { border-right: none; }
              tr:last-child td { border-bottom: none; }
              tr:nth-child(even) { background-color: #f8fafc; }

              /* Bottom Browser Footer Simulation */
              .bottom-footer-bar { position: absolute; bottom: 10px; left: 25px; right: 25px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 500; }

              @media print {
                body { padding: 0; min-height: auto; }
                .top-header-bar { margin-bottom: 15px; }
                .bottom-footer-bar { position: fixed; bottom: 5px; left: 0; right: 0; }
              }
            </style>
          </head>
          <body>
            <div class="top-header-bar">
              <div class="top-header-left">${printTimeHeader}</div>
              <div class="top-header-right">Laporan Aktivitas Pribadi - ${userFullName}</div>
            </div>

            <h2 class="title">Laporan Log Aktivitas Pribadi</h2>
            
            <div class="meta-section">
              <div class="meta-row"><span class="meta-label">Nama Pengguna</span><span>: ${userFullName}</span></div>
              <div class="meta-row"><span class="meta-label">Peran</span><span>: ${roleName}</span></div>
              <div class="meta-row"><span class="meta-label">Tanggal Cetak</span><span>: ${today}</span></div>
            </div>
            
            <div class="section-header">
              <div class="section-title">Log Aktivitas Terbaru</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 35px; text-align: center;">No</th>
                  <th style="width: 130px;" class="left">Waktu</th>
                  <th class="left">Aktivitas</th>
                  <th class="left" style="width: 220px;">Tugas Terkait</th>
                </tr>
              </thead>
              <tbody>
                ${activityLogs && activityLogs.length > 0 ? activityLogs.map((log, idx) => `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td class="left" style="white-space: nowrap;">${new Date(log.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                    <td class="left">${log.description || "telah beraktivitas"}</td>
                    <td class="left" style="font-weight: 700; color: #1e293b;">${log.task?.title || "-"}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="4" style="text-align: center; color: #64748b; padding: 15px;">Tidak ada aktivitas tercatat</td>
                  </tr>
                `}
              </tbody>
            </table>

            <div class="section-header">
              <div class="section-title">Daftar Tugas Terkait</div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 35px; text-align: center;">No</th>
                  <th class="left" style="width: 20%;">Kelompok/Tim</th>
                  <th class="left" style="width: 22%;">Nama Tugas</th>
                  <th style="width: 18%; text-align: center; white-space: nowrap;">Status</th>
                  <th style="width: 18%; text-align: center; white-space: nowrap;">Prioritas</th>
                  <th style="width: 20%; text-align: center; white-space: nowrap;">Tenggat</th>
                </tr>
              </thead>
              <tbody>
                ${tasks && tasks.length > 0 ? tasks.map((t, idx) => `
                  <tr>
                    <td style="text-align: center;">${idx + 1}</td>
                    <td class="left" style="word-break: break-word;">${t.group ? (typeof t.group === 'string' ? t.group : t.group.name) : "-"}</td>
                    <td class="left" style="font-weight: 700; color: #1e293b; word-break: break-word;">${t.title || t.desc || "-"}</td>
                    <td style="text-align: center; white-space: nowrap;">${statusMap[t.status] || t.status || "To Do"}</td>
                    <td style="text-align: center; white-space: nowrap;">${prioMap[t.priority] || t.priority || "Sedang"}</td>
                    <td style="text-align: center; white-space: nowrap;">${t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : (t.date || "-")}</td>
                  </tr>
                `).join('') : `
                  <tr>
                    <td colspan="6" style="text-align: center; color: #64748b; padding: 15px;">Tidak ada tugas</td>
                  </tr>
                `}
              </tbody>
            </table>

            <div class="bottom-footer-bar">
              <div>about:blank</div>
              <div>1/1</div>
            </div>
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
                ), color: "violet", label: `${adminStats.total} Akun`, desc: "Jumlah pendaftar SIPANTAU.", tab: "semua" },
                { icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), color: "amber", label: `${adminStats.pending} Menunggu`, desc: "Akun perlu diverifikasi.", tab: "belum-diverifikasi" },
                { icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ), color: "emerald", label: `${adminStats.approved} Disetujui`, desc: "Akun yang telah disetujui.", tab: "sudah-diverifikasi" },
                { icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ), color: "rose", label: `${adminStats.rejected} Ditolak`, desc: "Akun yang telah ditolak.", tab: "ditolak" },
              ].map((stat, idx) => (
                <button
                  key={idx}
                  onClick={() => router.push(`/dashboard/accounts?tab=${stat.tab}`)}
                  className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 flex items-center gap-4 text-left cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-${stat.color}-100 text-${stat.color}-500 bg-${stat.color}-50`}>
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{stat.label}</h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{stat.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Log Akun - Admin */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-4">
                <h3 className="text-sm font-extrabold text-slate-800">Log Akun</h3>
                <p className="text-[11px] text-slate-400 font-medium mt-1">Informasi terbaru mengenai akun dan aktivitas admin SIPANTAU.</p>
              </div>

              <div className="divide-y divide-slate-50/80 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {(() => {
                  // Merge user registrations with admin activity logs, sorted by date
                  const userLogs = [...adminUsers].reverse().map(u => ({
                    type: "user",
                    id: u.id,
                    full_name: u.full_name,
                    avatar_url: u.avatar_url,
                    status: u.status,
                    role: u.role,
                    created_at: u.created_at,
                  }));
                  const actionLogs = adminActivityLogs
                    .filter(log => !log.task_id) // Hanya log terkait akun (bukan tugas)
                    .map(log => ({
                      type: "activity",
                      id: log.id,
                      full_name: log.profiles?.full_name || "Admin",
                      avatar_url: log.profiles?.avatar_url,
                      description: log.description,
                      created_at: log.created_at,
                    }));
                  const merged = [...userLogs, ...actionLogs]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 15);
                  
                  if (merged.length === 0) {
                    return (
                      <div className="py-8 flex flex-col items-center justify-center text-center w-full">
                        <img src="/empty-activity.svg" alt="Belum ada Log Akun" className="w-40 h-28 object-contain mb-3" />
                        <p className="text-xs font-bold text-slate-800">Belum ada Log Akun</p>
                      </div>
                    );
                  }
                  
                  return merged.map((item, index) => {
                    if (item.type === "user") {
                      let text = "";
                      let roleText = "";
                      let statusText = "";
                      let color = "";
                      
                      if (item.status === "pending") {
                        text = "mendaftar akun baru sebagai";
                        roleText = item.role === "mentor" ? "Mentor." : "Pemagang.";
                        statusText = "Menunggu";
                        color = "amber";
                      } else if (item.status === "active") {
                        text = "telah disetujui pendaftarannya.";
                        statusText = "Disetujui";
                        color = "emerald";
                      } else if (item.status === "rejected") {
                        text = "telah ditolak pendaftarannya.";
                        statusText = "Ditolak";
                        color = "rose";
                      }

                      const uAvatar = item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.full_name || "User")}`;

                      return (
                        <div key={`user-${item.id}`} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-4">
                            <img src={uAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0" />
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-slate-500 font-medium">
                                <strong className="text-slate-700 font-bold">{item.full_name}</strong> {text}{" "}
                                {roleText && <span className="text-violet-600 font-bold">{roleText}</span>}
                              </span>
                              <div className={`w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-${color}-100 text-${color}-600`}>
                                {statusText}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 self-start mt-1">
                            {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        </div>
                      );
                    } else {
                      // Admin activity log
                      const aAvatar = item.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.full_name || "Admin")}`;
                      return (
                        <div key={`act-${item.id}`} className="flex items-center justify-between py-3">
                          <div className="flex items-center gap-4">
                            <img src={aAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0" />
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] text-slate-500 font-medium">
                                <strong className="text-slate-700 font-bold">{item.full_name}</strong> {item.description}
                              </span>
                              <div className="w-fit px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-600">
                                Aktivitas Admin
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 shrink-0 self-start mt-1">
                            {new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        </div>
                      );
                    }
                  });
                })()}
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
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ),
                  color: "emerald",
                  label: `${personalStats.completed} Selesai`,
                  desc: "Tugas yang sudah terselesaikan."
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ),
                  color: "blue",
                  label: `${personalStats.scheduled} Dijadwalkan`,
                  desc: "Tugas yang segera dimulai."
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ),
                  color: "amber",
                  label: `${personalStats.updated} Diperbarui`,
                  desc: "Perubahan dalam penugasan."
                },
                {
                  icon: (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ),
                  color: "rose",
                  label: `${personalStats.overdue} Terlambat`,
                  desc: "Penugasan melewati batas waktu."
                },
              ].map((stat, idx) => (
                <div key={idx} className="p-5 border border-slate-100 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between min-h-[90px]">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-full border border-${stat.color}-500 flex items-center justify-center text-${stat.color}-500 font-extrabold text-xs shrink-0`}>
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
                  <div className="py-8 flex flex-col items-center justify-center text-center w-full">
                    <img src="/empty-activity.svg" alt="Belum ada Aktivitas" className="w-40 h-28 object-contain mb-3" />
                    <p className="text-xs font-bold text-slate-800">Belum ada Aktivitas</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
