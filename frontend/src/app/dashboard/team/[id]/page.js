"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Sub-components for tabs (to be implemented)
import TabDashboard from "./TabDashboard";
import TabList from "./TabList";
import TabPapan from "./TabPapan";
import TabKalender from "./TabKalender";
import GlobalTaskModals from "./GlobalTaskModals";
import { supabase } from "../../../../backend/client";
import { getActiveUser, getProfile } from "../../../../backend/auth";
import { getGroupDetails, deleteGroup, addGroupMember, removeGroupMember } from "../../../../backend/groups";
import { getAllUsers } from "../../../../backend/admin";
import { deleteTask } from "../../../../backend/tasks";



// Module-level in-memory cache (0ms latency, zero quota limits, 100% safe)
const memoryCache = new Map();

const memberColors = ["bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-sky-400", "bg-indigo-400"];

export default function TeamDetailPage({ params }) {
  const unwrappedParams = React.use ? React.use(params) : params;
  const teamId = unwrappedParams?.id;
  const router = useRouter();

  const [team, setTeam] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentUser, setCurrentUser] = useState(null);
  const [isMentor, setIsMentor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showTeamMembersDrop, setShowTeamMembersDrop] = useState(false);
  const [showAddMemberDrop, setShowAddMemberDrop] = useState(false);
  const [showTeamActionsDrop, setShowTeamActionsDrop] = useState(false);

  const teamMembersRef = React.useRef(null);
  const addMemberRef = React.useRef(null);
  const teamActionsRef = React.useRef(null);

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddingTask, setIsAddingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [teamActivityLogs, setTeamActivityLogs] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const reloadTimerRef = React.useRef(null);
  const [memberSearch, setMemberSearch] = useState("");

  // Instant cache restore on mount (0ms delay)
  useEffect(() => {
    if (teamId) {
      const cachedTeam = memoryCache.get(`team_${teamId}`);
      if (cachedTeam) setTeam(cachedTeam);
      const cachedTasks = memoryCache.get(`tasks_${teamId}`);
      if (cachedTasks && Array.isArray(cachedTasks)) setTasks(cachedTasks);
    }
  }, [teamId]);

  // Load backend data
  const loadData = async () => {
    try {
      if (!teamId) return;

      const authUser = await getActiveUser();
      
      const [teamDetails, users, profile] = await Promise.all([
        getGroupDetails(teamId).catch(() => null),
        getAllUsers().catch(() => []),
        authUser ? getProfile(authUser.id).catch(() => null) : Promise.resolve(null)
      ]);

      if (profile) {
        setCurrentUser(profile);
        setIsMentor(profile.role === "mentor");
        setIsAdmin(profile.role === "admin");
      }

      if (!teamDetails) return;

      if (users) {
        setAllUsers(users);
      }

      const mappedTeam = {
        id: teamDetails.id,
        name: teamDetails.name,
        description: teamDetails.description,
        mentor_id: teamDetails.mentor_id,
        created_by: teamDetails.created_by,
        is_deleted: teamDetails.is_deleted,
        membersList: (teamDetails.group_members || []).map(gm => gm?.profiles).filter(Boolean)
      };
      setTeam(mappedTeam);
      memoryCache.set(`team_${teamId}`, mappedTeam);

      // The backend returns tasks inside teamDetails. Let's map them to the frontend format.
      const mappedTasks = (teamDetails.tasks || []).map(t => {
        // Map komentar from task_comments
        const komentar = (t.task_comments || [])
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
          .map(c => ({
            id: c.id,
            name: c.user?.full_name || "User",
            text: c.content,
            created_at: c.created_at,
            avatar_url: c.user?.avatar_url || null
          }));

        // Map subtugas from subtasks
        const subtugas = (t.subtasks || []).map(s => ({
          id: s.id,
          title: s.title,
          done: s.is_completed
        }));

        // Map riwayat from task_history
        const riwayat = (t.task_history || [])
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map(h => ({
            id: h.id,
            name: h.name,
            text: h.text,
            time: h.time,
            created_at: h.created_at
          }));

        // Map assignees (initial letters for avatar display)
        let orang = [];
        if (t.assigned_to && mappedTeam.membersList) {
          const found = mappedTeam.membersList.find(m => m.id === t.assigned_to);
          if (found && found.full_name) {
            orang = [found.full_name.charAt(0).toUpperCase()];
          }
        }
        // Also check for assignees array (supports multiple)
        if (t.assignees && Array.isArray(t.assignees)) {
          orang = t.assignees.map(aid => {
            const found = mappedTeam.membersList.find(m => m.id === aid);
            return found && found.full_name ? found.full_name.charAt(0).toUpperCase() : null;
          }).filter(Boolean);
        }

        // Map priority from DB format to frontend
        const prioMap = {
          'high': 'Tinggi',
          'medium': 'Sedang',
          'low': 'Rendah',
          'lowest': 'Terendah',
          'terendah': 'Terendah',
          'urgent': 'Tertinggi',
          'critical': 'Tertinggi'
        };
        
        // Map status from DB format to frontend
        const statusMap = {
          'completed': 'done',
          'in_progress': 'inprogress',
          'in_review': 'review',
          'todo': 'todo',
          'done': 'done'
        };

        return {
          id: t.id,
          title: t.title,
          desc: t.description || "",
          date: t.due_date ? new Date(t.due_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "",
          type: t.type || "Tugas",
          priority: prioMap[t.priority] || (['Tertinggi','Tinggi','Sedang','Rendah','Terendah'].includes(t.priority) ? t.priority : 'Rendah'),
          status: statusMap[t.status] || (['todo','inprogress','review','done'].includes(t.status) ? t.status : 'todo'),
          done: t.status === 'completed' || t.status === 'done',
          orang: orang,
          assigned_to: t.assigned_to,
          riwayat: riwayat,
          komentar: komentar,
          subtugas: subtugas
        };
      });

      setTasks(prevTasks => {
        const prevTaskMap = new Map((prevTasks || []).map(t => [t.id, t]));
        
        const mergedMappedTasks = mappedTasks.map(t => {
          const prev = prevTaskMap.get(t.id);
          let finalOrang = t.orang || [];
          let finalRiwayat = t.riwayat || [];

          if (prev) {
            if (prev.orang && prev.orang.length > 0) {
              finalOrang = Array.from(new Set([...(t.orang || []), ...prev.orang]));
            }

            if (prev.riwayat && prev.riwayat.length > 0) {
              const existingKeys = new Set((t.riwayat || []).map(r => `${r.name}_${r.text}_${r.created_at || r.time}`));
              const prevOnly = prev.riwayat.filter(r => !existingKeys.has(`${r.name}_${r.text}_${r.created_at || r.time}`));
              finalRiwayat = [...(t.riwayat || []), ...prevOnly];
            }
          }

          return {
            ...t,
            orang: finalOrang,
            riwayat: finalRiwayat
          };
        });

        const dbIds = new Set(mergedMappedTasks.map(t => t.id));
        const localTasks = (prevTasks || []).filter(t => typeof t.id === "string" && t.id.startsWith("task-") && !dbIds.has(t.id));
        const finalTasks = [...mergedMappedTasks, ...localTasks];
        memoryCache.set(`tasks_${teamId}`, finalTasks);
        return finalTasks;
      });

      try {
        const { getTeamActivityLogs } = await import("../../../../backend/activity");
        const logsData = await getTeamActivityLogs(teamId);
        setTeamActivityLogs(logsData || []);
      } catch (e) {
        console.warn("Failed to fetch team activity logs", e);
      }

    } catch (e) {
      console.error("Gagal memuat detail kelompok:", e);
    }
  };

  const updateAndSaveTasks = (newTasksList) => {
    setTasks(prev => {
      const updated = typeof newTasksList === "function" ? newTasksList(prev) : newTasksList;
      if (teamId) {
        memoryCache.set(`tasks_${teamId}`, updated);
        if (typeof window !== "undefined" && window._sipantauMemoryCache) {
          window._sipantauMemoryCache.set(`tasks_${teamId}`, updated);
        }
      }
      return updated;
    });
  };

  useEffect(() => {
    loadData();

    if (typeof window !== "undefined" && teamId) {
      const savedTab = localStorage.getItem(`sipantau_team_active_tab_${teamId}`) || localStorage.getItem("sipantau_team_active_tab");
      if (savedTab && ["dashboard", "list", "papan", "kalender"].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    }

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

  // ========== REALTIME SUBSCRIPTION & PERIODIC POLLING ==========
  useEffect(() => {
    if (!teamId) return;

    const scheduleReload = () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(() => {
        loadData();
        reloadTimerRef.current = null;
      }, 500);
    };

    // 1. Subscribe to changes on tasks table for this group
    const tasksChannel = supabase
      .channel(`tasks-${teamId}`)
      .on('postgres_changes', {
          event: '*', schema: 'public', table: 'tasks',
          filter: `group_id=eq.${teamId}`
        }, scheduleReload)
      .subscribe();

    // 2. Subscribe to subtasks changes (any subtask belonging to tasks in this group)
    const subtasksChannel = supabase
      .channel(`subtasks-${teamId}`)
      .on('postgres_changes', {
          event: '*', schema: 'public', table: 'subtasks'
        }, scheduleReload)
      .subscribe();

    // 3. Subscribe to task_comments changes
    const commentsChannel = supabase
      .channel(`comments-${teamId}`)
      .on('postgres_changes', {
          event: '*', schema: 'public', table: 'task_comments'
        }, scheduleReload)
      .subscribe();

    // 4. Subscribe to task_history changes
    const historyChannel = supabase
      .channel(`history-${teamId}`)
      .on('postgres_changes', {
          event: '*', schema: 'public', table: 'task_history'
        }, scheduleReload)
      .subscribe();

    // 5. Subscribe to group_members changes (team members added/removed)
    const membersChannel = supabase
      .channel(`members-${teamId}`)
      .on('postgres_changes', {
          event: '*', schema: 'public', table: 'group_members',
          filter: `group_id=eq.${teamId}`
        }, scheduleReload)
      .subscribe();

    // 6. Periodic polling fallback (every 30 seconds)
    const pollInterval = setInterval(() => {
      loadData();
    }, 30000);

    // Cleanup
    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(subtasksChannel);
      supabase.removeChannel(commentsChannel);
      supabase.removeChannel(historyChannel);
      supabase.removeChannel(membersChannel);
      clearInterval(pollInterval);
      if (reloadTimerRef.current) {
        clearTimeout(reloadTimerRef.current);
        reloadTimerRef.current = null;
      }
    };
  }, [teamId]);

  const isMentorOrAdmin = isMentor || isAdmin;

  // Available members berasal dari database (semua user terdaftar)
  const availableMembers = allUsers.map(u => ({
    id: u.id,
    name: u.full_name || u.email || "User",
    initial: (u.full_name || "?").charAt(0).toUpperCase(),
    avatar_url: u.avatar_url || null
  }));

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: "list",
      label: "List",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )
    },
    {
      id: "papan",
      label: "Papan",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      id: "kalender",
      label: "Kalender",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
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
                        let avatar = m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=f1f5f9&color=64748b&bold=true`;

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
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await removeGroupMember(team.id, m.id);
                                    // Reload data
                                    loadData();
                                  } catch (err) {
                                    console.error("Gagal menghapus anggota:", err);
                                  }
                                }}
                                className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Hapus Anggota"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            ) : (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await addGroupMember(team.id, m.id);
                                    // Reload data
                                    loadData();
                                  } catch (err) {
                                    console.error("Gagal menambah anggota:", err);
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
                    onClick={() => {
                      setShowTeamActionsDrop(false);
                      setActiveTab("dashboard");
                      if (typeof window !== "undefined") {
                        localStorage.setItem(`sipantau_team_active_tab_${team.id}`, "dashboard");
                        localStorage.setItem("sipantau_team_active_tab", "dashboard");
                      }
                    }}
                    className="flex items-center justify-between px-3 py-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:text-violet-600 transition-colors text-left w-full rounded-lg cursor-pointer"
                  >
                    Detail Kelompok
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
            onClick={() => {
              setActiveTab(tab.id);
              if (typeof window !== "undefined") {
                localStorage.setItem(`sipantau_team_active_tab_${teamId}`, tab.id);
                localStorage.setItem("sipantau_team_active_tab", tab.id);
              }
            }}
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
        {activeTab === "dashboard" && <TabDashboard tasks={tasks} teamLogs={teamActivityLogs} team={team} />}
        {activeTab === "list" && (
          <TabList
            tasks={tasks}
            setTasks={updateAndSaveTasks}
            setSelectedTask={setSelectedTask}
            setIsAddingTask={setIsAddingTask}
            team={team}
          />
        )}
        {activeTab === "papan" && (
          <TabPapan
            tasks={tasks}
            setTasks={updateAndSaveTasks}
            setSelectedTask={setSelectedTask}
            setIsAddingTask={setIsAddingTask}
            setTaskToDelete={setTaskToDelete}
            team={team}
          />
        )}
        {activeTab === "kalender" && (
          <TabKalender
            tasks={tasks}
            setTasks={updateAndSaveTasks}
            setSelectedTask={setSelectedTask}
            setIsAddingTask={setIsAddingTask}
            team={team}
          />
        )}
      </div>

      <GlobalTaskModals
        tasks={tasks}
        setTasks={updateAndSaveTasks}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        isAddingTask={isAddingTask}
        setIsAddingTask={setIsAddingTask}
        setTaskToDelete={setTaskToDelete}
        team={team}
      />

      {/* Custom Delete Confirmation Modal */}
      {taskToDelete && (
        <div className="fixed inset-0 z-[1000000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
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
                    deleteTask(taskToDelete.id, null, team?.id, taskToDelete.title).catch(e => console.warn("Supabase deleteTask error:", e));
                    const newTasksList = tasks.filter(t => t.id !== taskToDelete.id);
                    updateAndSaveTasks(newTasksList);
                    setTaskToDelete(null);
                    setSelectedTask(null);

                    if (typeof window !== "undefined") {
                      window.dispatchEvent(new CustomEvent("sipantau-toast", {
                        detail: { message: "Tugas berhasil dihapus.", type: "success" }
                      }));
                    }
                  } catch (e) {
                    console.error("Gagal menghapus tugas:", e);
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
