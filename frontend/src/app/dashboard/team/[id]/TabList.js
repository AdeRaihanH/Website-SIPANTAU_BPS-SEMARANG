"use client";

import React, { useState, useRef, useEffect } from "react";
import { updateTask } from "../../../../backend/tasks";

export default function TabList({ tasks, setTasks, setSelectedTask, setIsAddingTask, team }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

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
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTaskCheckbox = async (id, e) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newDone = !task.done;
    const newStatus = newDone ? "done" : "todo";
    const dbStatus = newDone ? "done" : "todo";
    
    const updatedTasksList = tasks.map((t) => t.id === id ? { ...t, done: newDone, status: newStatus } : t);
    setTasks(updatedTasksList);

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sipantau-toast", {
        detail: { message: newDone ? "Tugas ditandai selesai." : "Tugas dikembalikan ke Belum Selesai.", type: "info" }
      }));
    }

    updateTask(id, { status: dbStatus }).catch(err => {
      console.warn("Supabase updateTask checkbox error:", err);
    });
  };

  const getTypeBadge = (type) => {
    const t = (type || "").toLowerCase();
    switch (t) {
      case "design": return { bg: "bg-violet-100/80 text-violet-600 border border-violet-200/50", dot: "bg-violet-500" };
      case "bug": return { bg: "bg-cyan-100/80 text-cyan-600 border border-cyan-200/50", dot: "bg-cyan-500" };
      case "aset": return { bg: "bg-amber-100/80 text-amber-600 border border-amber-200/50", dot: "bg-amber-500" };
      case "fitur": return { bg: "bg-rose-100/80 text-rose-600 border border-rose-200/50", dot: "bg-rose-500" };
      default: return { bg: "bg-indigo-100/80 text-indigo-600 border border-indigo-200/50", dot: "bg-indigo-500" };
    }
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || "").toLowerCase();
    switch (p) {
      case "tertinggi": case "urgent": case "critical": return { bg: "bg-rose-100/80 text-rose-600 border border-rose-200/50", dot: "bg-rose-500" };
      case "tinggi": case "high": return { bg: "bg-emerald-100/80 text-emerald-600 border border-emerald-200/50", dot: "bg-emerald-500" };
      case "sedang": case "medium": return { bg: "bg-amber-100/80 text-amber-600 border border-amber-200/50", dot: "bg-amber-500" };
      case "rendah": case "low": return { bg: "bg-cyan-100/80 text-cyan-600 border border-cyan-200/50", dot: "bg-cyan-500" };
      case "terendah": return { bg: "bg-violet-100/80 text-violet-600 border border-violet-200/50", dot: "bg-violet-500" };
      default: return { bg: "bg-amber-100/80 text-amber-600 border border-amber-200/50", dot: "bg-amber-500" };
    }
  };

  const renderSection = (title, statusKey) => {
    const sectionTasks = tasks.filter((t) => t.status === statusKey);
    return (
      <div key={statusKey} className="space-y-3 bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-50 pb-2">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
              {sectionTasks.length}
            </span>
          </h3>
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setIsAddingTask({
                status: statusKey,
                rect: {
                  top: rect.top,
                  bottom: rect.bottom,
                  left: rect.left,
                  right: rect.right,
                  width: rect.width,
                  height: rect.height,
                }
              });
            }}
            className="text-xs font-bold text-violet-600 hover:text-violet-700 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
          >
            <span>+</span> Tambah
          </button>
        </div>

        {sectionTasks.length === 0 ? (
          <div className="text-center py-6 text-[10px] font-semibold text-slate-400">Tidak ada tugas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[750px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5" style={{ width: "36px" }}></th>
                  <th className="py-2.5" style={{ width: "22%" }}>Nama Tugas</th>
                  <th className="py-2.5" style={{ width: "24%" }}>Deskripsi</th>
                  <th className="py-2.5" style={{ width: "16%" }}>Tenggat</th>
                  <th className="py-2.5" style={{ width: "14%" }}>Jenis</th>
                  <th className="py-2.5" style={{ width: "11%" }}>Orang</th>
                  <th className="py-2.5" style={{ width: "13%" }}>Prioritas</th>
                  <th className="py-2.5 text-center" style={{ width: "36px" }}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sectionTasks.map((task) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="text-xs text-slate-600 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={(e) => toggleTaskCheckbox(task.id, e)}
                        className="w-4 h-4 rounded border-slate-200 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                    </td>
                    <td className={`py-3 font-extrabold text-slate-800 truncate pr-3 ${task.done ? "line-through text-slate-400" : ""}`} title={task.title}>
                      {task.title}
                    </td>
                    <td className="py-3 text-slate-400 font-medium truncate pr-3" title={task.desc}>
                      {task.desc || "-"}
                    </td>
                    <td className="py-3 font-semibold text-slate-700 truncate pr-2" title={task.date}>
                      {task.date || "-"}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${getTypeBadge(task.type).bg}`}>
                        <span className={`w-2 h-2 rounded-xs ${getTypeBadge(task.type).dot}`}></span>
                        {task.type || "Tugas"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex -space-x-1.5 items-center">
                        {task.orang && task.orang.slice(0, 2).map((m, i) => {
                          const mem = teamMembers.find(d => d.initial === m);
                          return mem && mem.avatar ? (
                            <img key={i} src={mem.avatar} alt={mem.name} className="w-6 h-6 rounded-full border-2 border-white object-cover shadow-sm shrink-0" title={mem.name} />
                          ) : (
                            <div key={i} className={`w-6 h-6 rounded-full border-2 border-white ${["bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-sky-400"][i % 4]} flex items-center justify-center text-white text-[9px] font-bold shadow-sm shrink-0`} title={m}>{m}</div>
                          );
                        })}
                        {task.orang && task.orang.length > 2 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 text-slate-600 flex items-center justify-center text-[9px] font-extrabold shadow-sm shrink-0 z-10" title={task.orang.slice(2).join(", ")}>
                            +{task.orang.length - 2}
                          </div>
                        )}
                        {(!task.orang || task.orang.length === 0) && (
                          <span className="text-[10px] text-slate-300 font-semibold">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${getPriorityBadge(task.priority).bg}`}>
                        <span className={`w-2 h-2 rounded-full ${getPriorityBadge(task.priority).dot}`}></span>
                        {task.priority || "Sedang"}
                      </span>
                    </td>
                    <td className="py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setSelectedTask(task)} className="text-slate-400 hover:text-slate-700 p-1 text-sm font-bold cursor-pointer">···</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderSection("To do", "todo")}
      {renderSection("In Progress", "inprogress")}
      {renderSection("In Review", "review")}
      {renderSection("Done", "done")}
    </div>
  );
}
