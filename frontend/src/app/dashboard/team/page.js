"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getActiveUser, getProfile } from "../../../backend/auth";
import { getUserGroups, createGroup, deleteGroup, updateGroup } from "../../../backend/groups";
import { getAllUsers } from "../../../backend/admin";

const memberColors = ["bg-violet-400", "bg-emerald-400", "bg-amber-400", "bg-rose-400", "bg-sky-400", "bg-indigo-400"];



const userAvatars = {
  "A": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=32&h=32&q=80",
  "M": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=32&h=32&q=80",
  "N": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=32&h=32&q=80",
  "B": "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=32&h=32&q=80",
  "R": "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=32&h=32&q=80",
  "H": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=32&h=32&q=80",
};

export default function TeamPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [teams, setTeams] = useState([]);
  const [role, setRole] = useState(null);
  const [isMentor, setIsMentor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [allMentors, setAllMentors] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [deletedTeams, setDeletedTeams] = useState([]);
  const [viewDeleted, setViewDeleted] = useState(false);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState(null);
  const [hardDeleteConfirmTeam, setHardDeleteConfirmTeam] = useState(null);

  const loadData = async () => {
    try {
      const authUser = await getActiveUser();
      if (!authUser) return;
      
      const profile = await getProfile(authUser.id);
      setCurrentUser(profile);
      setRole(profile.role);
      setIsMentor(profile.role === "mentor");
      setIsAdmin(profile.role === "admin");

      const allSysUsers = await getAllUsers();
      setAllUsers(allSysUsers);
      
      const mentors = allSysUsers.filter(u => u.role === "mentor");
      setAllMentors(mentors);
      
      const members = allSysUsers.filter(u => u.role === "pemagang" || u.role === "intern");
      setAvailableMembers(members);

      const dbGroups = await getUserGroups(profile.id, profile.role);
      const activeGroups = dbGroups.filter(g => !g.is_deleted);
      const delGroups = dbGroups.filter(g => g.is_deleted);
      
      setTeams(activeGroups);
      setDeletedTeams(delGroups);
    } catch (e) {
      console.error("Gagal memuat data:", e);
    }
  };

  useEffect(() => {
    loadData();

    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
      if (!e.target.closest('.add-team-container') && !e.target.closest('.member-select-dropdown')) {
        setShowAddModal(false);
        setShowMemberDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);



  const handleSoftDelete = async () => {
    if (deleteConfirmTeam) {
      try {
        await deleteGroup(deleteConfirmTeam.id, false);
        setTeams(teams.filter(t => t.id !== deleteConfirmTeam.id));
        setDeletedTeams([...deletedTeams, { ...deleteConfirmTeam, is_deleted: true }]);
        setDeleteConfirmTeam(null);
      } catch (e) {
        alert("Gagal menghapus: " + e.message);
      }
    }
  };

  const handleHardDelete = async () => {
    if (hardDeleteConfirmTeam) {
      try {
        await deleteGroup(hardDeleteConfirmTeam.id, true);
        setDeletedTeams(deletedTeams.filter(t => t.id !== hardDeleteConfirmTeam.id));
        setHardDeleteConfirmTeam(null);
      } catch (e) {
        alert("Gagal menghapus permanen: " + e.message);
      }
    }
  };

  const handleRestore = async (team) => {
    try {
      await updateGroup(team.id, { is_deleted: false });
      setDeletedTeams(deletedTeams.filter(t => t.id !== team.id));
      setTeams([...teams, { ...team, is_deleted: false }]);
      setOpenDropdown(null);
    } catch (e) {
      alert("Gagal memulihkan kelompok: " + e.message);
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMentor, setFilterMentor] = useState("Semua");

  // Add group form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newMentor, setNewMentor] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [showMembersDropId, setShowMembersDropId] = useState(null);

  // Close member dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest('.team-members-dropdown-container')) {
        setShowMembersDropId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddTeam = async () => {
    if (!newName.trim() || !currentUser) return;
    try {
      const selectedMentorId = isMentor ? currentUser.id : (newMentor || allMentors[0]?.id);
      const memberIds = selectedMembers.map(m => m.id);
      
      const newGroupData = {
        name: newName,
        description: newDesc || "Tidak ada deskripsi.",
        mentor_id: selectedMentorId,
        created_by: currentUser.id,
      };

      await createGroup(newGroupData, memberIds);
      
      // Reload teams
      await loadData();

      setShowAddModal(false);
      setNewName(""); setNewDesc(""); setSelectedMembers([]); setMemberSearch("");
    } catch (e) {
      alert("Gagal menambah kelompok: " + e.message);
    }
  };

  const isMentorOrAdmin = isMentor || isAdmin;
  const sourceTeams = viewDeleted ? deletedTeams : teams;

  const filtered = sourceTeams.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Convert mentor_id to mentor name for filtering
    const mentorObj = allUsers.find(u => u.id === t.mentor_id);
    const mentorName = mentorObj ? mentorObj.full_name : "Unknown";
    
    const matchMentorFilter = filterMentor === "Semua" || mentorName === filterMentor;

    return matchSearch && matchMentorFilter;
  });

  const displayTeams = filtered.map(t => {
    const team = { ...t };
    
    // Find member names and avatars
    team.membersList = (t.group_members || []).map(gm => {
      const user = allUsers.find(u => u.id === gm.user_id);
      return user || { id: gm.user_id, full_name: "Unknown", avatar_url: null };
    });
    
    const mentor = allUsers.find(u => u.id === t.mentor_id);
    team.mentorName = mentor ? mentor.full_name : "Unknown";
    
    // Task stats (if not loaded yet via join, placeholder 0)
    team.totalTugas = 0;
    team.selesai = 0;
    
    return team;
  });

  const mentorNamesFilter = ["Semua", ...new Set(sourceTeams.map(t => {
    const m = allUsers.find(u => u.id === t.mentor_id);
    return m ? m.full_name : "Unknown";
  }))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Direktori Kelompok Magang
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Daftar tim kerja kolaboratif magang BPS.
        </p>
      </div>

      {/* Action Bar */}
      {isMentorOrAdmin && (
        <div className="pt-1 flex items-center gap-3">
          <div className="relative add-team-container">
            <button
              onClick={() => setShowAddModal(!showAddModal)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer ${!viewDeleted ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-100' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Kelompok
            </button>
            
            {showAddModal && (
              <div className="absolute left-0 top-full mt-2 w-[280px] bg-white border border-slate-100 shadow-xl rounded-2xl p-4 z-50">
                <div className="flex justify-between items-center mb-3">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nama Kelompok"
                    className="font-bold text-sm text-slate-800 outline-none w-full placeholder-slate-400"
                  />
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold w-6 h-6 flex items-center justify-center cursor-pointer">✕</button>
                </div>
                
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Deskripsi"
                  className="w-full text-xs font-semibold text-slate-600 outline-none resize-none border border-slate-100 rounded-xl p-3 mb-3 bg-slate-50 focus:bg-white focus:border-violet-300 transition-colors placeholder-slate-300"
                  rows={3}
                />
                
                <div className="flex justify-between items-center mb-4 relative">
                  <div className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="flex items-center -space-x-1.5">
                      {selectedMembers.map((member, i) => (
                        <div
                          key={member.id}
                          className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white text-[9px] font-bold shadow-sm ${memberColors[member.full_name.length % memberColors.length]} z-[${10 - i}]`}
                        >
                          {member.full_name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    className="w-6 h-6 rounded-full border border-dashed border-slate-300 text-slate-400 flex items-center justify-center hover:text-violet-600 hover:border-violet-600 transition-colors cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                  </button>

                  {/* Member Selection Dropdown */}
                  {showMemberDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-[60] member-select-dropdown">
                      <div className="text-[10px] font-bold text-slate-800 mb-2">Anggota</div>
                      <input
                        type="text"
                        placeholder="Cari anggota..."
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 outline-none focus:border-violet-500 mb-2 transition-colors"
                      />
                      <div className="max-h-32 overflow-y-auto space-y-1 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {availableMembers
                          .filter((m) => m.full_name.toLowerCase().includes(memberSearch.toLowerCase()))
                          .map((m) => {
                            const isSelected = selectedMembers.some((sm) => sm.id === m.id);
                            return (
                              <div
                                key={m.id}
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedMembers(selectedMembers.filter((sm) => sm.id !== m.id));
                                  } else {
                                    setSelectedMembers([...selectedMembers, m]);
                                  }
                                }}
                                className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold ${memberColors[m.full_name.length % memberColors.length]}`}>
                                  {m.full_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[11px] font-semibold text-slate-700 flex-1">{m.full_name}</span>
                                {isSelected ? (
                                  <svg className="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                ) : null}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddTeam}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-md shadow-violet-100 transition-colors cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            )}
          </div>
          
          {isMentorOrAdmin && (
            <button
              onClick={() => setViewDeleted(!viewDeleted)}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm active:scale-95 transition-all cursor-pointer ${viewDeleted ? 'bg-slate-200 hover:bg-slate-300 text-slate-700' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'}`}
            >
              {viewDeleted ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                  Kelompok Aktif
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Kelompok Terhapus
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayTeams.map((team) => {
          const progress = team.totalTugas > 0 ? Math.round((team.selesai / team.totalTugas) * 100) : 0;
          return (
            <div
              key={team.id}
              onClick={() => router.push(`/dashboard/team/${team.id}`)}
              className="border border-slate-100 rounded-none p-6 bg-white hover:shadow-lg hover:shadow-slate-100 transition-all duration-200 flex flex-col gap-4 relative overflow-hidden group cursor-pointer"
            >
              {/* Left accent border */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600" />

              {/* Team name & desc */}
              <div className="pl-2">
                <div className="flex justify-between items-start gap-2 relative dropdown-container">
                  <h2 className="text-sm font-extrabold text-slate-800 leading-snug">{team.name}</h2>
                  {isMentorOrAdmin && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === team.id ? null : team.id); }}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  )}

                  {/* Dropdown Menu */}
                  {openDropdown === team.id && (
                    <div className="absolute right-0 top-6 mt-1 w-44 bg-white border border-slate-100 shadow-xl rounded-xl py-1 z-10 flex flex-col" onClick={(e) => e.stopPropagation()}>
                      {viewDeleted ? (
                        <>
                          <button
                            onClick={() => handleRestore(team)}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors text-left w-full cursor-pointer"
                          >
                            Pulihkan Kelompok
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                          </button>
                          <button
                            onClick={() => { router.push(`/dashboard/team/${team.id}`); setOpenDropdown(null); }}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors text-left w-full cursor-pointer"
                          >
                            Detail Kelompok
                            <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                          </button>
                          <button
                            onClick={() => { setHardDeleteConfirmTeam(team); setOpenDropdown(null); }}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors text-left w-full cursor-pointer border-t border-slate-50 mt-1"
                          >
                            Hapus Permanen
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => { router.push(`/dashboard/team/${team.id}`); setOpenDropdown(null); }}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors text-left w-full cursor-pointer"
                          >
                            Detail Kelompok
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                          </button>
                          <button
                            onClick={() => { router.push(`/dashboard/team/${team.id}`); setOpenDropdown(null); }}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-violet-600 transition-colors text-left w-full cursor-pointer"
                          >
                            Edit Kelompok
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                          </button>
                          <button
                            onClick={() => { setDeleteConfirmTeam(team); setOpenDropdown(null); }}
                            className="flex items-center justify-between px-4 py-2.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors text-left w-full cursor-pointer border-t border-slate-50 mt-1"
                          >
                            Hapus Kelompok
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{team.description}</p>
              </div>

              {/* Info Chips */}
              <div className="grid grid-cols-2 gap-3 pl-2 mt-2 w-full">
                {/* Mentor chip */}
                <div className="flex items-center justify-center gap-3 border border-slate-200 rounded-md py-3 px-2 bg-white">
                  <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                  <div className="flex flex-col text-left">
                    <div className="text-[12px] font-bold text-slate-800 leading-tight">Mentor</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{team.mentorName}</div>
                  </div>
                </div>

                {/* Tugas chip */}
                <div className="flex items-center justify-center gap-3 border border-slate-200 rounded-md py-3 px-2 bg-white">
                  <svg className="w-6 h-6 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <div className="flex flex-col text-left">
                    <div className="text-[12px] font-bold text-slate-800 leading-tight">Tugas Aktif</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{team.totalTugas} Tugas</div>
                  </div>
                </div>
              </div>



              {/* Footer: Avatars + Actions */}
              <div className="flex items-center justify-between pl-2">
                {/* Member Avatars */}
                <div className="relative team-members-dropdown-container">
                  <div 
                    className="flex -space-x-2 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={(e) => { e.stopPropagation(); setShowMembersDropId(showMembersDropId === team.id ? null : team.id); }}
                  >
                    {team.membersList.slice(0, 4).map((m, i) => (
                      m.avatar_url ? (
                        <img key={i} src={m.avatar_url} alt={m.full_name} className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-sm" />
                      ) : (
                        <div
                          key={i}
                          className={`w-7 h-7 rounded-full border-2 border-white ${memberColors[i % memberColors.length]} flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
                        >
                          {m.full_name.charAt(0).toUpperCase()}
                        </div>
                      )
                    ))}
                    {team.membersList.length > 4 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-500 text-[9px] font-bold shadow-sm">
                        +{team.membersList.length - 4}
                      </div>
                    )}
                  </div>

                  {showMembersDropId === team.id && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white border border-slate-100 shadow-xl rounded-xl p-3 z-[100] w-64 text-left" onClick={(e) => e.stopPropagation()}>
                      <div className="text-center text-xs font-bold text-slate-700 mb-3 pb-2 border-b border-slate-100">Anggota Kelompok</div>
                      <div className="space-y-1 max-h-48 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {team.membersList.map((m, idx) => {
                          let fullName = m.full_name;
                          let avatar = m.avatar_url;
                          
                          if (currentUser && m.id === currentUser.id) {
                            fullName += " (Anda)";
                          }

                          return (
                            <div key={idx} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                              {avatar ? (
                                <img src={avatar} alt={fullName} className="w-7 h-7 rounded-full object-cover shadow-sm shrink-0" />
                              ) : (
                                <div className={`w-7 h-7 rounded-full ${memberColors[idx % memberColors.length]} flex items-center justify-center text-white text-[10px] font-bold shadow-sm shrink-0`}>
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

                <div className="flex items-center gap-2">
                  {/* Remove the inline delete button since it is now in the dropdown */}

                  {/* Lihat Detail */}
                  <button
                    onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/team/${team.id}`); }}
                    className="flex items-center gap-1 text-xs font-extrabold text-violet-600 hover:text-violet-700 active:scale-95 transition-all cursor-pointer"
                  >
                    Lihat Detail
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {displayTeams.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center text-slate-400">
            <p className="text-sm font-bold">Tidak ada kelompok ditemukan</p>
            <p className="text-xs mt-1">Coba ubah kata kunci atau filter pencarian.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {(deleteConfirmTeam || hardDeleteConfirmTeam) && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Hapus Kelompok</h3>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  Anda akan menghapus &quot;{deleteConfirmTeam ? deleteConfirmTeam.name : hardDeleteConfirmTeam.name}&quot;
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => { setDeleteConfirmTeam(null); setHardDeleteConfirmTeam(null); }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Tidak, simpan.
                </button>
                <button
                  onClick={deleteConfirmTeam ? handleSoftDelete : handleHardDelete}
                  className="flex-1 bg-rose-500 hover:bg-rose-600 text-white text-sm font-bold py-2.5 rounded-xl shadow-md shadow-rose-200 transition-colors cursor-pointer"
                >
                  Ya, hapus.
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
