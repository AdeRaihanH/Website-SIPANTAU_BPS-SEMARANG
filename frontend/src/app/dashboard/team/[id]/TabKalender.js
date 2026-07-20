"use client";

import React, { useState, useRef, useEffect } from "react";
import { createTask } from "../../../../backend/tasks";

const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const shortMonthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

const userAvatars = {
  "A": "https://randomuser.me/api/portraits/men/32.jpg",
  "C": "https://randomuser.me/api/portraits/women/44.jpg",
  "E": "https://randomuser.me/api/portraits/men/46.jpg",
  "B": "https://randomuser.me/api/portraits/women/68.jpg",
  "D": "https://randomuser.me/api/portraits/men/15.jpg",
};

function getDaysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfWeek(y, m) { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; }

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

export default function TabKalender({ tasks, setTasks, setSelectedTask, team }) {
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Inline Add Task Popover State
  const [addingTaskDay, setAddingTaskDay] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("Tugas");
  const [newPriority, setNewPriority] = useState("Tertinggi");
  const [newOrang, setNewOrang] = useState(["A"]);

  const [showTypeDrop, setShowTypeDrop] = useState(false);
  const [showPriorityDrop, setShowPriorityDrop] = useState(false);
  const [showAssignDrop, setShowAssignDrop] = useState(false);

  const getUserAvatar = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "?")}&background=f1f5f9&color=64748b&bold=true`;

  const teamMembers = team && team.membersList
    ? team.membersList.map(member => ({
        id: member.id,
        name: member.full_name,
        initial: member.full_name ? member.full_name.charAt(0).toUpperCase() : "?",
        avatar: member.avatar_url || getUserAvatar(member.full_name),
        bg: "bg-violet-500"
      }))
    : [];

  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setAddingTaskDay(null);
        setShowTypeDrop(false);
        setShowPriorityDrop(false);
        setShowAssignDrop(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfWeek(calYear, calMonth);

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear-1); } else setCalMonth(calMonth-1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear+1); } else setCalMonth(calMonth+1); };

  const getTasksForDay = (day) => tasks.filter(t => {
    const parsed = parseTaskDate(t.date);
    return parsed && parsed.day === day && parsed.month === calMonth && parsed.year === calYear;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Tertinggi": return "bg-rose-100 text-rose-700 border-rose-200";
      case "Tinggi": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "Sedang": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Rendah": return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case "Terendah": return "bg-violet-100 text-violet-700 border-violet-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleInlineAddTask = async (day) => {
    const activeUserName = typeof window !== "undefined" ? (localStorage.getItem("sipantau_name") || "Andi Basudara") : "Andi Basudara";
    
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const match = currentUrl.match(/\/team\/([^/]+)/);
    const teamId = match ? match[1] : "1";
    
    const mappedPriority = newPriority === "Tertinggi" ? "urgent" : newPriority === "Tinggi" ? "high" : newPriority === "Sedang" ? "medium" : "low";
    
    const dateStr = `${day} ${monthNames[calMonth]} ${calYear}`;
    const parsedDate = parseTaskDate(dateStr);
    let dbDate = null;
    if (parsedDate) {
      dbDate = `${parsedDate.year}-${String(parsedDate.month + 1).padStart(2, '0')}-${String(parsedDate.day).padStart(2, '0')}`;
    }

    let assignedToId = null;
    if (newOrang.length > 0) {
      const member = teamMembers.find(m => m.initial === newOrang[0]);
      if (member && member.id) {
        assignedToId = member.id;
      }
    }

    const newTaskData = {
      title: newTitle,
      description: newDesc || "Tidak ada deskripsi",
      status: "todo",
      type: newType,
      priority: mappedPriority,
      group_id: teamId,
      due_date: dbDate,
      assigned_to: assignedToId
    };

    try {
      const created = await createTask(newTaskData);
      const newTask = {
        id: created.id,
        title: newTitle,
        desc: newDesc || "Tidak ada deskripsi",
        date: dateStr,
        type: newType,
        priority: newPriority,
        status: "todo",
        done: false,
        orang: newOrang,
        riwayat: [{ name: activeUserName, text: "telah membuat penugasan", time: "baru saja" }],
        komentar: [],
      };
      setTasks([...tasks, newTask]);
      setNewTitle("");
      setNewDesc("");
      setAddingTaskDay(null);
      setShowTypeDrop(false);
      setShowPriorityDrop(false);
      setShowAssignDrop(false);
    } catch (e) {
      alert("Gagal menambahkan tugas: " + e.message);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer transition-colors">‹</button>
          <span className="text-base font-extrabold text-slate-800 min-w-[160px] text-center">
            {monthNames[calMonth]} {calYear}
          </span>
          <button onClick={nextMonth} className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 font-bold cursor-pointer transition-colors">›</button>
        </div>
        <div className="text-xs font-bold text-slate-400">
          {tasks.length} tugas total
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="w-full overflow-visible">
        <div className="min-w-[650px] border border-slate-100 rounded-2xl overflow-visible relative">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-100 text-center py-2.5 rounded-t-2xl">
            {["Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"].map((day) => (
              <span key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day}</span>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100/80 overflow-visible">
            {/* Empty padding cells for first week */}
            {Array.from({length: firstDay}).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[90px] p-2 bg-slate-50/30" />
            ))}

            {/* Actual day cells */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const cellIndex = firstDay + i;
              const colIndex = cellIndex % 7;
              const rowIndex = Math.floor(cellIndex / 7);
              const dayTasks = getTasksForDay(day);
              const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
              
              // Determine status strip color from the first task
              let statusStripColor = "";
              if (dayTasks.length > 0) {
                const firstStatus = dayTasks[0].status;
                if (firstStatus === "todo") statusStripColor = "bg-teal-400";
                else if (firstStatus === "inprogress") statusStripColor = "bg-rose-400";
                else if (firstStatus === "review") statusStripColor = "bg-sky-400";
                else if (firstStatus === "done") statusStripColor = "bg-amber-400";
              }

              return (
                <div
                  key={day}
                  onClick={() => {
                    if (addingTaskDay !== day) {
                      setAddingTaskDay(day);
                      setNewTitle("");
                      setNewType("Tugas");
                      setNewPriority("Tertinggi");
                      setNewOrang(["A"]);
                    }
                  }}
                  className="min-h-[105px] p-2 flex flex-col gap-1 bg-white hover:bg-slate-50/70 transition-all relative group cursor-pointer border-t border-slate-100/80 first:border-t-0"
                >
                  {/* Status Strip at Top */}
                  {dayTasks.length > 0 && (
                    <div className={`h-[3px] absolute top-0 left-0 right-0 ${statusStripColor}`} />
                  )}

                  {/* Day Number and Hover Plus Icon */}
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? "bg-violet-600 text-white" : "text-slate-700"
                    }`}>
                      {day}
                    </span>
                    <span className="text-[12px] font-extrabold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      +
                    </span>
                  </div>

                  {/* Tasks List or Muted hover overlay */}
                  <div className="flex-1 flex flex-col gap-0.5 justify-end">
                    {dayTasks.length === 0 ? (
                      <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity text-center pb-2">
                        Tambah Tugas
                      </span>
                    ) : (
                      <>
                        {dayTasks.slice(0, 2).map((t) => (
                          <button
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                            }}
                            className="w-full text-left truncate px-1 py-0.5 text-[10px] font-bold text-slate-800 hover:text-violet-600 transition-colors cursor-pointer bg-transparent border-none outline-none shadow-none"
                          >
                            {t.title}
                          </button>
                        ))}
                        {dayTasks.length > 2 && (
                          <span className="text-[8px] text-slate-400 font-bold px-1">+{dayTasks.length - 2} lagi</span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Inline Add Task Popover Card */}
                  {addingTaskDay === day && (
                    <div
                      ref={popoverRef}
                      onClick={(e) => e.stopPropagation()}
                      className={`absolute bg-white border border-slate-100 shadow-2xl rounded-3xl p-4 w-64 space-y-3 z-[60] text-left cursor-default ${
                        rowIndex >= 3 
                          ? `bottom-full mb-2 ${colIndex < 2 ? "left-0" : colIndex > 4 ? "right-0" : "left-1/2 -translate-x-1/2"}` 
                          : rowIndex === 2 
                            ? `top-1/2 -translate-y-1/2 ${colIndex < 3 ? "left-full ml-3" : "right-full mr-3"}`
                            : `top-full mt-2 ${colIndex < 2 ? "left-0" : colIndex > 4 ? "right-0" : "left-1/2 -translate-x-1/2"}`
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Judul Tugas..."
                          className="w-full text-xs font-extrabold text-slate-800 outline-none placeholder-slate-400 bg-transparent pr-2"
                          autoFocus
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddingTaskDay(null);
                          }}
                          className="text-slate-400 hover:text-slate-600 font-bold text-xs p-1 shrink-0"
                        >
                          ✕
                        </button>
                      </div>

                      <textarea
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        placeholder="Deskripsi tugas..."
                        className="w-full text-[11px] font-semibold text-slate-600 border border-slate-100 bg-slate-50/50 rounded-xl p-2.5 outline-none focus:border-violet-500 h-16 resize-none placeholder-slate-300"
                      />

                      <div className="space-y-1 pt-2">
                        {/* Type Row */}
                        <div className="flex items-center justify-between py-1.5 relative">
                          <div className="flex items-center gap-4">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Jenis</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => {setShowTypeDrop(!showTypeDrop); setShowPriorityDrop(false); setShowAssignDrop(false);}} className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-500 bg-indigo-100/80 px-3 py-1 rounded-full outline-none">
                              <span className="w-2 h-2 bg-indigo-400 rounded-sm"></span> {newType}
                            </button>
                            <button onClick={() => {setShowTypeDrop(!showTypeDrop); setShowPriorityDrop(false); setShowAssignDrop(false);}} className="w-4 h-4 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-500">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                          {showTypeDrop && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-30 w-32 flex flex-col gap-1">
                              {["Tugas","Fitur","Bug","Design","Aset"].map(t => (
                                <button key={t} onClick={() => {setNewType(t); setShowTypeDrop(false);}} className="text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg">{t}</button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Priority Row */}
                        <div className="flex items-center justify-between py-1.5 relative">
                          <div className="flex items-center gap-4">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Prioritas</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => {setShowPriorityDrop(!showPriorityDrop); setShowTypeDrop(false); setShowAssignDrop(false);}} className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 bg-rose-100/80 px-3 py-1 rounded-full outline-none">
                              <span className="w-2 h-2 bg-rose-500 rounded-full"></span> {newPriority}
                            </button>
                            <button onClick={() => {setShowPriorityDrop(!showPriorityDrop); setShowTypeDrop(false); setShowAssignDrop(false);}} className="w-4 h-4 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-500">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                          {showPriorityDrop && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-30 w-32 flex flex-col gap-1">
                              {["Tertinggi","Tinggi","Sedang","Rendah"].map(p => (
                                <button key={p} onClick={() => {setNewPriority(p); setShowPriorityDrop(false);}} className="text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg">{p}</button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Assignee Row */}
                        <div className="flex items-center justify-between py-1.5 relative">
                          <div className="flex items-center gap-4">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Penerima</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => {setShowAssignDrop(!showAssignDrop); setShowTypeDrop(false); setShowPriorityDrop(false);}} className="flex -space-x-1.5 outline-none">
                              {newOrang.length > 0 ? newOrang.map((mInit, i) => {
                                const mem = teamMembers.find(d => d.initial === mInit);
                                return mem ? (
                                  <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-200 shadow-sm overflow-hidden z-10" title={mem.name}>
                                    <img src={mem.avatar} className="w-full h-full object-cover" alt="avatar" />
                                  </div>
                                ) : (
                                  <div key={i} className="w-5 h-5 rounded-full border border-white bg-slate-200 text-slate-600 text-[8px] font-bold flex items-center justify-center shadow-sm z-10">{mInit}</div>
                                );
                              }) : (
                                <span className="text-[10px] font-bold text-slate-400 px-2">Pilih</span>
                              )}
                            </button>
                            <button onClick={() => {setShowAssignDrop(!showAssignDrop); setShowTypeDrop(false); setShowPriorityDrop(false);}} className="w-4 h-4 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-500">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                          {showAssignDrop && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-30 w-48 flex flex-col gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Pilih Anggota</div>
                              {teamMembers.map(m => {
                                const isSelected = newOrang.includes(m.initial);
                                return (
                                  <button
                                    key={m.initial}
                                    onClick={() => {
                                      if (isSelected) {
                                        setNewOrang(newOrang.filter(o => o !== m.initial));
                                      } else {
                                        setNewOrang([...newOrang, m.initial]);
                                      }
                                    }}
                                    className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-colors ${isSelected ? "bg-violet-50" : "hover:bg-slate-50"}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <img src={m.avatar} className="w-5 h-5 rounded-full object-cover" alt={m.name} />
                                      <span className="text-[11px] font-bold text-slate-700">{m.name}</span>
                                    </div>
                                    {isSelected && (
                                      <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Date Row */}
                        <div className="flex items-center justify-between py-1.5 pt-2">
                          <div className="flex items-center gap-4">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Tanggal</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-600">
                              {day} {shortMonthNames[calMonth]} {calYear}
                            </span>
                            <button className="w-4 h-4 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 opacity-50 cursor-not-allowed">
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInlineAddTask(day);
                        }}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] py-2.5 rounded-xl shadow-md shadow-violet-100 active:scale-95 transition-all"
                      >
                        Tambah
                      </button>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
