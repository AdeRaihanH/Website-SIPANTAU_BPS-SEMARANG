"use client";

import React, { useState, useRef, useEffect } from "react";

export default function TabPapan({ tasks, setTasks, setSelectedTask, setTaskToDelete }) {
  const [showAddForm, setShowAddForm] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(6); // 0-indexed, 6 = July
  const [currentUserFullName, setCurrentUserFullName] = useState("");

  useEffect(() => {
    const name = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
    if (name) setCurrentUserFullName(name);
  }, []);

  const userAvatars = {
    "A": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=50&h=50&q=80",
    "M": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50&h=50&q=80",
    "N": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=50&h=50&q=80",
    "B": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=50&h=50&q=80",
    "R": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=50&h=50&q=80",
    "H": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=50&h=50&q=80",
    "C": "https://ui-avatars.com/api/?name=C&background=f1f5f9&color=64748b&bold=true",
  };

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("Tugas");
  const [newPriority, setNewPriority] = useState("Tertinggi");
  const [newDate, setNewDate] = useState("1 Jul 2026");
  const [newOrang, setNewOrang] = useState(["A"]);
  const [showTypeDrop, setShowTypeDrop] = useState(false);
  const [showPriorityDrop, setShowPriorityDrop] = useState(false);
  const [showAssignDrop, setShowAssignDrop] = useState(false);

  const dynamicMembers = [
    { name: "Aisha Alida Putri", initial: "A", avatar: userAvatars["A"] },
    { name: "Myesha Azka Hafizha", initial: "M", avatar: userAvatars["M"] },
    { name: "Nurul Kumala", initial: "N", avatar: userAvatars["N"] },
    { name: "Budi Santoso", initial: "B", avatar: userAvatars["B"] },
    { name: "Rizky Firmansyah", initial: "R", avatar: userAvatars["R"] },
    { name: "Hendra Saputra", initial: "H", avatar: userAvatars["H"] },
  ];

  if (currentUserFullName && !dynamicMembers.find(m => m.name === currentUserFullName)) {
    dynamicMembers.push({
      name: currentUserFullName,
      initial: currentUserFullName.charAt(0).toUpperCase(),
      avatar: userAvatars[currentUserFullName.charAt(0).toUpperCase()] || userAvatars["C"]
    });
  }

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const shortMonthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

  const handleAddTask = (status) => {
    const activeUserName = typeof window !== "undefined" ? (localStorage.getItem("sipantau_name") || "Andi Basudara") : "Andi Basudara";
    const newTask = {
      id: Date.now(),
      title: newTitle,
      desc: newDesc || "Tidak ada deskripsi",
      date: newDate,
      type: newType,
      priority: newPriority,
      status,
      done: false,
      orang: newOrang.length > 0 ? newOrang : ["A"],
      riwayat: [{ name: activeUserName, text: "telah menambahkan tugas baru", time: "baru saja", timestamp: Date.now() }],
      komentar: [],
    };
    setTasks([...tasks, newTask]);
    setNewTitle("");
    setNewDesc("");
    setNewOrang(["A"]);
    setShowAddForm(null);
    setShowCalendar(false);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sipantau-profile-updated"));
      }
    }, 100);
  };

  const handleDeleteTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTaskToDelete(task);
    }
    setActiveMenuId(null);
  };

  const handleDragStart = (e, id) => { setDraggedTaskId(id); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; };
  const handleDrop = (e, status) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    const activeUserName = typeof window !== "undefined" ? (localStorage.getItem("sipantau_name") || "Andi Basudara") : "Andi Basudara";
    const statusText = status === "done" ? "Selesai" : status === "inprogress" ? "In Progress" : status === "review" ? "In Review" : "To Do";
    setTasks(tasks.map(t => {
      if (t.id === draggedTaskId) {
        if (t.status !== status) {
          const newRiwayat = { name: activeUserName, text: `telah memindahkan tugas ke ${statusText}`, time: "baru saja", timestamp: Date.now() };
          return { ...t, status, riwayat: [newRiwayat, ...(t.riwayat || [])] };
        }
      }
      return t;
    }));
    setDraggedTaskId(null);
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sipantau-profile-updated"));
      }
    }, 100);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Tertinggi": return { bg: "bg-rose-100/80 text-rose-500", dot: "bg-rose-500" };
      case "Tinggi": return { bg: "bg-emerald-100/80 text-emerald-500", dot: "bg-emerald-500" };
      case "Sedang": return { bg: "bg-amber-100/80 text-amber-500", dot: "bg-amber-500" };
      case "Rendah": return { bg: "bg-cyan-100/80 text-cyan-500", dot: "bg-cyan-500" };
      case "Terendah": return { bg: "bg-violet-100/80 text-violet-500", dot: "bg-violet-500" };
      default: return { bg: "bg-slate-100/80 text-slate-500", dot: "bg-slate-500" };
    }
  };

  const columns = [
    { id: "todo", title: "To do", bg: "bg-slate-50/60", headerBg: "bg-[#95e5d3]", text: "text-slate-900" },
    { id: "inprogress", title: "In Progress", bg: "bg-slate-50/60", headerBg: "bg-rose-200/80", text: "text-slate-900" },
    { id: "review", title: "In Review", bg: "bg-slate-50/60", headerBg: "bg-sky-200/80", text: "text-slate-900" },
    { id: "done", title: "Done", bg: "bg-slate-50/60", headerBg: "bg-amber-200/80", text: "text-slate-900" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start h-[calc(100vh-160px)]">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            className={`rounded-2xl p-3 border border-slate-100 ${col.bg} flex flex-col gap-3 h-full max-h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            <div className={`flex items-center p-2.5 rounded-xl ${col.headerBg} mb-1 border-none`}>
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full border border-dashed border-slate-700/60 flex-shrink-0`} />
                <span className={`text-[13px] font-extrabold ${col.text}`}>{col.title}</span>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-3 flex-1">
              {colTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onClick={() => setSelectedTask(task)}
                  className={`bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-2 relative cursor-grab active:cursor-grabbing transition-opacity ${draggedTaskId === task.id ? "opacity-40" : "opacity-100"}`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-extrabold text-slate-800 leading-snug">{task.title}</h4>
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === task.id ? null : task.id)}
                        className="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer -mt-1"
                      >···</button>
                      {activeMenuId === task.id && (
                        <div ref={menuRef} className="absolute right-0 mt-1 w-32 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-20">
                          <button
                            onClick={() => { setSelectedTask(task); setActiveMenuId(null); }}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-between"
                          >
                            <span>Detail Tugas</span><span>›</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="w-full text-left px-3 py-1.5 text-[10px] font-bold text-rose-600 hover:bg-rose-50/50 flex items-center justify-between"
                          >
                            <span>Hapus Tugas</span><span>🗑️</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 mt-1">{task.desc}</p>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="bg-indigo-100/80 text-indigo-500 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-indigo-400 rounded-sm"></span> {task.type}
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${getPriorityBadge(task.priority).bg}`}>
                      <span className={`w-2 h-2 rounded-full ${getPriorityBadge(task.priority).dot}`}></span> {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                    <div className="flex -space-x-1.5">
                      {task.orang.map((o, idx) => (
                        <div key={idx} className="w-6 h-6 rounded-full border border-white bg-slate-200 shadow-sm overflow-hidden z-10">
                          <img src={userAvatars[o] || userAvatars["C"]} className="w-full h-full object-cover" alt="avatar" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {task.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Task Inline */}
            {showAddForm === col.id ? (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-4">
                <div className="flex items-center justify-between mb-2 border-b border-slate-50 pb-3">
                  <div className="w-full pr-3">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Masukkan Judul Tugas..."
                      className="text-[13px] font-extrabold text-slate-800 bg-white border border-slate-200 focus:border-violet-500 rounded-lg outline-none w-full px-3 py-2 placeholder-slate-400 transition-all shadow-sm"
                    />
                  </div>
                  <button onClick={() => setShowAddForm(null)} className="text-slate-400 hover:text-slate-600 font-bold shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Tambahkan deskripsi tugas di sini..."
                  className="w-full text-[11px] font-medium text-slate-700 border border-slate-100 bg-slate-50/50 rounded-xl p-3 outline-none focus:border-violet-500 h-20 resize-none placeholder-slate-400 shadow-sm"
                />

                <div className="flex flex-col divide-y divide-slate-100 pt-1">

                  {/* Tipe / Label */}
                  <div className="flex items-center justify-between py-2.5 relative">
                    <div className="flex items-center gap-4">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <button onClick={() => setShowTypeDrop(!showTypeDrop)} className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-500 bg-indigo-100/80 px-3 py-1 rounded-full outline-none">
                        <span className="w-2 h-2 bg-indigo-400 rounded-sm"></span> {newType}
                      </button>
                    </div>
                    <button onClick={() => setShowTypeDrop(!showTypeDrop)} className="w-4 h-4 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-500 transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    {showTypeDrop && (
                      <div className="absolute left-10 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-30 w-32 flex flex-col gap-1">
                        {["Tugas", "Fitur", "Bug", "Aset"].map(t => (
                          <button key={t} onClick={() => { setNewType(t); setShowTypeDrop(false); }} className="text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg">{t}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prioritas */}
                  <div className="flex items-center justify-between py-2.5 relative">
                    <div className="flex items-center gap-4">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <button onClick={() => setShowPriorityDrop(!showPriorityDrop)} className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 bg-rose-100/80 px-3 py-1 rounded-full outline-none">
                        <span className="w-2 h-2 bg-rose-500 rounded-full"></span> {newPriority}
                      </button>
                    </div>
                    <button onClick={() => setShowPriorityDrop(!showPriorityDrop)} className="w-4 h-4 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-500 transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    {showPriorityDrop && (
                      <div className="absolute left-10 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-30 w-32 flex flex-col gap-1">
                        {["Tertinggi", "Tinggi", "Sedang", "Rendah"].map(p => (
                          <button key={p} onClick={() => { setNewPriority(p); setShowPriorityDrop(false); }} className="text-left text-[11px] font-bold text-slate-700 hover:bg-slate-50 px-2 py-1.5 rounded-lg">{p}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Orang/Assignee */}
                  <div className="flex items-center justify-between py-2.5 relative">
                    <div className="flex items-center gap-4">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <button onClick={() => setShowAssignDrop(!showAssignDrop)} className="flex -space-x-1.5 outline-none hover:opacity-80 transition-opacity">
                        {newOrang.length > 0 ? newOrang.map((mInit, i) => {
                          const mem = dynamicMembers.find(d => d.initial === mInit);
                          return mem ? (
                            <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm overflow-hidden z-10">
                              <img src={mem.avatar} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div key={i} className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-600 text-[8px] font-bold shadow-sm z-10">{mInit}</div>
                          )
                        }) : (
                          <div className="w-5 h-5 rounded-full bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-[10px] text-slate-400">?</div>
                        )}
                      </button>
                    </div>
                    <button onClick={() => setShowAssignDrop(!showAssignDrop)} className="w-4 h-4 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-500 transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>
                    {showAssignDrop && (
                      <div className="absolute left-10 top-full mt-1 bg-white border border-slate-100 shadow-xl rounded-xl p-2 z-30 w-48 flex flex-col gap-1 max-h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {dynamicMembers.map((member) => (
                          <button key={member.name}
                            onClick={() => {
                              const has = newOrang.includes(member.initial);
                              setNewOrang(has ? newOrang.filter(o => o !== member.initial) : [...newOrang, member.initial]);
                            }}
                            className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-600"
                          >
                            <div className="flex items-center gap-2">
                              <img src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full object-cover" />
                              <span>{member.name}</span>
                            </div>
                            {newOrang.includes(member.initial) && <span className="text-violet-600">&#x2713;</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Calendar / Date */}
                  <div className="flex items-center justify-between py-2.5 relative">
                    <div className="flex items-center gap-4">
                      <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {newDate && (
                        <button onClick={() => setShowCalendar(!showCalendar)} className="text-[11px] font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full outline-none">
                          {newDate}
                        </button>
                      )}
                    </div>
                    <button onClick={() => setShowCalendar(!showCalendar)} className="w-4 h-4 rounded-full border border-dashed border-slate-400 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-500 transition-colors">
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    </button>

                    {showCalendar && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 shadow-2xl rounded-2xl p-3 z-30 w-52">
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-800 border-b pb-1.5 mb-1.5">
                          <span>{monthNames[calMonth]} {calYear}</span>
                          <div className="flex gap-1">
                            <button onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }} className="px-1.5 hover:bg-slate-100 rounded">&lt;</button>
                            <button onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }} className="px-1.5 hover:bg-slate-100 rounded">&gt;</button>
                          </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold">
                          {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => <span key={i} className="text-slate-400">{d}</span>)}
                          {Array.from({ length: getFirstDay(calYear, calMonth) }).map((_, i) => <span key={i} />)}
                          {[...Array(getDaysInMonth(calYear, calMonth))].map((_, i) => {
                            const d = i + 1;
                            const dateStr = `${d} ${shortMonthNames[calMonth]} ${calYear}`;
                            return (
                              <button key={d} onClick={() => { setNewDate(dateStr); setShowCalendar(false); }}
                                className={`p-1 rounded hover:bg-violet-50 hover:text-violet-600 ${newDate === dateStr ? "bg-violet-600 text-white" : "text-slate-600"}`}
                              >{d}</button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAddTask(col.id)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-[13px] py-2.5 rounded-xl shadow-md active:scale-95 transition-all mt-1"
                >Tambah</button>
              </div>
            ) : (
              <button
                onClick={() => { setShowAddForm(col.id); setNewTitle(""); setShowCalendar(false); }}
                className="w-full border border-dashed border-slate-200 hover:border-slate-300 hover:bg-white text-slate-400 hover:text-slate-600 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>+</span> Tambah
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
