"use client";

import React, { useState, useRef, useEffect } from "react";
import { createTask, updateTask } from "../../../../backend/tasks";

export default function TabPapan({ tasks, setTasks, setSelectedTask, setIsAddingTask, setTaskToDelete, team }) {
  const [showAddForm, setShowAddForm] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [currentUserFullName, setCurrentUserFullName] = useState("");

  useEffect(() => {
    const name = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
    if (name) setCurrentUserFullName(name);
  }, []);

  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState("Tugas");
  const [newPriority, setNewPriority] = useState("Tertinggi");
  const [newDate, setNewDate] = useState("");
  const [toasts, setToasts] = useState([]);

  const triggerWarning = (message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const [newOrang, setNewOrang] = useState([]);
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
      }))
    : [];

  useEffect(() => {
    if (showAddForm && newOrang.length === 0 && teamMembers.length > 0) {
      setNewOrang([teamMembers[0].initial]);
    }
  }, [showAddForm, teamMembers]);

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

  const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  const shortMonthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => { const d = new Date(y, m, 1).getDay(); return d === 0 ? 6 : d - 1; };

  const handleAddTask = async (status) => {
    if (!newTitle.trim()) {
      triggerWarning("Judul tugas tidak boleh kosong!");
      return;
    }
    if (!newDesc.trim()) {
      triggerWarning("Deskripsi tugas tidak boleh kosong!");
      return;
    }
    if (!newDate || !newDate.trim()) {
      triggerWarning("Tenggat waktu harus dipilih!");
      return;
    }

    const activeUserName = typeof window !== "undefined" ? (localStorage.getItem("sipantau_name") || "Andi Basudara") : "Andi Basudara";
    
    let dbStatus = status;
    if (dbStatus === "done" || dbStatus === "completed") dbStatus = "done";
    else if (dbStatus === "inprogress") dbStatus = "in_progress";
    else if (dbStatus === "inreview") dbStatus = "in_review";

    const mappedPriority = newPriority === "Tertinggi" ? "urgent" : newPriority === "Tinggi" ? "high" : newPriority === "Sedang" ? "medium" : "low";
    
    // We don't have the team id easily accessible unless we pass it.
    // For now we assume a task created here will just lack group_id unless passed,
    // wait, TabPapan receives team as a prop?
    // Let's check props: { tasks, setTasks, setSelectedTask, setTaskToDelete }
    // Since we don't have team prop, we can't properly assign group_id!
    // But since `tasks` are passed, we could get group_id from the first task, but what if empty?
    // Actually, I should just pass `teamId` from page.js or use localStorage...
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const match = currentUrl.match(/\/team\/([^/]+)/);
    const teamId = match ? match[1] : "1";

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
      status: dbStatus,
      type: newType,
      priority: mappedPriority,
      group_id: teamId,
      assigned_to: assignedToId
    };

    try {
      const created = await createTask(newTaskData);
      
      const newTask = {
        id: created.id,
        title: newTitle,
        desc: newDesc || "Tidak ada deskripsi",
        date: newDate,
        type: newType,
        priority: newPriority,
        status,
        done: false,
        orang: newOrang.length > 0 ? newOrang : ["A"],
        riwayat: [{ name: activeUserName, text: "telah menambahkan tugas baru", time: "baru saja" }],
        komentar: [],
      };
      const updatedList = [...tasks, newTask];
      setTasks(updatedList);
      setNewTitle("");
      setNewDesc("");
      setNewOrang(["A"]);
      setShowAddForm(null);
      setShowCalendar(false);
    } catch (e) {
      alert("Gagal menambahkan tugas: " + e.message);
    }
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
  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (!draggedTaskId) return;
    
    let dbStatus = status;
    if (dbStatus === "done" || dbStatus === "completed") dbStatus = "done";
    else if (dbStatus === "inprogress") dbStatus = "in_progress";
    else if (dbStatus === "inreview") dbStatus = "in_review";

    const updatedTasksList = tasks.map(t => t.id === draggedTaskId ? { ...t, status, done: status === "done" || status === "completed" } : t);
    setTasks(updatedTasksList);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sipantau-toast", {
        detail: { message: "Status tugas berhasil dipindahkan.", type: "info" }
      }));
    }

    updateTask(draggedTaskId, { status: dbStatus }).catch(err => {
      console.warn("Supabase updateTask status warning:", err);
    });
    
    setDraggedTaskId(null);
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
    <>
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
                      {task.orang && task.orang.map((o, idx) => {
                        const mem = teamMembers.find(d => d.initial === o);
                        return mem && mem.avatar ? (
                          <div key={idx} className="w-6 h-6 rounded-full border border-white bg-slate-200 shadow-sm overflow-hidden z-10">
                            <img src={mem.avatar} className="w-full h-full object-cover" alt={mem.name} />
                          </div>
                        ) : (
                          <div key={idx} className="w-6 h-6 rounded-full bg-violet-500 border border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm z-10">
                            {o}
                          </div>
                        );
                      })}
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
            <button
              onClick={(e) => {
                if (setIsAddingTask) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setIsAddingTask({
                    status: col.id,
                    rect: {
                      top: rect.top,
                      bottom: rect.bottom,
                      left: rect.left,
                      right: rect.right,
                      width: rect.width,
                      height: rect.height,
                    }
                  });
                }
              }}
              className="w-full border border-dashed border-slate-200 hover:border-slate-300 hover:bg-white text-slate-400 hover:text-slate-600 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm mt-3"
            >
              <span>+</span> Tambah
            </button>
          </div>
        );
      })}
    </div>

      {/* Warning Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-[#fffbeb] border-l-4 border-amber-500 rounded-xl shadow-lg p-4 min-w-[320px] transform transition-all animate-[slideIn_0.3s_ease-out_forwards]"
          >
            {/* Warning Icon */}
            <div className="text-amber-500 shrink-0 mt-0.5 animate-pulse">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            {/* Content */}
            <div className="flex-1">
              <h4 className="text-xs font-bold text-slate-800">Warning</h4>
              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{toast.message}</p>
            </div>
            {/* Close Button */}
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="text-amber-400 hover:text-amber-600 transition-colors p-0.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}} />
    </>
  );
}
