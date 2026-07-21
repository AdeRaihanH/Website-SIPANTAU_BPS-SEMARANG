"use client";

import React from "react";

function parseTaskDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const year = parseInt(parts[2]);
  const monthStr = parts[1].toLowerCase();
  const fullMonths = ["januari","februari","maret","april","mei","juni","juli","agustus","september","oktober","november","desember"];
  const shortMonths = ["jan","feb","mar","apr","mei","jun","jul","agu","sep","okt","nov","des"];
  let month = fullMonths.findIndex(m => monthStr.startsWith(m.substring(0,3)));
  if (month === -1) month = shortMonths.findIndex(m => monthStr.startsWith(m.substring(0,3)));
  if (isNaN(day) || isNaN(year) || month === -1) return null;
  return { day, month, year };
}

function isOverdue(task) {
  if (task.status === "done") return false;
  const parsed = parseTaskDate(task.date);
  if (!parsed) return false;
  const taskDate = new Date(parsed.year, parsed.month, parsed.day);
  const today = new Date(2026, 6, 11); // Hardcoded today as 11 Juli 2026 for consistency
  return taskDate < today;
}

// Convert relative time string into comparable index (lower means more recent)
const parseRelativeTime = (timeStr) => {
  if (!timeStr) return 9999;
  const s = timeStr.toLowerCase().trim();
  if (s === "baru saja" || s === "sekarang") return 0;
  if (s === "kemarin") return 1;
  const match = s.match(/^(\d+)\s+hari\s+lalu/);
  if (match) return parseInt(match[1]);
  return 999;
};

