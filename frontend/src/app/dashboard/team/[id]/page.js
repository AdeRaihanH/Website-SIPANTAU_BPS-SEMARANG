"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Sub-components for tabs (to be implemented)
import TabDashboard from "./TabDashboard";
import TabList from "./TabList";
import TabPapan from "./TabPapan";
import TabKalender from "./TabKalender";
import GlobalTaskModals from "./GlobalTaskModals";

const initialTasks = [
  { id: 1, title: "Pembuatan UI/UX Website", desc: "Membuat tampilan antarmuka website Kanban", date: "1 Juli 2026", type: "Design", priority: "Tertinggi", status: "todo", done: false, orang: ["A", "M", "N"], riwayat: [{ name: "Andi Basudara", text: "telah membuat penugasan ini", time: "2 hari lalu" }, { name: "Myesha Azka", text: "telah mengubah penerima tugas.", time: "kemarin" }], komentar: [{ name: "Nurul Kumala", text: "Semangattt!" }], subtugas: [{title: "Pembuatan Landing Page", done: false}] },
  { id: 2, title: "Pembuatan Repository GitHub", desc: "Membuat repository dan konfigurasi branch utama", date: "5 Juli 2026", type: "Tugas", priority: "Sedang", status: "inprogress", done: false, orang: ["A", "M"], riwayat: [{ name: "Andi Basudara", text: "telah membuat tugas ini", time: "3 hari lalu" }], komentar: [] },
  { id: 3, title: "Pembuatan Database ERD", desc: "Merancang skema database dan relasi antar tabel", date: "18 Juli 2026", type: "Tugas", priority: "Rendah", status: "review", done: false, orang: ["N"], riwayat: [{ name: "Nurul Kumala", text: "telah merancang ERD awal", time: "4 hari lalu" }], komentar: [] },
  { id: 4, title: "Pembuatan Pitch Deck", desc: "Slide deck presentasi produk untuk demo akhir", date: "30 Juni 2026", type: "Tugas", priority: "Tinggi", status: "done", done: true, orang: ["A", "N"], riwayat: [{ name: "Andi Basudara", text: "telah menyelesaikan tugas ini", time: "5 hari lalu" }], komentar: [] },
  { id: 5, title: "Testing & QA Aplikasi", desc: "Melakukan pengujian fitur dan dokumentasi bug", date: "11 Juli 2026", type: "Bug", priority: "Tinggi", status: "todo", done: false, orang: ["M"], riwayat: [], komentar: [] },
  { id: 6, title: "Deploy ke Staging Server", desc: "Deploy aplikasi ke environment staging untuk review", date: "25 Juli 2026", type: "Fitur", priority: "Sedang", status: "todo", done: false, orang: ["A", "M", "N"], riwayat: [], komentar: [] },
];

const memberColors = ["bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-sky-400", "bg-indigo-400"];

