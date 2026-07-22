"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Sub-components for tabs (to be implemented)
import TabDashboard from "./TabDashboard";
import TabList from "./TabList";
import TabPapan from "./TabPapan";
import TabKalender from "./TabKalender";
import GlobalTaskModals from "./GlobalTaskModals";
import { getActiveUser, getProfile } from "../../../../backend/auth";
import { getGroupDetails, deleteGroup, addGroupMember, removeGroupMember } from "../../../../backend/groups";
import { deleteTask } from "../../../../backend/tasks";
import { getTeamActivityLogs } from "../../../../backend/activity"; // New import



const memberColors = ["bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-sky-400", "bg-indigo-400"];



// Avatar URLs are now derived from each member's profile. The static map is no longer needed.

export default function TeamDetailPage({ params }) {
  const unwrappedParams = React.use ? React.use(params) : params;
  const teamId = unwrappedParams?.id;
  
  const [team, setTeam] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTeamMembersDrop, setShowTeamMembersDrop] = useState(false);
  const teamMembersRef = React.useRef(null);
  
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("list");
  const [isMentor, setIsMentor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [showAddMemberDrop, setShowAddMemberDrop] = useState(false);
  const [showTeamActionsDrop, setShowTeamActionsDrop] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const addMemberRef = React.useRef(null);
  const teamActionsRef = React.useRef(null);

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [teamActivityLogs, setTeamActivityLogs] = useState([]); // New state

  // Load backend data
  const loadData = async () => {
    try {
      if (!teamId) return;

      const authUser = await getActiveUser();
      if (authUser) {
        const profile = await getProfile(authUser.id);
        setCurrentUser(profile);
        setIsMentor(profile.role === "mentor");
        setIsAdmin(profile.role === "admin");
      }

      const teamDetails = await getGroupDetails(teamId);
      
      const mappedTeam = {
        ...teamDetails,
        membersList: (teamDetails.group_members || []).map(gm => gm.profiles)
      };
      setTeam(mappedTeam);
      
      // Dump the first task to investigate the schema
      if (teamDetails.tasks && teamDetails.tasks.length > 0) {
        fetch('/api/dump-schema', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teamDetails.tasks)
        }).catch(e => console.error(e));
      }
      
      const mappedTasks = (teamDetails.tasks || []).map(t => ({
        id: t.id,
        title: t.title,
        desc: t.description || "",
        date: t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "",
        type: t.type || "Tugas",
        priority: t.priority === "high" ? "Tinggi" : t.priority === "medium" ? "Sedang" : t.priority === "urgent" ? "Tertinggi" : "Rendah",
        status: (t.status === "completed" || t.status === "done") ? "done" 
              : (t.status === "in_progress" || t.status === "inprogress") ? "inprogress" 
              : t.status === "review" ? "review" 
              : "todo",
        done: t.status === "completed" || t.status === "done",
        orang: t.assignees && t.assignees.length > 0 
               ? t.assignees.map(id => mappedTeam.membersList.find(m => m.id === id)?.full_name?.charAt(0).toUpperCase() || "A")
               : t.assigned_to 
                 ? [mappedTeam.membersList.find(m => m.id === t.assigned_to)?.full_name?.charAt(0).toUpperCase() || "A"] 
                 : [],
        assigned_to: t.assigned_to,
        riwayat: [],
        komentar: [],
        subtugas: []
      }));
      setTasks(mappedTasks);

      const logs = await getTeamActivityLogs(teamId);
      setTeamActivityLogs(logs);
    } catch (e) {
      console.error("Gagal memuat detail kelompok:", e);
    }
  };

  useEffect(() => {
    loadData();
    
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
  }, [teamId]);

  const isMentorOrAdmin = isMentor || isAdmin;

  const availableMembers = team?.membersList?.map(m => ({
    id: m.id,
    name: m.full_name,
    avatar_url: m.avatar_url,
    initial: m.full_name?.charAt(0).toUpperCase()
  })) || [];

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "list", label: "List", icon: "📋" },
    { id: "papan", label: "Papan", icon: "📌" },
    { id: "kalender", label: "Kalender", icon: "📅" },
  ];

  if (!team) return <div className="p-4 text-center">Loading...</div>;

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
            {team.membersList.map((m, i) => {
              let avatar = m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=f1f5f9&color=64748b&bold=true`;
              return avatar ? (
                <img key={i} src={avatar} alt={m.full_name} className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm" title={m.full_name} />
              ) : (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-white ${memberColors[i % memberColors.length]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                  {m.full_name.charAt(0).toUpperCase()}
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
                      const isMember = team.membersList.some(mem => mem.id === m.id);
                      const avatar = m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=f1f5f9&color=64748b&bold=true`;

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
                              onClick={async () => {
                                if (window.confirm("Hapus anggota ini?")) {
                                  try {
                                    await removeGroupMember(team.id, m.id);
                                    await loadData();
                                  } catch (e) {
                                    alert("Gagal menghapus member: " + e.message);
                                  }
                                }
                              }}
                              className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                              title="Hapus Anggota"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          ) : (
                            <button 
                              onClick={async () => {
                                try {
                                  await addGroupMember(team.id, m.id);
                                  await loadData();
                                } catch (e) {
                                  alert("Gagal menambah member: " + e.message);
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
                    onClick={async () => {
                      if (window.confirm("Hapus kelompok ini?")) {
                        try {
                          await deleteGroup(team.id, false);
                          router.push("/dashboard/team");
                        } catch (e) {
                          alert("Gagal menghapus kelompok: " + e.message);
                        }
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
                {team.membersList.map((m, idx) => {
                  let fullName = m.full_name;
                  let avatar = m.avatar_url;
                  
                  if (currentUser && m.id === currentUser.id) {
                    fullName += " (Anda)";
                  }

                  return (
                    <div key={idx} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                      {avatar ? (
                        <img src={avatar} alt={m.full_name} className="w-8 h-8 rounded-full object-cover shadow-sm shrink-0" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full ${memberColors[idx % memberColors.length]} flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0`}>
                          {m.full_name.charAt(0).toUpperCase()}
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
        {activeTab === "dashboard" && <TabDashboard tasks={tasks} activityLogs={teamActivityLogs} />}
        {activeTab === "list" && (
        <TabList
          tasks={tasks}
          setTasks={setTasks}
          setSelectedTask={setSelectedTask}
          setIsAddingTask={setIsAddingTask}
          members={team.membersList || []}
        />
      )}
        {activeTab === "papan" && (
          <TabPapan
            tasks={tasks}
            setTasks={setTasks}
            setSelectedTask={setSelectedTask}
            setTaskToDelete={setTaskToDelete}
            team={team}
            members={team.membersList || []}
          />
        )}
        {activeTab === "kalender" && (
          <TabKalender
            tasks={tasks}
            setTasks={setTasks}
            setSelectedTask={setSelectedTask}
            team={team}
            members={team.membersList || []}
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
        team={team}
        members={team?.membersList || []}
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
                onClick={async () => {
                  try {
                    await deleteTask(taskToDelete.id);
                    setTasks(tasks.filter(t => t.id !== taskToDelete.id));
                    setTaskToDelete(null);
                    setSelectedTask(null);
                  } catch (e) {
                    alert("Gagal menghapus tugas: " + e.message);
                  }
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