// Retrieve proper avatar for a user dynamically
const getUserAvatar = (name) => {
  const currentName = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
  const currentEmail = typeof window !== "undefined" ? localStorage.getItem("sipantau_email") : null;
  if (currentName && name && currentName.trim().toLowerCase() === name.trim().toLowerCase()) {
    const stored = typeof window !== "undefined" ? localStorage.getItem(`sipantau_avatar_${currentEmail.toLowerCase()}`) : null;
    if (stored) return stored;
  }
  if (name === "Myesha Azka") return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50&h=50&q=80";
  if (name === "Nurul Kumala") return "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=50&h=50&q=80";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b&bold=true`;
};

export default function TabDashboard({ tasks = [] }) {
  // 1. Stats Row calculations
  const selesai = tasks.filter(t => t.status === "done").length;
  const dijadwalkan = tasks.filter(t => t.status === "todo").length;
  const diperbarui = tasks.filter(t => t.status === "inprogress" || t.status === "review").length;
  const terlambat = tasks.filter(isOverdue).length;

  // 2. Priority Chart calculations (Case-insensitive)
  const priorities = ["Tertinggi", "Tinggi", "Sedang", "Rendah", "Terendah"];
  const priorityCounts = priorities.map(prio =>
    tasks.filter(t => t.priority && t.priority.toLowerCase() === prio.toLowerCase()).length
  );
  const maxPriorityCount = Math.max(...priorityCounts, 1);

  // 3. Type Chart calculations (Case-insensitive & Dynamic)
  const defaultTypes = ["Design", "Bug", "Aset", "Fitur", "Tugas"];
  const types = Array.from(new Set([
    ...defaultTypes,
    ...tasks.map(t => t.type).filter(Boolean)
  ]));
  const typeCounts = types.map(type =>
    tasks.filter(t => t.type && t.type.toLowerCase() === type.toLowerCase()).length
  );
  const maxTypeCount = Math.max(...typeCounts, 1);

  // 4. Activity Logs (Extract and sort by recency)
  const logs = tasks
    .flatMap(t => (t.riwayat || []).map(r => ({ ...r, taskTitle: t.title })))
    .sort((a, b) => {
      const timeDiff = parseRelativeTime(a.time) - parseRelativeTime(b.time);
      if (timeDiff !== 0) return timeDiff;
      if (a.timestamp && b.timestamp) return b.timestamp - a.timestamp;
      if (a.timestamp) return -1;
      if (b.timestamp) return 1;
      return 0;
    })
    .slice(0, 20); // Show top 20 sorted activities for scrolling

  const priorityColors = {
    "Tertinggi": "bg-[#fca5a5]", // Soft pink/rose-300
    "Tinggi": "bg-[#a7f3d0]",    // Soft green/emerald-200
    "Sedang": "bg-[#fed7aa]",    // Soft orange/amber-200
    "Rendah": "bg-[#cffafe]",    // Soft cyan-100
    "Terendah": "bg-[#ddd6fe]"   // Soft violet-200
  };

  const typeColors = {
    "Design": "bg-[#ddd6fe]",
    "Bug": "bg-[#cffafe]",
    "Aset": "bg-[#fed7aa]",
    "Fitur": "bg-[#fca5a5]",
    "Tugas": "bg-[#c7d2fe]"
  };

  const getTypeColor = (type) => typeColors[type] || "bg-[#c7d2fe]";

  return (
    <div className="space-y-6">

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: "✓", color: "emerald", value: `${selesai} Selesai`, desc: "Tugas yang sudah terselesaikan." },
          { icon: "📄", color: "blue", value: `${dijadwalkan} Dijadwalkan`, desc: "Tugas yang segera dimulai." },
          { icon: "🔄", color: "amber", value: `${diperbarui} Diperbarui`, desc: "Perubahan dalam penugasan." },
          { icon: "⚠️", color: "rose", value: `${terlambat} Terlambat`, desc: "Penugasan melewati batas waktu." },
        ].map((stat) => (
          <div key={stat.value} className="p-4 border border-slate-100 bg-white rounded-2xl shadow-sm flex flex-col justify-between min-h-[85px]">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full border border-${stat.color}-500 flex items-center justify-center text-${stat.color}-500 font-extrabold text-[10px]`}>
                {stat.icon}
              </div>
              <span className="text-xs font-extrabold text-slate-800">{stat.value}</span>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 mt-2">{stat.desc}</span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rincian Prioritas Chart (Vertical Bars) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">Rincian Prioritas</h3>
            <p className="text-[10px] text-slate-400 font-medium">Rincian banyak item pekerjaan berdasarkan prioritasnya.</p>
          </div>

          <div className="relative h-48 border-b border-slate-200 flex items-end justify-between px-6 pb-2 pt-6">
            {/* Grid Y-Axis lines and numbers */}
            <div className="absolute left-[-15px] bottom-2 text-[9px] text-slate-400 font-bold">0</div>
            <div className="absolute left-[-15px] bottom-[50%] -translate-y-1/2 text-[9px] text-slate-400 font-bold">
              {Math.round(maxPriorityCount / 2)}
            </div>
            <div className="absolute left-[-15px] top-6 text-[9px] text-slate-400 font-bold">{maxPriorityCount}</div>

            {/* Grid Line Helpers */}
            <div className="absolute left-0 right-0 border-t border-dashed border-slate-200 top-[50%]" />
            <div className="absolute left-0 right-0 border-t border-dashed border-slate-200 top-6" />

            {/* Bars */}
            {priorities.map((prio, idx) => {
              const val = priorityCounts[idx];
              const pct = (val / maxPriorityCount) * 100;
              const bg = val > 0 ? priorityColors[prio] : "transparent";
              const heightStyle = val > 0 ? `${pct}%` : "0%";
              return (
                <div key={prio} className="flex flex-col items-center justify-end h-[130px] relative z-10 w-14 sm:w-16">
                  {/* Thick background column bar */}
                  <div className="w-12 h-full bg-[#f1f5f9]/70 rounded-t-sm flex items-end overflow-hidden">
                    {/* Active colored value filled from bottom */}
                    <div 
                      style={{ height: heightStyle }}
                      className={`w-full transition-all duration-500 relative group ${bg}`}
                    >
                      {val > 0 && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-700 bg-white border border-slate-100 px-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-25">
                          {val}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap absolute -bottom-6">{prio}</span>
                </div>
              );
            })}
          </div>
          <div className="h-3" /> {/* spacer for labels */}
        </div>

        {/* Jenis Pekerjaan Chart (Horizontal Bars) */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-800">Jenis Pekerjaan</h3>
            <p className="text-[10px] text-slate-400 font-medium">Rincian banyak item pekerjaan berdasarkan jenisnya.</p>
          </div>

          {/* Dynamic Color Legend */}
          <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 text-[9px] font-bold text-slate-400 border-b border-slate-50/60 pb-2">
            {types.map((type) => (
              <div key={type} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-sm ${getTypeColor(type)}`} />
                <span>{type}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            {types.map((type, idx) => {
              const val = typeCounts[idx];
              const pct = (val / maxTypeCount) * 100;
              const color = getTypeColor(type);
              const widthStyle = val > 0 ? `${pct}%` : "0%";
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-500 w-12 text-right">{type}</span>
                  <div className="flex-1 bg-slate-50 rounded-full h-4 relative overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} flex items-center justify-end pr-2 transition-all duration-500`}
                      style={{ width: widthStyle }}
                    >
                      {val > 0 && (
                        <span className="text-[9px] font-extrabold text-slate-700 leading-none">{val}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Axis Label */}
            <div className="flex justify-between pl-15 text-[8px] font-bold text-slate-400">
              <span>0</span>
              <span>{Math.round(maxTypeCount / 2)}</span>
              <span>{maxTypeCount}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Log Aktivitas */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-50 pb-4">
          <h3 className="text-sm font-extrabold text-slate-800">Log Aktivitas Tim</h3>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Informasi terbaru mengenai aktivitas tugas di dalam tim ini.</p>
        </div>

        <div className="divide-y divide-slate-50/80 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {logs.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-400 font-semibold">Belum ada aktivitas tercatat</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-center justify-between py-3.5">
                <div className="flex items-center gap-3.5">
                  <img
                    src={getUserAvatar(log.name)}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border border-slate-100"
                  />
                  <span className="text-[11px] text-slate-600 font-medium">
                    <strong className="text-slate-800 font-bold">{log.name}</strong> {log.text}{" "}
                    <span className="text-violet-600 font-bold hover:underline cursor-pointer">{log.taskTitle}</span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