const teamsData = {
  "1": { name: "Tim Teknologi Informasi UNDIP", members: ["A", "R", "H"] },
  "2": { name: "Tim Desain Kreatif BPS", members: ["D", "E"] },
  "3": { name: "Tim Analisis Data", members: ["F", "G", "H", "I"] },
  "4": { name: "Tim Backend Development", members: ["A", "B"] },
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

export default function TeamDetailPage({ params }) {
  const unwrappedParams = React.use ? React.use(params) : params;
  const teamId = unwrappedParams?.id || "1";
  
  const [team, setTeam] = useState(teamsData[teamId] || teamsData["1"]);
  const [showTeamMembersDrop, setShowTeamMembersDrop] = useState(false);
  const teamMembersRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (teamMembersRef.current && !teamMembersRef.current.contains(event.target)) {
        setShowTeamMembersDrop(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState("list");
  const [isMentor, setIsMentor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddMemberDrop, setShowAddMemberDrop] = useState(false);
  const [showTeamActionsDrop, setShowTeamActionsDrop] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  
  const addMemberRef = React.useRef(null);
  const teamActionsRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (teamMembersRef.current && !teamMembersRef.current.contains(event.target) && 
          addMemberRef.current && !addMemberRef.current.contains(event.target) &&
          teamActionsRef.current && !teamActionsRef.current.contains(event.target)) {
        setShowTeamMembersDrop(false);
        setShowAddMemberDrop(false);
        setShowTeamActionsDrop(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Read role and name from login
    const role = typeof window !== "undefined" ? localStorage.getItem("sipantau_role") : null;
    const nameVal = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
    setIsMentor(role === "mentor");
    setIsAdmin(role === "admin");

    let loadedTeam = teamsData[teamId] || teamsData["1"];
    loadedTeam = { ...loadedTeam, id: loadedTeam.id || teamId, members: [...(loadedTeam.members || [])] };

    if (typeof window !== "undefined") {
      const savedTeams = localStorage.getItem("sipantau_teams");
      if (savedTeams) {
        try {
          const parsedTeams = JSON.parse(savedTeams);
          const found = parsedTeams.find(t => t.id === teamId);
          if (found) {
            loadedTeam = { ...found, members: [...found.members] };
          }
        } catch (e) {
          console.error("Failed to parse saved teams");
        }
      }
    }

    // Dynamic Injection for dummy data consistency
    if (role === "mentor" && (loadedTeam.id === "5" || loadedTeam.id === "6")) {
      loadedTeam.mentor = nameVal || "Mentor";
    }
    
    if ((role === "pemagang" || role === "intern") && (loadedTeam.id === "1" || loadedTeam.id === "4")) {
      const initial = nameVal ? nameVal.charAt(0).toUpperCase() : "";
      if (initial && !loadedTeam.members.includes(initial)) {
        loadedTeam.members = [initial, ...loadedTeam.members.slice(0, 3)];
      }
    }

    setTeam(loadedTeam);
  }, [teamId]);

  // --- GLOBAL STATE ---
  const isDefaultTeam = ["1", "2", "3", "4"].includes(teamId);
  const [tasks, setTasks] = useState(isDefaultTeam ? initialTasks : []);
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedTeamIdRef = React.useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`sipantau_tasks_${teamId}`);
      let nextTasks = isDefaultTeam ? initialTasks : [];
      if (stored) {
        try {
          nextTasks = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse tasks:", e);
        }
      }
      
      // If a newly created team accidentally got populated with initialTasks due to the previous bug, clear it:
      if (!isDefaultTeam && nextTasks.length === initialTasks.length && JSON.stringify(nextTasks) === JSON.stringify(initialTasks)) {
        nextTasks = [];
      }

      setTasks(nextTasks);
      loadedTeamIdRef.current = teamId;
      setIsLoaded(true);
    }
  }, [teamId, isDefaultTeam]);

  useEffect(() => {
    if (isLoaded && loadedTeamIdRef.current === teamId && typeof window !== "undefined") {
      localStorage.setItem(`sipantau_tasks_${teamId}`, JSON.stringify(tasks));
    }
  }, [tasks, teamId, isLoaded]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "🌐" },
    { id: "list", label: "List", icon: "≡" },
    { id: "papan", label: "Papan", icon: "📋" },
    { id: "kalender", label: "Kalender", icon: "📅" },
  ];

  const isMentorOrAdmin = isMentor || isAdmin;

  const availableMembers = [
    { id: "A", name: "Aisha Alida Putri", initial: "A" },
    { id: "M", name: "Myesha Azka Hafizha", initial: "M" },
    { id: "N", name: "Nurul Kumala", initial: "N" },
    { id: "B", name: "Budi Santoso", initial: "B" },
    { id: "R", name: "Rizky Firmansyah", initial: "R" },
    { id: "H", name: "Hendra Setiawan", initial: "H" },
    { id: "C", name: "Citra Kirana", initial: "C" },
    { id: "D", name: "Dewi Lestari", initial: "D" },
    { id: "E", name: "Eko Prasetyo", initial: "E" },
    { id: "F", name: "Fajar Nugraha", initial: "F" },
    { id: "G", name: "Gita Savitri", initial: "G" },
    { id: "I", name: "Indra Maulana", initial: "I" },
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/team")}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-indigo-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {team.name}
          </h1>
        </div>

        <div className="relative flex items-center gap-1" ref={teamMembersRef}>
          <div 
            className="flex -space-x-2 cursor-pointer hover:opacity-90 transition-opacity mr-2"
            onClick={() => {
              if (isMentorOrAdmin) {
                setShowAddMemberDrop(!showAddMemberDrop);
                setShowTeamMembersDrop(false);
              } else {
                setShowTeamMembersDrop(!showTeamMembersDrop);
                setShowAddMemberDrop(false);
              }
              setShowTeamActionsDrop(false);
            }}
          >
            {team.members.map((m, i) => {
              const currentName = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
              const currentEmail = typeof window !== "undefined" ? localStorage.getItem("sipantau_email") : null;
              let avatar = userAvatars[m];
              
              if (currentName && m === currentName.charAt(0).toUpperCase()) {
                const stored = typeof window !== "undefined" && currentEmail ? localStorage.getItem(`sipantau_avatar_${currentEmail.toLowerCase()}`) : null;
                if (stored) avatar = stored;
                else avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentName)}&background=f1f5f9&color=64748b&bold=true`;
              }
              
              return avatar ? (
                <img key={i} src={avatar} alt={m} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" />
              ) : (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${memberColors[i % memberColors.length]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                  {m}
                </div>
              );
            })}
          </div>
          
          {isMentorOrAdmin && (
            <div className="relative" ref={addMemberRef}>
              <div 
                onClick={() => {
                  setShowAddMemberDrop(!showAddMemberDrop);
                  setShowTeamMembersDrop(false);
                  setShowTeamActionsDrop(false);
                }}
                className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold shadow-sm cursor-pointer hover:bg-slate-200 z-10 transition-colors"
              >
                +
              </div>
              
              {/* Manage Members Dropdown */}
              {showAddMemberDrop && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-[100] w-64 text-left">
                  <div className="text-center text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">Anggota</div>
                  <input
                    type="text"
                    placeholder="Cari anggota..."
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-violet-500 mb-2 transition-colors"
                  />
                  <div className="space-y-1 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                    {availableMembers
                      .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
                      .map((m, idx) => {
                      const isMember = team.members.includes(m.id);
                      let avatar = userAvatars[m.id];
                      
                      const currentName = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
                      const currentEmail = typeof window !== "undefined" ? localStorage.getItem("sipantau_email") : null;
                      if (currentName && m.id === currentName.charAt(0).toUpperCase()) {
                        const stored = typeof window !== "undefined" && currentEmail ? localStorage.getItem(`sipantau_avatar_${currentEmail.toLowerCase()}`) : null;
                        if (stored) avatar = stored;
                        else avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentName)}&background=f1f5f9&color=64748b&bold=true`;
                      }

                      return (
                        <div key={idx} className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            {avatar ? (
                              <img src={avatar} alt={m.id} className="w-6 h-6 rounded-full object-cover shadow-sm shrink-0" />
                            ) : (
                              <div className={`w-6 h-6 rounded-full ${memberColors[idx % memberColors.length]} flex items-center justify-center text-white text-[9px] font-bold shadow-sm shrink-0`}>
                                {m.id}
                              </div>
                            )}
                            <span className="text-[11px] font-bold text-slate-700">{m.name}</span>
                          </div>
                          {isMember ? (
                            <button 
                              onClick={() => {
                                const newMembers = team.members.filter(memId => memId !== m.id);
                                const newTeam = { ...team, members: newMembers };
                                setTeam(newTeam);
                                
                                // Save to localStorage if not default team (or even if default)
                                const saved = localStorage.getItem("sipantau_teams");
                                if (saved) {
                                  try {
                                    const parsed = JSON.parse(saved);
                                    const idx = parsed.findIndex(t => t.id === team.id);
                                    if (idx !== -1) {
                                      parsed[idx] = newTeam;
                                      localStorage.setItem("sipantau_teams", JSON.stringify(parsed));
                                    }
                                  } catch (e) {}
                                }
                              }}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Hapus Anggota"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                const newMembers = [...team.members, m.id];
                                const newTeam = { ...team, members: newMembers };
                                setTeam(newTeam);
                                
                                const saved = localStorage.getItem("sipantau_teams");
                                if (saved) {
                                  try {
                                    const parsed = JSON.parse(saved);
                                    const idx = parsed.findIndex(t => t.id === team.id);
                                    if (idx !== -1) {
                                      parsed[idx] = newTeam;
                                      localStorage.setItem("sipantau_teams", JSON.stringify(parsed));
                                    }
                                  } catch (e) {}
                                }
                              }}
                              className="text-slate-300 hover:text-emerald-500 transition-colors p-1" title="Tambah Anggota"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {isMentorOrAdmin && (
            <div className="relative ml-1" ref={teamActionsRef}>
              <button
                onClick={() => {
                  setShowTeamActionsDrop(!showTeamActionsDrop);
                  setShowTeamMembersDrop(false);
                  setShowAddMemberDrop(false);
                }}
                className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
              </button>
              
              {/* Team Actions Dropdown */}
              {showTeamActionsDrop && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white border border-slate-100 shadow-xl rounded-xl p-1.5 z-[60]">
                  <button 
                    onClick={() => setShowTeamActionsDrop(false)}
                    className="flex items-center justify-between px-3 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors text-left w-full rounded-lg cursor-pointer"
                  >
                    Edit Kelompok
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm("Hapus kelompok ini?")) {
                        const saved = localStorage.getItem("sipantau_teams");
                        if (saved) {
                          try {
                            const parsed = JSON.parse(saved);
                            const updated = parsed.filter(t => t.id !== team.id);
                            localStorage.setItem("sipantau_teams", JSON.stringify(updated));
                            // Also update deleted teams if needed, but for now just redirect
                          } catch (e) {}
                        }
                        router.push("/dashboard/team");
                      }
                    }}
                    className="flex items-center justify-between px-3 py-2.5 text-[11px] font-bold text-rose-500 hover:bg-rose-50 transition-colors text-left w-full rounded-lg cursor-pointer mt-0.5"
                  >
                    Hapus Kelompok
                    <svg className="w-3.5 h-3.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              )}
            </div>
          )}
          
          {(!isMentorOrAdmin && showTeamMembersDrop) && (
            <div className="absolute top-full right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-[100] w-64 text-left">
              <div className="text-center text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">Anggota Kelompok</div>
              <div className="space-y-1 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {team.members.map((m, idx) => {
                  let fullName = "Anggota " + m;
                  let avatar = userAvatars[m];
                  
                  if (m === "A") fullName = "Aisha Alida Putri";
                  else if (m === "M") fullName = "Myesha Azka Hafizha";
                  else if (m === "N") fullName = "Nurul Kumala";
                  else if (m === "B") fullName = "Budi Santoso";
                  else if (m === "R") fullName = "Rizky Firmansyah";
                  else if (m === "H") fullName = "Hendra Setiawan";
                  else if (m === "C") fullName = "Citra Kirana";
                  else if (m === "D") fullName = "Dewi Lestari";
                  else if (m === "E") fullName = "Eko Prasetyo";
                  else if (m === "F") fullName = "Fajar Nugraha";
                  else if (m === "G") fullName = "Gita Savitri";
                  else if (m === "I") fullName = "Indra Maulana";
                  
                  const currentUserFullName = typeof window !== "undefined" ? localStorage.getItem("sipantau_name") : null;
                  const currentEmail = typeof window !== "undefined" ? localStorage.getItem("sipantau_email") : null;
                  const currentInitial = currentUserFullName ? currentUserFullName.charAt(0).toUpperCase() : "";
                  
                  if (currentUserFullName && m === currentInitial) {
                    fullName = currentUserFullName + " (Anda)";
                    const stored = typeof window !== "undefined" && currentEmail ? localStorage.getItem(`sipantau_avatar_${currentEmail.toLowerCase()}`) : null;
                    if (stored) avatar = stored;
                    else avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUserFullName)}&background=f1f5f9&color=64748b&bold=true`;
                  }

                  return (
                    <div key={idx} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      {avatar ? (
                        <img src={avatar} alt={m} className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full ${memberColors[idx % memberColors.length]} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}>
                          {m}
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-slate-700">{fullName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${activeTab === tab.id
                ? "border-violet-600 text-violet-700"
                : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            <span className="text-base">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 bg-slate-50/50 rounded-xl p-4 overflow-auto">
        {activeTab === "dashboard" && <TabDashboard tasks={tasks} />}
        {activeTab === "list" && (
          <TabList
            tasks={tasks}
            setTasks={setTasks}
            setSelectedTask={setSelectedTask}
            setIsAddingTask={setIsAddingTask}
          />
        )}
        {activeTab === "papan" && (
          <TabPapan
            tasks={tasks}
            setTasks={setTasks}
            setSelectedTask={setSelectedTask}
            setTaskToDelete={setTaskToDelete}
          />
        )}
        {activeTab === "kalender" && (
          <TabKalender
            tasks={tasks}
            setTasks={setTasks}
            setSelectedTask={setSelectedTask}
          />
        )}
      </div>

      <GlobalTaskModals
        tasks={tasks}
        setTasks={setTasks}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        isAddingTask={isAddingTask}
        setIsAddingTask={setIsAddingTask}
        setTaskToDelete={setTaskToDelete}
      />

      {/* Custom Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-extrabold text-slate-800">Hapus Tugas</h3>
              <p className="text-xs text-slate-500 font-medium">Anda akan menghapus &quot;{taskToDelete.title}&quot;</p>
            </div>
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={() => setTaskToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-600 transition-colors"
              >
                Tidak, simpan.
              </button>
              <button
                onClick={() => {
                  setTasks(tasks.filter(t => t.id !== taskToDelete.id));
                  setTaskToDelete(null);
                  setSelectedTask(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-md shadow-rose-100 active:scale-95 transition-all"
              >
                Ya, hapus.
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
