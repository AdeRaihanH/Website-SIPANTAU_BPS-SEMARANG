"use client";
import React, { useState, useRef, useEffect } from "react";
import { createTask, updateTask } from "../../../../backend/tasks";
import ToastContainer from "../../../../components/Toast";


const parseTaskDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.trim().split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const year = parseInt(parts[2]);
  const monthStr = parts[1].toLowerCase();
  const fullMonths = ["januari", "februari", "maret", "april", "mei", "juni", "juli", "agustus", "september", "oktober", "november", "desember"];
  const shortMonths = ["jan", "feb", "mar", "apr", "mei", "jun", "jul", "agu", "sep", "okt", "nov", "des"];
  let month = fullMonths.findIndex(m => monthStr.startsWith(m.substring(0, 3)));
  if (month === -1) month = shortMonths.findIndex(m => monthStr.startsWith(m.substring(0, 3)));
  if (isNaN(day) || isNaN(year) || month === -1) return null;
  return { day, month, year };
};

const getUserAvatar = (name) => {
  const currentName = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
  const currentEmail = typeof window !== "undefined" ? localStorage.getItem("sipantau_email") : null;
  if (currentName && name && currentName.trim().toLowerCase() === name.trim().toLowerCase()) {
    const stored = typeof window !== "undefined" && currentEmail ? localStorage.getItem(`sipantau_avatar_${currentEmail.toLowerCase()}`) : null;
    if (stored) return stored;
  }
  if (name === "Myesha Azka" || name === "Myesha Azka Hafizha") return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50&h=50&q=80";
  if (name === "Nurul Kumala") return "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=50&h=50&q=80";
  if (name === "Aisha Alida Putri") return "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=50&h=50&q=80";
  if (name === "Andi Basudara") return "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=50&h=50&q=80";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=f1f5f9&color=64748b&bold=true`;
};

const monthNamesGlobal = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const shiftDate = (dateStr, days) => {
  const parsed = parseTaskDate(dateStr);
  if (!parsed) return dateStr;
  const d = new Date(parsed.year, parsed.month, parsed.day);
  d.setDate(d.getDate() + days);
  return `${d.getDate()} ${monthNamesGlobal[d.getMonth()]} ${d.getFullYear()}`;
};

const userAvatars = {
  "A": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=50&h=50&q=80",
  "M": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=50&h=50&q=80",
  "N": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=50&h=50&q=80",
  "B": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=50&h=50&q=80",
  "R": "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=50&h=50&q=80",
  "H": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=50&h=50&q=80",
  "C": "https://ui-avatars.com/api/?name=C&background=f1f5f9&color=64748b&bold=true",
};

const availableMembers = [
  { name: "Aisha Alida Putri", initial: "A", avatar: userAvatars["A"], color: "bg-violet-400" },
  { name: "Myesha Azka Hafizha", initial: "M", avatar: userAvatars["M"], color: "bg-emerald-400" },
  { name: "Nurul Kumala", initial: "N", avatar: userAvatars["N"], color: "bg-amber-400" },
  { name: "Budi Santoso", initial: "B", avatar: userAvatars["B"], color: "bg-sky-400" },
  { name: "Citra Kirana", initial: "C", avatar: userAvatars["C"], color: "bg-pink-400" },
  { name: "Dewi Lestari", initial: "D", avatar: "https://ui-avatars.com/api/?name=Dewi+Lestari&background=f1f5f9&color=64748b&bold=true", color: "bg-rose-400" },
  { name: "Eko Prasetyo", initial: "E", avatar: "https://ui-avatars.com/api/?name=Eko+Prasetyo&background=f1f5f9&color=64748b&bold=true", color: "bg-orange-400" },
];

export default function GlobalTaskModals({
  tasks,
  setTasks,
  selectedTask,
  setSelectedTask,
  isAddingTask,
  setIsAddingTask,
  setTaskToDelete,
  team,
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);
  const [typeSearch, setTypeSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [newComment, setNewComment] = useState("");
  const [taskTypes, setTaskTypes] = useState(["Design", "Bug", "Aset", "Fitur", "Tugas"]);
  const [newTypeName, setNewTypeName] = useState("");
  const [currentUserFullName, setCurrentUserFullName] = useState("");

  useEffect(() => {
    const name = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
    if (name) setCurrentUserFullName(name);
  }, []);

  const dynamicMembers = [...availableMembers];
  if (currentUserFullName && !dynamicMembers.find(m => m.name.toLowerCase() === currentUserFullName.toLowerCase())) {
    const initial = currentUserFullName.charAt(0).toUpperCase();
    dynamicMembers.unshift({
      name: currentUserFullName,
      initial: initial,
      avatar: getUserAvatar(currentUserFullName),
      color: "bg-slate-400"
    });
  }

  // Filter dynamicMembers based on team.membersList if team is provided
  const filteredMembers = team && team.membersList
    ? team.membersList.map(member => ({
        id: member.id,
        name: member.full_name,
        initial: member.full_name ? member.full_name.charAt(0).toUpperCase() : "?",
        avatar: member.avatar_url || getUserAvatar(member.full_name),
        color: "bg-slate-400"
      }))
    : dynamicMembers;

  // Edit Task Local State
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [isSubtasksOpen, setIsSubtasksOpen] = useState(true);

  useEffect(() => {
    if (selectedTask) {
      setEditTitle(selectedTask.title || "");
      setEditDesc(selectedTask.desc || "");
    }
  }, [selectedTask?.id]);

  // Add Task Form State
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addType, setAddType] = useState("Tugas");
  const [addPriority, setAddPriority] = useState("Sedang");
  const [addOrang, setAddOrang] = useState(["A"]);
  const [addDate, setAddDate] = useState("18 Juli 2026");
  const [addStatus, setAddStatus] = useState("todo");

  // Refs for Dropdowns
  const editDateBtnRef = useRef(null);
  const addDateBtnRef = useRef(null);
  const editTypeBtnRef = useRef(null);
  const editPriorityBtnRef = useRef(null);
  const editAssigneeBtnRef = useRef(null);
  const editStatusBtnRef = useRef(null);
  const addTypeBtnRef = useRef(null);
  const addPriorityBtnRef = useRef(null);
  const addAssigneeBtnRef = useRef(null);
  const [dropdownCoords, setDropdownCoords] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = (title, message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };


  // Close active dropdown on scroll (so floating menus don't detach), but allow scrolling inside the dropdown itself
  useEffect(() => {
    const handleScroll = (e) => {
      const container = document.getElementById("sipantau-floating-dropdown");
      if (container && (e.target === container || container.contains(e.target))) {
        return;
      }
      if (activeDropdown) {
        setActiveDropdown(null);
        setDropdownCoords(null);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [activeDropdown]);

  const toggleDropdown = (name, triggerRef, align = "left", customWidth = null) => {
    if (activeDropdown === name) {
      setActiveDropdown(null);
      setDropdownCoords(null);
    } else {
      setActiveDropdown(name);
      if (triggerRef && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        let left = rect.left;
        let top = rect.bottom + 6;
        let bottom = undefined;

        if (align === "right") {
          const width = customWidth || 224;
          left = rect.right - width;
        } else {
          // If close to right edge, shift left
          if (left + 260 > window.innerWidth) {
            left = window.innerWidth - 280;
          }
          // If close to bottom edge, pop upwards
          if (top + 300 > window.innerHeight) {
            top = undefined;
            bottom = window.innerHeight - rect.top + 8;
          }
        }
        setDropdownCoords({
          top,
          bottom,
          left: Math.max(10, left),
          width: rect.width
        });
      }
    }
  };

  // Dynamic Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date(2026, 6, 1)); // Default July 2026

  useEffect(() => {
    if (isAddingTask) {
      const status = typeof isAddingTask === "string" ? isAddingTask : isAddingTask.status;
      setAddStatus(status);
      setAddTitle("");
      setAddDesc("");
      setAddType("Tugas");
      setAddPriority("Sedang");
      setAddOrang(["A"]);
      setAddDate("18 Juli 2026");
    }
  }, [isAddingTask]);

  // Lock body scroll when modal is open to prevent background scrolling and visual glitches
  useEffect(() => {
    if (selectedTask || (isAddingTask && typeof isAddingTask === "string")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedTask, isAddingTask]);

  useEffect(() => {
    function handleClickOutside(event) {
      const container = document.getElementById("sipantau-floating-dropdown");
      if (container && container.contains(event.target)) {
        return; // Click inside the floating dropdown list
      }
      if (event.target.closest("button") || event.target.closest("a")) {
        return; // Click on trigger button
      }
      setActiveDropdown(null);
      setDropdownCoords(null);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUpdateTaskField = (field, value) => {
    if (!selectedTask) return;
    const activeUserName = typeof window !== "undefined" ? (localStorage.getItem("sipantau_name") || "Andi Basudara") : "Andi Basudara";
    let actionText = "telah memperbarui tugas";

    let updates = {};
    if (typeof field === "object") {
      updates = field;
      if (updates.status) actionText = "telah mengubah status tugas";
      else actionText = "telah memperbarui tugas";
    } else {
      updates[field] = value;
      if (field === "status") actionText = "telah mengubah status tugas";
      else if (field === "priority") actionText = "telah memperbarui prioritas pada";
      else if (field === "type") actionText = "telah mengubah jenis tugas";
      else if (field === "orang") actionText = "telah mengubah penerima tugas";
      else if (field === "date") actionText = "telah mengubah tenggat waktu pada";
      else {
        const editVerbs = ["telah mengedit detail pada", "telah melakukan perubahan pada", "telah memperbarui detail"];
        actionText = editVerbs[Math.floor(Math.random() * editVerbs.length)];
      }
    }

    const newHistory = { name: activeUserName, text: actionText, time: "baru saja", timestamp: Date.now() };

    // Avoid duplicate 'baru saja' logs for the same field if done rapidly
    let updatedRiwayat = selectedTask.riwayat || [];
    if (updatedRiwayat.length > 0 && updatedRiwayat[0].text === actionText && updatedRiwayat[0].time === "baru saja") {
      // Do not add duplicate
    } else {
      updatedRiwayat = [newHistory, ...updatedRiwayat];
    }

    const updated = { ...selectedTask, ...updates, riwayat: updatedRiwayat };
    
    // Convert status to DB format
    let dbStatus = updated.status;
    if (dbStatus === "done") dbStatus = "completed";
    else if (dbStatus === "inprogress") dbStatus = "in_progress";
    
    // Map to DB
    const dbUpdates = {
      title: updated.title,
      description: updated.desc,
      status: dbStatus,
      type: updated.type,
      priority: updated.priority === "Tertinggi" ? "urgent" : updated.priority === "Tinggi" ? "high" : updated.priority === "Sedang" ? "medium" : "low"
    };

    if (updates.orang && updates.orang.length > 0) {
      const selectedMember = filteredMembers.find(m => m.initial === updates.orang[0]);
      if (selectedMember && selectedMember.id) {
        dbUpdates.assigned_to = selectedMember.id;
        updated.assigned_to = selectedMember.id;
      }
    }

    updateTask(selectedTask.id, dbUpdates).catch(e => console.error("Failed to update task", e));

    setSelectedTask(updated);
    setTasks(tasks.map((t) => (t.id === selectedTask.id ? updated : t)));
    showToast("Info", "Perubahan detail tugas berhasil disimpan.", "info");
    setTimeout(() => {

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sipantau-profile-updated"));
      }
    }, 100);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTask) return;
    const activeUserName = typeof window !== "undefined" ? (localStorage.getItem("sipantau_name") || "Andi Basudara") : "Andi Basudara";
    const comment = { name: activeUserName, text: newComment };
    const updated = {
      ...selectedTask,
      komentar: [...selectedTask.komentar, comment],
    };
    setSelectedTask(updated);
    setSelectedTask(updated);
    setTasks(tasks.map((t) => (t.id === selectedTask.id ? updated : t)));
    setNewComment("");
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("sipantau-profile-updated"));
      }
    }, 100);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskName.trim() || !selectedTask) return;
    const currentSubtasks = selectedTask.subtugas || [];
    const updatedSubtasks = [...currentSubtasks, { title: newSubtaskName, done: false }];
    handleUpdateTaskField("subtugas", updatedSubtasks);
    setIsAddingSubtask(false);
    setNewSubtaskName("");
  };

  const handleToggleSubtask = (index) => {
    if (!selectedTask) return;
    const currentSubtasks = selectedTask.subtugas || [];
    const updatedSubtasks = currentSubtasks.map((st, i) =>
      i === index ? { ...st, done: !st.done } : st
    );
    handleUpdateTaskField("subtugas", updatedSubtasks);
  };

  const handleDeleteTask = (id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      setTaskToDelete(task);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Tertinggi": return "bg-rose-100/70 text-rose-600 border border-rose-200/40 hover:bg-rose-200/50";
      case "Tinggi": return "bg-emerald-100/70 text-emerald-600 border border-emerald-200/40 hover:bg-emerald-200/50";
      case "Sedang": return "bg-amber-100/70 text-amber-600 border border-amber-200/40 hover:bg-amber-200/50";
      case "Rendah": return "bg-cyan-100/70 text-cyan-600 border border-cyan-200/40 hover:bg-cyan-200/50";
      case "Terendah": return "bg-violet-100/70 text-violet-600 border border-violet-200/40 hover:bg-violet-200/50";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityDotColor = (priority) => {
    switch (priority) {
      case "Tertinggi": return "bg-rose-500";
      case "Tinggi": return "bg-emerald-500";
      case "Sedang": return "bg-amber-500";
      case "Rendah": return "bg-cyan-500";
      case "Terendah": return "bg-violet-500";
      default: return "bg-slate-500";
    }
  };

  const getTypeStyle = (type) => {
    const t = (type || "").toLowerCase();
    switch (t) {
      case "design": return "bg-violet-100/70 text-violet-600 border border-violet-200/40 hover:bg-violet-200/50";
      case "bug": return "bg-cyan-100/70 text-cyan-600 border border-cyan-200/40 hover:bg-cyan-200/50";
      case "aset": return "bg-amber-100/70 text-amber-600 border border-amber-200/40 hover:bg-amber-200/50";
      case "fitur": return "bg-rose-100/70 text-rose-600 border border-rose-200/40 hover:bg-rose-200/50";
      default: return "bg-indigo-100/70 text-indigo-600 border border-indigo-200/40 hover:bg-indigo-200/50";
    }
  };

  const getTypeDotColor = (type) => {
    const t = (type || "").toLowerCase();
    switch (t) {
      case "design": return "bg-violet-500";
      case "bug": return "bg-cyan-500";
      case "aset": return "bg-amber-500";
      case "fitur": return "bg-rose-500";
      default: return "bg-indigo-500";
    }
  };


  // Dynamic Calendar Generator
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => {
    let day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // 0 = Mon, 6 = Sun in our array
  };

  const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  const renderCalendarDropdown = (onSelectDate) => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const style = dropdownCoords
      ? { position: "fixed", top: `${dropdownCoords.top}px`, left: `${dropdownCoords.left}px` }
      : { position: "absolute", top: "100%", left: 0, marginTop: "6px" };

    return (
      <div
        style={style}
        className="bg-white border border-slate-100 shadow-2xl rounded-2xl p-3.5 z-[100] w-56 text-left"
      >
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 border-b pb-2 mb-2">
          <button onClick={handlePrevMonth} className="px-2 py-0.5 hover:bg-slate-100 rounded text-slate-500 text-sm">&lt;</button>
          <span>{monthNames[month]} {year}</span>
          <button onClick={handleNextMonth} className="px-2 py-0.5 hover:bg-slate-100 rounded text-slate-500 text-sm">&gt;</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold">
          {["S", "S", "R", "K", "J", "S", "M"].map((d, i) => (
            <span key={i} className="text-slate-400 py-1">{d}</span>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <span key={`empty-${i}`}></span>
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const d = i + 1;
            const dateStr = `${d} ${monthNames[month]} ${year}`;
            return (
              <button
                key={d}
                onClick={() => {
                  onSelectDate(dateStr);
                  setActiveDropdown(null);
                  setDropdownCoords(null);
                }}
                className={`p-1.5 rounded-lg hover:bg-violet-50 hover:text-violet-600 transition-colors`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderFloatingDropdown = () => {
    if (!activeDropdown || !dropdownCoords) return null;
    const style = {
      position: "fixed",
      left: `${dropdownCoords.left}px`,
      zIndex: 9999
    };
    if (dropdownCoords.top !== undefined) style.top = `${dropdownCoords.top}px`;
    if (dropdownCoords.bottom !== undefined) style.bottom = `${dropdownCoords.bottom}px`;

    switch (activeDropdown) {
      case "jenis":
        return (
          <div id="sipantau-floating-dropdown" style={style} className="bg-white border border-slate-150 rounded-[1.5rem] shadow-xl p-4 space-y-3 w-64 text-left">
            <div className="text-center text-xs font-bold text-slate-700">Jenis Tugas</div>
            <input
              type="text"
              placeholder="Cari jenis tugas..."
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-violet-500 placeholder-slate-350 transition-colors"
            />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Jenis</div>
            <div className="space-y-2">
              {taskTypes
                .filter((t) => t.toLowerCase().includes(typeSearch.toLowerCase()))
                .map((type) => (
                  <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTask?.type === type}
                      onChange={() => { handleUpdateTaskField("type", type); setActiveDropdown(null); setDropdownCoords(null); }}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0"
                    />
                    <span className={`text-[10px] font-bold py-1.5 flex-1 text-center rounded-full transition-all border ${type.toLowerCase() === "design" ? "bg-violet-100 text-violet-600 border-violet-200/40" :
                      type.toLowerCase() === "bug" ? "bg-cyan-100 text-cyan-600 border-cyan-200/40" :
                        type.toLowerCase() === "aset" ? "bg-amber-100 text-amber-600 border-amber-200/40" :
                          type.toLowerCase() === "fitur" ? "bg-rose-100 text-rose-600 border-rose-200/40" :
                            "bg-indigo-100 text-indigo-600 border-indigo-200/40"
                      }`}>
                      {type}
                    </span>
                  </label>
                ))}
            </div>
            <input
              type="text"
              placeholder="Buat jenis tugas baru"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTypeName.trim()) {
                  const trimmed = newTypeName.trim();
                  if (!taskTypes.includes(trimmed)) {
                    setTaskTypes([...taskTypes, trimmed]);
                  }
                  handleUpdateTaskField("type", trimmed);
                  setNewTypeName("");
                  setActiveDropdown(null);
                  setDropdownCoords(null);
                }
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-violet-500 placeholder-slate-350 transition-colors"
            />
          </div>
        );
      case "prioritas":
        return (
          <div id="sipantau-floating-dropdown" style={style} className="bg-white border border-slate-150 rounded-[1.5rem] shadow-xl p-4 w-60 text-left">
            <div className="space-y-2">
              {["Terendah", "Rendah", "Sedang", "Tinggi", "Tertinggi"].map((prio) => (
                <button
                  key={prio}
                  onClick={() => { handleUpdateTaskField("priority", prio); setActiveDropdown(null); setDropdownCoords(null); }}
                  className={`w-full text-center py-2 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${prio === "Terendah" ? "bg-violet-100 text-violet-600 border-violet-200/40 hover:bg-violet-150" :
                    prio === "Rendah" ? "bg-cyan-100 text-cyan-600 border-cyan-200/40 hover:bg-cyan-150" :
                      prio === "Sedang" ? "bg-amber-100 text-amber-600 border-amber-200/40 hover:bg-amber-150" :
                        prio === "Tinggi" ? "bg-emerald-100 text-emerald-600 border-emerald-200/40 hover:bg-emerald-150" :
                          "bg-rose-100 text-rose-600 border-rose-200/40 hover:bg-rose-150"
                    }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>
        );
      case "penerima":
        return (
          <div id="sipantau-floating-dropdown" style={style} className="bg-white border border-slate-100 rounded-2xl shadow-xl p-3 space-y-1.5 w-60 text-left">
            <div className="text-center text-xs font-bold text-slate-700 mb-2">Anggota</div>
            <input
              type="text"
              placeholder="Cari anggota..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-violet-500 placeholder-slate-350 transition-colors mb-2"
            />
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {dynamicMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())).map((member) => (
                <button
                  key={member.name}
                  onClick={() => {
                    if (!selectedTask) return;
                    const alreadyHas = selectedTask.orang.includes(member.initial);
                    const updatedOrang = alreadyHas
                      ? selectedTask.orang.filter((o) => o !== member.initial)
                      : [...selectedTask.orang, member.initial];
                    handleUpdateTaskField("orang", updatedOrang);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-600"
                >
                  <div className="flex items-center gap-2">
                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                    <span>{member.name}</span>
                  </div>
                  {selectedTask?.orang.includes(member.initial) && <span className="text-violet-600">✓</span>}
                </button>
              ))}
            </div>
          </div>
        );
      case "status":
        return (
          <div id="sipantau-floating-dropdown" style={style} className="bg-white border border-slate-100 rounded-2xl shadow-xl p-2 w-36 text-left space-y-1">
            {[
              { id: "todo", label: "To do", bg: "hover:bg-[#bbf7d0] hover:text-teal-900" },
              { id: "inprogress", label: "In Progress", bg: "hover:bg-[#fecdd3] hover:text-rose-900" },
              { id: "review", label: "In Review", bg: "hover:bg-[#bae6fd] hover:text-sky-900" },
              { id: "done", label: "Done", bg: "hover:bg-[#fef3c7] hover:text-amber-900" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  handleUpdateTaskField({ status: st.id, done: st.id === "done" });
                  setActiveDropdown(null);
                  setDropdownCoords(null);
                }}
                className={`w-full text-center px-4 py-2 text-xs font-bold text-slate-600 rounded-xl transition-colors cursor-pointer ${st.bg} ${selectedTask.status === st.id ? (
                  st.id === 'todo' ? 'bg-[#bbf7d0] text-teal-900' :
                    st.id === 'inprogress' ? 'bg-[#fecdd3] text-rose-900' :
                      st.id === 'review' ? 'bg-[#bae6fd] text-sky-900' :
                        'bg-[#fef3c7] text-amber-900'
                ) : ''}`}
              >
                {st.label}
              </button>
            ))}
          </div>
        );
      case "add-jenis":
        return (
          <div id="sipantau-floating-dropdown" style={style} className="bg-white border border-slate-150 rounded-[1.5rem] shadow-xl p-4 space-y-3 w-64 text-left">
            <div className="text-center text-xs font-bold text-slate-700">Jenis Tugas</div>
            <input
              type="text"
              placeholder="Cari jenis tugas..."
              value={typeSearch}
              onChange={(e) => setTypeSearch(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-violet-500 placeholder-slate-350 transition-colors"
            />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Jenis</div>
            <div className="space-y-2">
              {taskTypes
                .filter((t) => t.toLowerCase().includes(typeSearch.toLowerCase()))
                .map((type) => (
                  <label key={type} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addType === type}
                      onChange={() => { setAddType(type); setActiveDropdown(null); setDropdownCoords(null); }}
                      className="w-3.5 h-3.5 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0"
                    />
                    <span className={`text-[10px] font-bold py-1.5 flex-1 text-center rounded-full transition-all border ${type.toLowerCase() === "design" ? "bg-violet-100 text-violet-600 border-violet-200/40" :
                      type.toLowerCase() === "bug" ? "bg-cyan-100 text-cyan-600 border-cyan-200/40" :
                        type.toLowerCase() === "aset" ? "bg-amber-100 text-amber-600 border-amber-200/40" :
                          type.toLowerCase() === "fitur" ? "bg-rose-100 text-rose-600 border-rose-200/40" :
                            "bg-indigo-100 text-indigo-600 border-indigo-200/40"
                      }`}>
                      {type}
                    </span>
                  </label>
                ))}
            </div>
            <input
              type="text"
              placeholder="Buat jenis tugas baru"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTypeName.trim()) {
                  const trimmed = newTypeName.trim();
                  if (!taskTypes.includes(trimmed)) {
                    setTaskTypes([...taskTypes, trimmed]);
                  }
                  setAddType(trimmed);
                  setNewTypeName("");
                  setActiveDropdown(null);
                  setDropdownCoords(null);
                }
              }}
              className="w-full text-xs border border-slate-200 rounded-xl px-3.5 py-2 outline-none focus:border-violet-500 placeholder-slate-350 transition-colors"
            />
          </div>
        );
      case "add-prioritas":
        return (
          <div id="sipantau-floating-dropdown" style={style} className="bg-white border border-slate-150 rounded-[1.5rem] shadow-xl p-4 w-60 text-left">
            <div className="space-y-2">
              {["Terendah", "Rendah", "Sedang", "Tinggi", "Tertinggi"].map((prio) => (
                <button
                  key={prio}
                  onClick={() => { setAddPriority(prio); setActiveDropdown(null); setDropdownCoords(null); }}
                  className={`w-full text-center py-2 rounded-full text-[10px] font-bold transition-all border cursor-pointer ${prio === "Terendah" ? "bg-violet-100 text-violet-600 border-violet-200/40 hover:bg-violet-150" :
                    prio === "Rendah" ? "bg-cyan-100 text-cyan-600 border-cyan-200/40 hover:bg-cyan-150" :
                      prio === "Sedang" ? "bg-amber-100 text-amber-600 border-amber-200/40 hover:bg-amber-150" :
                        prio === "Tinggi" ? "bg-emerald-100 text-emerald-600 border-emerald-200/40 hover:bg-emerald-150" :
                          "bg-rose-100 text-rose-600 border-rose-200/40 hover:bg-rose-150"
                    }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>
        );
      case "add-penerima":
        return (
          <div id="sipantau-floating-dropdown" style={style} className="bg-white border border-slate-100 rounded-2xl shadow-xl p-3 space-y-1.5 w-60 text-left">
            <div className="text-center text-xs font-bold text-slate-700 mb-2">Anggota</div>
            <input
              type="text"
              placeholder="Cari anggota..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-violet-500 placeholder-slate-350 transition-colors mb-2"
            />
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {filteredMembers.filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase())).map((member) => (
                <button key={member.name}
                  onClick={() => {
                    const has = addOrang.includes(member.initial);
                    setAddOrang(has ? addOrang.filter(o => o !== member.initial) : [...addOrang, member.initial]);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-50 flex items-center justify-between text-[10px] font-bold text-slate-600"
                >
                  <div className="flex items-center gap-2">
                    <img src={member.avatar} alt={member.name} className="w-6 h-6 rounded-full object-cover" />
                    <span>{member.name}</span>
                  </div>
                  {addOrang.includes(member.initial) && <span className="text-violet-600">&#x2713;</span>}
                </button>
              ))}
            </div>
          </div>
        );
      case "add-status":
        return (
          <div id="sipantau-floating-dropdown" style={style} className="bg-white border border-slate-100 rounded-2xl shadow-xl py-1 w-36 text-left">
            {[
              { id: "todo", label: "To do" },
              { id: "inprogress", label: "In Progress" },
              { id: "review", label: "In Review" },
              { id: "done", label: "Done" },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setAddStatus(st.id);
                  setActiveDropdown(null);
                  setDropdownCoords(null);
                }}
                className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50 flex items-center justify-between"
              >
                {st.label}
              </button>
            ))}
          </div>
        );
      case "kalender":
        return renderCalendarDropdown((date) => handleUpdateTaskField("date", date));
      case "add-kalender":
        return renderCalendarDropdown((date) => setAddDate(date));
      default:
        return null;
    }
  };

  return (
    <>
      {/* ================= EDIT MODAL ================= */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl h-[600px] max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative border border-slate-100">

            {/* Modal Header */}
            <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4 w-full">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => {
                  setEditTitle(e.target.value);
                  handleUpdateTaskField("title", e.target.value);
                }}
                className="text-xl font-extrabold text-slate-800 border border-transparent hover:border-slate-200 focus:border-violet-300 rounded-lg outline-none w-full px-2 py-1 transition-all"
                placeholder="Judul tugas..."
              />
              <button
                onClick={() => { setSelectedTask(null); setActiveDropdown(null); }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-800 transition-colors font-extrabold cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="space-y-6">

                {/* Deskripsi */}
                <div className="space-y-2">
                  <label className="text-[13px] font-extrabold text-slate-800 block">Deskripsi</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => {
                      setEditDesc(e.target.value);
                      handleUpdateTaskField("desc", e.target.value);
                    }}
                    className="w-full text-xs font-semibold text-slate-600 border border-slate-200 rounded-xl p-3 bg-white outline-none focus:border-violet-500 h-20 resize-none transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  {/* Jenis Tugas */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-extrabold text-slate-800 block">Jenis Tugas</label>
                    <button
                      ref={editTypeBtnRef}
                      onClick={() => toggleDropdown("jenis", editTypeBtnRef)}
                      className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs font-bold cursor-pointer w-max transition-colors ${getTypeStyle(selectedTask.type)}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${getTypeDotColor(selectedTask.type)}`} />
                      <span>{selectedTask.type}</span>
                      <span className="text-[10px] ml-1">▼</span>
                    </button>
                  </div>

                  {/* Prioritas Tugas */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-extrabold text-slate-800 block">Prioritas Tugas</label>
                    <button
                      ref={editPriorityBtnRef}
                      onClick={() => toggleDropdown("prioritas", editPriorityBtnRef)}
                      className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs font-bold ${getPriorityStyle(selectedTask.priority)} cursor-pointer w-max transition-colors`}
                    >
                      <span className={`w-2 h-2 rounded-full ${getPriorityDotColor(selectedTask.priority)}`} />
                      <span>{selectedTask.priority}</span>
                      <span className="text-[10px] ml-1">▼</span>
                    </button>
                  </div>

                  {/* Penerima Tugas */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-extrabold text-slate-800 block">Penerima Tugas</label>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1.5">
                        {selectedTask.orang.map((m, i) => {
                          const memberObj = filteredMembers.find(mem => mem.initial === m);
                          return memberObj ? (
                            <img key={i} src={memberObj.avatar} alt={memberObj.name} className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm" />
                          ) : (
                            <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-slate-600 text-[10px] font-bold shadow-sm">
                              {m}
                            </div>
                          );
                        })}
                      </div>
                      <button
                        ref={editAssigneeBtnRef}
                        onClick={() => toggleDropdown("penerima", editAssigneeBtnRef)}
                        className="w-7 h-7 rounded-full border border-dashed border-slate-300 hover:border-slate-400 text-slate-400 hover:text-slate-600 text-sm flex items-center justify-center cursor-pointer bg-slate-50 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Tenggat Tugas */}
                  <div className="space-y-2">
                    <label className="text-[13px] font-extrabold text-slate-800 block">Tenggat Tugas</label>
                    <button
                      ref={editDateBtnRef}
                      onClick={() => toggleDropdown("kalender", editDateBtnRef)}
                      className="flex items-center gap-1.5 bg-white border border-transparent rounded-xl px-1 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer w-max transition-colors"
                    >
                      <span className="text-sm">📅</span>
                      <span>{selectedTask.date}</span>
                    </button>
                  </div>
                </div>

                {/* Subtugas */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={() => setIsSubtasksOpen(!isSubtasksOpen)}
                    className="text-[13px] font-extrabold text-slate-800 flex items-center gap-3 cursor-pointer w-max outline-none"
                  >
                    Subtugas
                    <span className="text-[10px] text-slate-600 transition-transform duration-200" style={{ transform: isSubtasksOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▼</span>
                  </button>

                  {isSubtasksOpen && (
                    <div className="space-y-3">
                      {(selectedTask.subtugas || []).map((st, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={st.done}
                            onChange={() => handleToggleSubtask(i)}
                            className="w-4 h-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 cursor-pointer shrink-0"
                          />
                          <span className={`text-xs font-semibold ${st.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{st.title}</span>
                        </div>
                      ))}

                      {!isAddingSubtask ? (
                        <button
                          onClick={() => setIsAddingSubtask(true)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[11px] px-3.5 py-2 rounded-lg transition-colors cursor-pointer w-max mt-2"
                        >
                          Tambah subtugas
                        </button>
                      ) : (
                        <div className="space-y-2.5 mt-2 w-full max-w-[280px]">
                          <input
                            type="text"
                            placeholder="Tambah subtugas"
                            value={newSubtaskName}
                            onChange={(e) => setNewSubtaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddSubtask();
                              }
                            }}
                            className="w-full text-xs font-semibold text-slate-700 border-2 border-violet-400 rounded-lg px-3 py-2 outline-none bg-white transition-colors placeholder-slate-200"
                            autoFocus
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleAddSubtask}
                              className="bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm shadow-violet-200"
                            >
                              Tambah
                            </button>
                            <button
                              onClick={() => {
                                setIsAddingSubtask(false);
                                setNewSubtaskName("");
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold text-[11px] px-4 py-2 rounded-lg transition-colors cursor-pointer"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 md:border-l md:border-slate-200 md:pl-6">

                {/* Status & Hapus Buttons */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <button
                      ref={editStatusBtnRef}
                      onClick={() => toggleDropdown("status", editStatusBtnRef)}
                      className={`flex items-center justify-between w-32 border rounded-xl px-3 py-2 text-xs font-bold capitalize cursor-pointer transition-colors ${selectedTask.status === "todo" ? "bg-[#bbf7d0] text-teal-900 border-[#86efac] hover:bg-[#86efac]" :
                        selectedTask.status === "inprogress" ? "bg-[#fecdd3] text-rose-900 border-[#fda4af] hover:bg-[#fda4af]" :
                          selectedTask.status === "review" ? "bg-[#bae6fd] text-sky-900 border-[#7dd3fc] hover:bg-[#7dd3fc]" :
                            "bg-[#fef3c7] text-amber-900 border-[#fde68a] hover:bg-[#fde68a]"
                        }`}
                    >
                      <span>{selectedTask.status === "todo" ? "To do" : selectedTask.status === "inprogress" ? "In Progress" : selectedTask.status === "review" ? "In Review" : "Done"}</span>
                      <span className="text-[10px] font-black opacity-80">▼</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    className="flex items-center gap-1.5 bg-rose-200/50 hover:bg-rose-200 rounded-xl px-3 py-2 text-xs font-bold text-rose-700 transition-colors cursor-pointer"
                  >
                    <span>Hapus Tugas</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Riwayat & Komentar Split */}
                <div className="flex flex-col h-[320px]">
                  {/* Riwayat */}
                  <div className="space-y-3 pt-2 flex-1 min-h-[140px] flex flex-col">
                    <h3 className="text-[13px] font-extrabold text-slate-800 block shrink-0">Riwayat</h3>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                      {selectedTask.riwayat && selectedTask.riwayat.map((hist, i) => (
                        <div key={`hist-${i}`} className="flex items-start gap-3">
                          <img
                            src={getUserAvatar(hist.name)}
                            alt="avatar"
                            className="w-7 h-7 rounded-full object-cover border border-slate-100 shrink-0"
                          />
                          <div className="pt-0.5">
                            <p className="text-[11px] text-slate-500 font-medium leading-tight">
                              <strong className="text-slate-700">{hist.name}</strong> {hist.text}
                            </p>
                            <span className="text-[9px] text-slate-400 font-medium">{hist.time}</span>
                          </div>
                        </div>
                      ))}
                      {(!selectedTask.riwayat || selectedTask.riwayat.length === 0) && (
                        <p className="text-[11px] text-slate-400 italic">Belum ada riwayat.</p>
                      )}
                    </div>
                  </div>

                  {/* Komentar */}
                  <div className="space-y-3 pt-4 flex-1 min-h-[140px] flex flex-col border-t border-slate-50 mt-2">
                    <h3 className="text-[13px] font-extrabold text-slate-800 block shrink-0">Komentar</h3>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                      {selectedTask.komentar && [...selectedTask.komentar].sort((a, b) => {
                        if (a.timestamp && b.timestamp) return b.timestamp - a.timestamp;
                        if (a.timestamp) return -1;
                        if (b.timestamp) return 1;
                        return 0;
                      }).map((comment, i) => (
                        <div key={`com-${i}`} className="flex items-start gap-3">
                          <img
                            src={getUserAvatar(comment.name)}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0"
                          />
                          <div className="pt-0.5">
                            <p className="text-xs text-slate-700 font-bold leading-tight">{comment.name}</p>
                            <p className="text-[11px] text-slate-500 font-semibold mt-0.5 leading-relaxed">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                      {(!selectedTask.komentar || selectedTask.komentar.length === 0) && (
                        <p className="text-[11px] text-slate-400 italic">Belum ada komentar.</p>
                      )}
                    </div>

                    <div className="flex items-start gap-3 pt-2 shrink-0">
                      <img
                        src={getUserAvatar(typeof window !== "undefined" ? (localStorage.getItem("sipantau_name") || "Andi Basudara") : "Andi Basudara")}
                        alt="avatar"
                        className="w-8 h-8 rounded-full object-cover border border-slate-100 shrink-0 mt-0.5"
                      />
                      <div className="flex-1 relative">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                          placeholder="Tambahkan komentar..."
                          className="w-full text-[11px] font-semibold text-slate-600 border border-slate-200 rounded-xl py-2.5 pl-3 pr-10 outline-none focus:border-violet-500 transition-colors resize-none h-10 leading-tight"
                        />
                        <button
                          onClick={handleAddComment}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-violet-600 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4 transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD MODAL ================= */}
      {isAddingTask && (
        <>
          {/* Overlay to close modal when clicking outside */}
          <div
            className={`fixed inset-0 z-40 ${typeof isAddingTask === "string" ? "bg-slate-900/40 backdrop-blur-sm" : ""}`}
            onClick={() => { setIsAddingTask(null); setActiveDropdown(null); }}
          ></div>

          <div
            className={`fixed z-50 ${typeof isAddingTask !== "object" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" : ""}`}
            style={
              typeof isAddingTask === "object"
                ? {
                    ...(isAddingTask.top !== undefined && { top: isAddingTask.top }),
                    ...(isAddingTask.bottom !== undefined && { bottom: isAddingTask.bottom }),
                    ...(isAddingTask.right !== undefined && { right: isAddingTask.right }),
                    ...(isAddingTask.left !== undefined && { left: isAddingTask.left }),
                  }
                : {}
            }
          >
            <div className="bg-white rounded-2xl w-full max-w-[300px] max-h-[380px] overflow-y-auto shadow-2xl relative border border-slate-100 flex flex-col custom-scrollbar">

              {/* Header */}
              <div className="px-3 py-2.5 flex items-start justify-between border-b border-slate-50">
                <div className="w-full pr-3">
                  <input
                    type="text"
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    placeholder="Masukkan Judul Tugas..."
                    className="text-[13px] font-extrabold text-slate-800 bg-transparent border-none outline-none w-full p-0 placeholder-slate-400 focus:ring-0"
                  />
                </div>
                <button
                  onClick={() => { setIsAddingTask(null); setActiveDropdown(null); }}
                  className="text-slate-400 hover:text-slate-600 transition-colors font-bold cursor-pointer text-[11px] mt-1 shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="px-3 pb-3 pt-2 space-y-2">

                <textarea
                  value={addDesc}
                  onChange={(e) => setAddDesc(e.target.value)}
                  placeholder="Tambahkan deskripsi tugas di sini..."
                  className="w-full h-14 border border-slate-100 rounded-xl p-2.5 text-[11px] font-medium text-slate-700 outline-none focus:border-violet-500 resize-none transition-colors shadow-sm bg-slate-50/50"
                />

                <div className="space-y-0.5">
                  {/* Jenis Tugas */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <button
                        ref={addTypeBtnRef}
                        onClick={() => toggleDropdown("add-jenis", addTypeBtnRef)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${getTypeStyle(addType)}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getTypeDotColor(addType)}`} />
                        {addType}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleDropdown("add-jenis", addTypeBtnRef)}
                      className="w-4 h-4 rounded-full border border-dashed border-slate-300 text-slate-300 hover:text-slate-500 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Prioritas */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <button
                        ref={addPriorityBtnRef}
                        onClick={() => toggleDropdown("add-prioritas", addPriorityBtnRef)}
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${getPriorityStyle(addPriority)}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${getPriorityDotColor(addPriority)}`} />
                        {addPriority}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleDropdown("add-prioritas", addPriorityBtnRef)}
                      className="w-4 h-4 rounded-full border border-dashed border-slate-300 text-slate-300 hover:text-slate-500 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Penerima Tugas */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      <div className="flex items-center -space-x-1">
                        {addOrang.map((m, i) => {
                          const memberObj = filteredMembers.find(mem => mem.initial === m);
                          return memberObj ? (
                            <img key={i} src={memberObj.avatar} alt={memberObj.name} className="w-5 h-5 rounded-full object-cover border border-white shadow-sm" />
                          ) : (
                            <div key={i} className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-slate-600 text-[8px] font-bold shadow-sm">
                              {m}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      ref={addAssigneeBtnRef}
                      onClick={() => toggleDropdown("add-penerima", addAssigneeBtnRef)}
                      className="w-4 h-4 rounded-full border border-dashed border-slate-300 text-slate-300 hover:text-slate-500 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Kalender */}
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-50">
                    <div className="flex items-center gap-3">
                      <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <button
                        ref={addDateBtnRef}
                        onClick={() => toggleDropdown("add-kalender", addDateBtnRef)}
                        className="text-[11px] font-semibold text-slate-600"
                      >
                        {addDate === "18 Juli 2026" ? "Pilih Tanggal" : addDate}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleDropdown("add-kalender", addDateBtnRef)}
                      className="w-4 h-4 rounded-full border border-dashed border-slate-300 text-slate-300 hover:text-slate-500 flex items-center justify-center text-[10px] cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* Status Tugas (Hidden visually but kept logically, or just defaulted since isAddingTask provides it) */}
                </div>
              </div>

                {/* Action Button */}

                <button
                  onClick={async () => {

                  if (!addTitle.trim()) {
                    showToast("Warning", "Judul tugas tidak boleh kosong!", "warning");
                    return;
                  }
                  const activeUserName = typeof window !== "undefined" ? (localStorage.getItem("sipantau_name") || "Andi Basudara") : "Andi Basudara";
                  
                  let dbStatus = addStatus;
                  if (dbStatus === "done") dbStatus = "completed";
                  else if (dbStatus === "inprogress") dbStatus = "in_progress";

                  const mappedPriority = addPriority === "Tertinggi" ? "urgent" : addPriority === "Tinggi" ? "high" : addPriority === "Sedang" ? "medium" : "low";

                  // Parse date
                  const parsedDate = parseTaskDate(addDate);
                  let dbDate = null;
                  if (parsedDate) {
                    dbDate = `${parsedDate.year}-${String(parsedDate.month + 1).padStart(2, '0')}-${String(parsedDate.day).padStart(2, '0')}`;
                  }
                  
                  let assignedToId = null;
                  if (addOrang.length > 0) {
                     const member = filteredMembers.find(m => m.initial === addOrang[0]);
                     if (member && member.id) {
                       assignedToId = member.id;
                     }
                  }

                  const newTaskData = {
                    title: addTitle,
                    description: addDesc || "Tidak ada deskripsi",
                    status: dbStatus,
                    type: addType,
                    priority: mappedPriority,
                    due_date: dbDate,
                    group_id: team?.id || "1",
                    assigned_to: assignedToId
                  };

                  try {
                    const createdTask = await createTask(newTaskData);
                    
                    const newTask = {
                      id: createdTask.id,
                      title: addTitle,
                      desc: addDesc || "Tidak ada deskripsi",
                      date: addDate,
                      type: addType,
                      priority: addPriority,
                      status: addStatus,
                      done: addStatus === "done",
                      orang: addOrang.length > 0 ? addOrang : ["A"],
                      riwayat: [{ name: activeUserName, text: "telah menambahkan tugas baru", time: "baru saja" }],
                      komentar: [],
                    };
                    setTasks([...tasks, newTask]);
                    setIsAddingTask(null);
                    setActiveDropdown(null);
                    showToast("Success", "Tugas baru telah berhasil ditambahkan.", "success");
                  } catch (e) {
                    alert("Gagal membuat tugas: " + e.message);
                  }
                }}
                className="w-full mt-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-sm font-bold text-white shadow-md shadow-violet-200 active:scale-95 transition-all cursor-pointer"
              >
                Tambah
              </button>
            </div>
          </div>
        </>
      )}
      {renderFloatingDropdown()}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
}

