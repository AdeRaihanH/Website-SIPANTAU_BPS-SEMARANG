"use client";

import React, { useState, useRef, useEffect } from "react";
import { updateTask } from "../../../../backend/tasks";

export default function TabList({
  tasks,
  setTasks,
  setSelectedTask,
  setIsAddingTask,
  members = [],
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableMembers = (members || []).map((p) => ({
  initial: p.full_name?.charAt(0).toUpperCase() || "?",
  name: p.full_name || "Tanpa Nama",
  avatar:
    p.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      p.full_name || "?"
    )}&background=random`,
}));

  const toggleTaskCheckbox = async (id, e) => {
    e.stopPropagation();
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newDone = !task.done;
    const newStatus = newDone ? "done" : "todo";
    
    // Optimistic Update
    setTasks(tasks.map((t) => t.id === id ? { ...t, done: newDone, status: newStatus } : t));
    
    try {
      await updateTask(id, { status: newStatus });
    } catch (err) {
      // Revert if error
      setTasks(tasks);
      alert("Gagal memperbarui status: " + err.message);
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Tertinggi": return "bg-rose-50 text-rose-600 border border-rose-100";
      case "Tinggi": return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      case "Sedang": return "bg-amber-50 text-amber-600 border border-amber-100";
      case "Rendah": return "bg-cyan-50 text-cyan-600 border border-cyan-100";
      case "Terendah": return "bg-violet-50 text-violet-600 border border-violet-100";
      default: return "bg-slate-50 text-slate-600 border border-slate-100";
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
              const spaceBelow = window.innerHeight - rect.bottom;
              if (spaceBelow < 400) {
                setIsAddingTask({
                  status: statusKey,
                  bottom: window.innerHeight - rect.top + 8,
                  right: window.innerWidth - rect.right
                });
              } else {
                setIsAddingTask({
                  status: statusKey,
                  top: rect.bottom + 8,
                  right: window.innerWidth - rect.right
                });
              }
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
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 w-8"></th>
                  <th className="py-2.5 w-1/4">Nama Tugas</th>
                  <th className="py-2.5 w-1/3">Deskripsi</th>
                  <th className="py-2.5">Tenggat</th>
                  <th className="py-2.5">Jenis</th>
                  <th className="py-2.5">Orang</th>
                  <th className="py-2.5">Prioritas</th>
                  <th className="py-2.5 w-8 text-center"></th>
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
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-200 text-violet-600 focus:ring-violet-500 cursor-pointer"
                      />
                    </td>
                    <td className={`py-3 font-extrabold text-slate-800 ${task.done ? "line-through text-slate-400" : ""}`}>
                      {task.title}
                    </td>
                    <td className="py-3 text-slate-400 font-medium max-w-xs truncate">{task.desc}</td>
                    <td className="py-3 font-semibold text-slate-700">{task.date}</td>
                    <td className="py-3">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold">{task.type}</span>
                    </td>
                    <td className="py-3.5">
                  <div className="flex -space-x-1.5 overflow-visible">
                    {task.orang && task.orang.length > 0 ? (
                      task.orang.map((initial, idx) => {
                        const memberObj = availableMembers.find(
                          (mem) => mem.initial === initial
                        );

                        return memberObj ? (
                          <div
                            key={idx}
                            className="w-5.5 h-5.5 rounded-full ring-2 ring-white overflow-hidden bg-gradient-to-br from-violet-400 to-indigo-500 shadow-sm flex items-center justify-center text-white shrink-0"
                            title={memberObj.name}
                          >
                            <img
                              className="h-full w-full object-cover"
                              src={memberObj.avatar}
                              alt={memberObj.name}
                            />
                          </div>
                        ) : (
                          <div
                            key={idx}
                            className="w-5.5 h-5.5 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0"
                            title={initial}
                          >
                            {initial}
                          </div>
                        );
                      })
                    ) : (
                      <div className="w-5.5 h-5.5 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-400 shrink-0">
                        ?
                      </div>
                    )}
                  </div>
                </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
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
