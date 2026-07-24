"use client";

import React, { useState, useEffect } from "react";
import { getAllUsers, updateUserStatus, updateUserProfile, deleteUsers } from "../../../backend/admin";
import { getActiveUser, signUpUser } from "../../../backend/auth";

export default function AccountsPage() {
  const [activeAdminId, setActiveAdminId] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedRow, setExpandedRow] = useState(null);

  const [editingRow, setEditingRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [newAccount, setNewAccount] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "pemagang",
    institution: "",
    major: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = (title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleEditStart = (user) => {
    setEditingRow(user.id);
    setEditFormData({ ...user });
  };

  const handleEditCancel = () => {
    setEditingRow(null);
    setEditFormData({});
  };

  const handleEditSave = async () => {
    try {
      await updateUserProfile(editingRow, {
        full_name: editFormData.full_name,
        phone: editFormData.phone,
        address: editFormData.address,
        institution: editFormData.institution,
        major: editFormData.major
      });
      const updatedUsers = users.map(u =>
        u.id === editingRow ? { ...u, ...editFormData } : u
      );
      setUsers(updatedUsers);
      setEditingRow(null);
    } catch (e) {
      alert("Gagal memperbarui profil: " + e.message);
    }
  };

  const loadUsers = async () => {
    try {
      const activeUser = await getActiveUser();
      if (activeUser) setActiveAdminId(activeUser.id);
      
      const dbUsers = await getAllUsers();
      setUsers(dbUsers);
    } catch (e) {
      console.error("Gagal memuat pengguna:", e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAddAccount = async () => {
    if (!newAccount.name || !newAccount.email) return;
    
    try {
      await signUpUser({
        email: newAccount.email,
        password: "password123",
        name: newAccount.name,
        phone: "-",
        address: "-",
        institution: newAccount.role === "mentor" ? "BPS Kota Semarang" : (newAccount.institution || "-"),
        major: "-",
        role: newAccount.role
      });
      
      // Reload users list
      await loadUsers();
      
      setShowAddModal(false);
      setNewAccount({ name: "", email: "", role: "pemagang", institution: "" });
    } catch (e) {
      alert("Gagal menambahkan akun: " + e.message);
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    if (!activeAdminId) return;
    try {
      await updateUserStatus(activeAdminId, userId, newStatus);
      const updatedUsers = users.map(user => {
        if (user.id === userId) {
          return { ...user, status: newStatus };
        }
        return user;
      });
      setUsers(updatedUsers);
      setExpandedRow(null);
    } catch (e) {
      alert("Gagal memperbarui status: " + e.message);
    }
  };

  const filteredUsers = users.filter(user => {
    // Filter by tab
    if (activeTab === "Belum Diverifikasi" && user.status !== "pending") return false;
    if (activeTab === "Sudah Diverifikasi" && user.status !== "active") return false;
    if (activeTab === "Ditolak" && user.status !== "rejected") return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const n = (user.full_name || user.email || "").toLowerCase();
      const i = (user.institution || "").toLowerCase();
      if (!n.includes(query) && !i.includes(query)) {
        return false;
      }
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );


  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <span className="px-3 py-1 bg-amber-100 text-amber-500 rounded-full text-[10px] font-bold">Menunggu</span>;
      case "active":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-500 rounded-full text-[10px] font-bold">Disetujui</span>;
      case "rejected":
        return <span className="px-3 py-1 bg-rose-100 text-rose-500 rounded-full text-[10px] font-bold">Ditolak</span>;
      default:
        return <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold">-</span>;
    }
  };

  const pendingCount = users.filter(u => u.status === "pending").length;

  const toggleSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const idsToDelete = userToDelete ? [userToDelete] : selectedUsers;
      await deleteUsers(idsToDelete);
      
      const updatedUsers = users.filter(u => !idsToDelete.includes(u.id));
      setUsers(updatedUsers);
      
      if (userToDelete) {
        setUserToDelete(null);
      } else {
        setSelectedUsers([]);
      }
      setShowDeleteConfirm(false);
    } catch (e) {
      alert("Gagal menghapus pengguna: " + e.message);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification Container */}
      <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-[#f0fdf4] border-l-4 border-[#4ade80] rounded shadow-md p-4 min-w-[320px] transform transition-all animate-[slideIn_0.3s_ease-out_forwards]"
          >
            <div className="bg-[#4ade80] rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-extrabold text-slate-800">{toast.title}</h4>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#86efac] hover:text-[#4ade80] transition-colors p-0.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
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

      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Direktori Tim</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {["Semua", "Belum Diverifikasi", "Sudah Diverifikasi", "Ditolak"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab
              ? "border-violet-600 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
          >
            {tab}
            {tab === "Belum Diverifikasi" && pendingCount > 0 && (
              <span className="ml-2 bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center py-2">
        <div className="flex items-center gap-4">
          <div className="relative w-72">
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama pengguna atau instansi"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border-none rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-violet-200 transition-shadow"
            />
          </div>

          {selectedUsers.length > 0 && (
            <>
              <div className="px-4 py-2 bg-violet-100 text-violet-600 text-[11px] font-bold rounded-full flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                {selectedUsers.length} terpilih
              </div>
              <button
                onClick={() => { setUserToDelete(null); setShowDeleteConfirm(true); }}
                className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-500 text-[11px] font-bold rounded-full flex items-center gap-2 transition-colors cursor-pointer"
              >
                Hapus Akun
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-violet-100 transition-all flex items-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Akun
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] custom-scrollbar relative">
          <table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: 0, border: 'none' }}>
            <thead className="sticky top-0 z-20 bg-white shadow-sm">
              <tr className="bg-white text-[11px] font-bold text-slate-400">
                <th className="pl-6 py-4 w-10 border-b border-slate-100 bg-white">
                  <input type="checkbox" className="w-4 h-4 rounded text-violet-600 border-slate-300 focus:ring-violet-500 cursor-pointer" />
                </th>
                <th className="py-4 w-10 border-b border-slate-100 bg-white"></th>
                <th className="px-2 py-4 font-semibold border-b border-slate-100 bg-white">Pengguna</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-100 bg-white">Peran</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-100 bg-white">Instansi</th>
                <th className="px-6 py-4 font-semibold border-b border-slate-100 bg-white">Tanggal Daftar</th>
                <th className="px-6 py-4 font-semibold text-center border-b border-slate-100 bg-white">Status</th>
                <th className="px-6 py-4 font-semibold text-center border-b border-slate-100 bg-white">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-slate-700 divide-y-0 divide-transparent" style={{ border: 'none' }}>
              {paginatedUsers.map((user, idx) => {
                const isExpanded = expandedRow === user.id;

                const isSelected = selectedUsers.includes(user.id);

                return (
                  <React.Fragment key={user.id}>
                    {/* Main Row */}
                    <tr 
                      onClick={() => setExpandedRow(isExpanded ? null : user.id)}
                      className={`transition-colors group border-0 cursor-pointer ${isExpanded ? 'bg-[#f8f7ff] border-x border-t border-[#d8d3fc]' : 'hover:bg-slate-50/50'}`} 
                      style={{ border: 'none' }}
                    >
                      <td className={`pl-6 py-4 border-none ${isExpanded ? 'border-l border-[#d8d3fc]' : ''}`} style={{ border: 'none' }}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => { e.stopPropagation(); toggleSelect(user.id); }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded text-violet-600 border-slate-300 focus:ring-violet-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-4 border-none">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setExpandedRow(isExpanded ? null : user.id); }} 
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-2 py-4 border-none">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || "User")}&background=f1f5f9&color=64748b&bold=true`}
                            alt={user.full_name}
                            className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                          />
                          <span className="text-xs font-bold text-slate-800">{user.full_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-none">
                        <div className="relative group/role inline-block" onClick={(e) => e.stopPropagation()}>
                          <button className="flex items-center gap-1.5 text-[11px] font-semibold text-violet-600 capitalize cursor-pointer">
                            {user.role}
                            <svg className="w-3 h-3 text-violet-400 group-hover/role:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <div className="absolute left-0 top-full mt-1 w-28 bg-white border border-slate-100 rounded-lg shadow-lg opacity-0 invisible group-hover/role:opacity-100 group-hover/role:visible transition-all z-10 flex flex-col py-1">
                            {['pemagang', 'mentor', 'admin'].map(r => (
                              <button
                                key={r}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newUsers = users.map(u => u.id === user.id ? { ...u, role: r } : u);
                                  setUsers(newUsers);
                                  updateUserProfile(user.id, { role: r }).catch(e => alert(e.message));
                                }}
                                className="px-4 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-violet-600 capitalize transition-colors"
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 border-none">
                        <span className="text-[11px] font-semibold text-slate-800">{user.institution}</span>
                      </td>
                      <td className="px-6 py-4 border-none">
                        <span className="text-[11px] font-semibold text-slate-800">
                          {new Date(user.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center border-none">
                        {getStatusBadge(user.status || "active")}
                      </td>
                      <td className={`px-6 py-4 text-center border-none ${isExpanded ? 'border-r border-[#d8d3fc]' : ''}`}>
                        {user.status === "pending" ? (
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(user.id, "active"); }}
                              className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-500 hover:bg-emerald-200 flex items-center justify-center transition-colors"
                              title="Setujui"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(user.id, "rejected"); }}
                              className="w-7 h-7 rounded-full bg-rose-100 text-rose-500 hover:bg-rose-200 flex items-center justify-center transition-colors"
                              title="Tolak"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center gap-4">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setExpandedRow(user.id); handleEditStart(user); }} 
                              className="text-indigo-500 hover:text-indigo-700 cursor-pointer"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); setUserToDelete(user.id); setShowDeleteConfirm(true); }}
                              className="text-rose-500 hover:text-rose-700 cursor-pointer transition-colors"
                              title="Hapus Akun"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Expanded Details Row */}
                    {isExpanded && (
                      <tr className="bg-[#f8f7ff] border-x border-b border-[#d8d3fc] relative">
                        <td colSpan="8" className="px-14 py-6 border-t border-slate-200/50">
                          <h4 className="text-[11px] font-bold text-slate-800 mb-6">Detail Profil</h4>

                          <div className="grid grid-cols-3 gap-8 pb-4">
                            {/* Column 1 */}
                            <div className="space-y-6">
                              <div className="flex items-start gap-3">
                                <div className="text-indigo-500 mt-0.5">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-500 font-semibold mb-1">Nama</p>
                                  {editingRow === user.id ? (
                                    <input
                                      type="text"
                                      value={editFormData.full_name || ""}
                                      onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })}
                                      className="text-xs font-bold text-slate-400 bg-transparent outline-none w-full border-b border-slate-200 pb-0.5 focus:border-violet-500 transition-colors"
                                    />
                                  ) : (
                                    <p className="text-xs font-bold text-slate-800">{user.full_name}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="text-indigo-500 mt-0.5">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-500 font-semibold mb-1">Email</p>
                                  {editingRow === user.id ? (
                                    <input
                                      type="email"
                                      value={editFormData.email || ""}
                                      disabled
                                      className="text-xs font-bold text-slate-400 bg-transparent outline-none w-full border-b border-slate-200 pb-0.5 focus:border-violet-500 transition-colors cursor-not-allowed"
                                    />
                                  ) : (
                                    <p className="text-xs font-bold text-slate-800">{user.email}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Column 2 */}
                            <div className="space-y-6">
                              <div className="flex items-start gap-3">
                                <div className="text-indigo-500 mt-0.5">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-500 font-semibold mb-1">Nomor Telepon</p>
                                  {editingRow === user.id ? (
                                    <input
                                      type="text"
                                      value={editFormData.phone || ""}
                                      onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                                      className="text-xs font-bold text-slate-400 bg-transparent outline-none w-full border-b border-slate-200 pb-0.5 focus:border-violet-500 transition-colors"
                                    />
                                  ) : (
                                    <p className="text-xs font-bold text-slate-800">{user.phone}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="text-indigo-500 mt-0.5">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-500 font-semibold mb-1">Alamat Rumah</p>
                                  {editingRow === user.id ? (
                                    <input
                                      type="text"
                                      value={editFormData.address || ""}
                                      onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                                      className="text-xs font-bold text-slate-400 bg-transparent outline-none w-full border-b border-slate-200 pb-0.5 focus:border-violet-500 transition-colors pr-10"
                                    />
                                  ) : (
                                    <p className="text-xs font-bold text-slate-800 pr-10">{user.address}</p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Column 3 */}
                            <div className="space-y-6">
                              <div className="flex items-start gap-3">
                                <div className="text-indigo-500 mt-0.5">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-[10px] text-slate-500 font-semibold mb-1">Asal Instansi</p>
                                  {editingRow === user.id ? (
                                    <input
                                      type="text"
                                      value={editFormData.institution || ""}
                                      onChange={e => setEditFormData({ ...editFormData, institution: e.target.value })}
                                      className="text-xs font-bold text-slate-400 bg-transparent outline-none w-full border-b border-slate-200 pb-0.5 focus:border-violet-500 transition-colors"
                                    />
                                  ) : (
                                    <p className="text-xs font-bold text-slate-800">{user.institution}</p>
                                  )}
                                </div>
                              </div>
                              {user.role !== "mentor" && (
                                <div className="flex items-start gap-3">
                                  <div className="text-indigo-500 mt-0.5">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path d="M12 14l9-5-9-5-9 5 9 5z" />
                                      <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                    </svg>
                                  </div>
                                  <div>
                                    <p className="text-[10px] text-slate-500 font-semibold mb-1">Jurusan</p>
                                    {editingRow === user.id ? (
                                      <input
                                        type="text"
                                        value={editFormData.major || ""}
                                        onChange={e => setEditFormData({ ...editFormData, major: e.target.value })}
                                        className="text-xs font-bold text-slate-400 bg-transparent outline-none w-full border-b border-slate-200 pb-0.5 focus:border-violet-500 transition-colors"
                                      />
                                    ) : (
                                      <p className="text-xs font-bold text-slate-800">{user.major || "-"}</p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions Bottom Right */}
                          <div className="flex justify-end gap-3 mt-6">
                            {user.status === "pending" ? (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(user.id, "rejected")}
                                  className="px-6 py-2.5 bg-white border border-slate-100 text-slate-800 text-[11px] font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  Tolak Akun
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(user.id, "active")}
                                  className="px-6 py-2.5 bg-violet-600 text-white text-[11px] font-bold rounded-xl shadow-sm hover:bg-violet-700 transition-colors cursor-pointer"
                                >
                                  Setujui Akun
                                </button>
                              </>
                            ) : editingRow === user.id ? (
                              <>
                                <button
                                  onClick={handleEditCancel}
                                  className="px-6 py-2.5 bg-white border border-slate-100 text-slate-800 text-[11px] font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  Batalkan
                                </button>
                                <button
                                  onClick={handleEditSave}
                                  className="px-6 py-2.5 bg-violet-600 text-white text-[11px] font-bold rounded-xl shadow-sm hover:bg-violet-700 transition-colors cursor-pointer"
                                >
                                  Simpan Perubahan
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleEditStart(user)}
                                className="px-6 py-2.5 bg-violet-600 text-white text-[11px] font-bold rounded-xl shadow-sm hover:bg-violet-700 transition-colors cursor-pointer"
                              >
                                Ubah Detail Profil
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center p-6">
                      <img src="/empty-accounts.svg" alt="Belum ada akun terdaftar" className="w-56 h-36 object-contain mb-4" />
                      <p className="text-sm font-extrabold text-slate-800">Belum ada akun terdaftar</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-2 shrink-0">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
              currentPage === 1
                ? "bg-[#e9ecef] text-violet-600 opacity-60 cursor-not-allowed"
                : "bg-violet-600 text-white hover:bg-violet-700 cursor-pointer"
            }`}
          >
            «
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
              currentPage === 1
                ? "bg-[#e9ecef] text-violet-600 opacity-60 cursor-not-allowed"
                : "bg-violet-600 text-white hover:bg-violet-700 cursor-pointer"
            }`}
          >
            ‹
          </button>

          {(() => {
            const pages = [];
            if (totalPages <= 5) {
              for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
              }
            } else {
              if (currentPage <= 2) {
                pages.push(1, 2, 3, "...", totalPages);
              } else if (currentPage >= totalPages - 1) {
                pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
              } else {
                pages.push(1, "...", currentPage, "...", totalPages);
              }
            }
            return pages.map((p, idx) => {
              if (p === "...") {
                return (
                  <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs font-bold text-violet-600">
                    ...
                  </span>
                );
              }
              const isActive = currentPage === p;
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? "bg-violet-600 border border-violet-600 text-white shadow-sm cursor-default"
                      : "bg-white border border-violet-600 text-violet-600 hover:bg-violet-50 cursor-pointer"
                  }`}
                >
                  {p}
                </button>
              );
            });
          })()}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
              currentPage === totalPages
                ? "bg-[#e9ecef] text-violet-600 opacity-60 cursor-not-allowed"
                : "bg-violet-600 text-white hover:bg-violet-700 cursor-pointer"
            }`}
          >
            ›
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all ${
              currentPage === totalPages
                ? "bg-[#e9ecef] text-violet-600 opacity-60 cursor-not-allowed"
                : "bg-violet-600 text-white hover:bg-violet-700 cursor-pointer"
            }`}
          >
            »
          </button>
        </div>
      )}


      {/* Tambah Akun Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
              <h2 className="text-[15px] font-extrabold text-slate-800">Tambah Akun</h2>
            </div>

            <div className="p-8 space-y-5 overflow-y-auto custom-scrollbar flex-1">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Nama</label>
                <input
                  type="text"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-full px-5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Email</label>
                <input
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-full px-5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  placeholder="Contoh: budi.santoso@email.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Nomor Telepon</label>
                <input
                  type="tel"
                  value={newAccount.phone}
                  onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-full px-5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Alamat Rumah</label>
                <input
                  type="text"
                  value={newAccount.address}
                  onChange={(e) => setNewAccount({ ...newAccount, address: e.target.value })}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-full px-5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  placeholder="Contoh: Jl. Pahlawan No. 1, Semarang"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Role</label>
                <div className="flex items-center gap-10 mt-1 pl-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      value="pemagang"
                      checked={newAccount.role === "pemagang"}
                      onChange={() => setNewAccount({ ...newAccount, role: "pemagang", institution: "", major: "" })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${newAccount.role === "pemagang" ? "border-violet-600 bg-white" : "border-slate-300"}`}>
                      {newAccount.role === "pemagang" && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">Pemagang</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      value="mentor"
                      checked={newAccount.role === "mentor"}
                      onChange={() => setNewAccount({ ...newAccount, role: "mentor", institution: "Badan Pusat Statistik", major: "" })}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${newAccount.role === "mentor" ? "border-violet-600 bg-white" : "border-slate-300"}`}>
                      {newAccount.role === "mentor" && <div className="w-2 h-2 rounded-full bg-violet-600" />}
                    </div>
                    <span className="text-xs font-medium text-slate-700">Mentor</span>
                  </label>
                </div>
              </div>

              {newAccount.role === "pemagang" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Asal Instansi</label>
                    <input
                      type="text"
                      value={newAccount.institution}
                      onChange={(e) => setNewAccount({ ...newAccount, institution: e.target.value })}
                      className="w-full border border-slate-200 bg-slate-50/50 rounded-full px-5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                      placeholder="Contoh: Universitas Diponegoro"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Jurusan</label>
                    <input
                      type="text"
                      value={newAccount.major}
                      onChange={(e) => setNewAccount({ ...newAccount, major: e.target.value })}
                      className="w-full border border-slate-200 bg-slate-50/50 rounded-full px-5 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                      placeholder="Contoh: Statistika"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Asal Instansi</label>
                  <input
                    type="text"
                    value="Badan Pusat Statistik"
                    readOnly
                    className="w-1/2 border border-slate-200 bg-slate-100/70 rounded-full px-5 py-2.5 text-xs text-slate-500 outline-none cursor-not-allowed"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-800 block"><span className="text-rose-500">*</span> Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newAccount.password}
                    onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-full pl-5 pr-12 py-2.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                    placeholder="Masukkan password sementara"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 pt-4 bg-white shrink-0 relative">
              {/* Close button layered absolutely to the top right to act outside of flow if needed, but it's on header.
                   Wait, there's no visible close button in the user's screenshot, but I'll add an invisible overlay click or just keep the header simple.
                   Actually, the user screenshot doesn't have an X button on the top right. It just has "Tambah Akun" text.
                   I'll remove the X button in the header and rely on backdrop click to close.
               */}
              <button
                onClick={handleAddAccount}
                className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white text-xs font-bold py-3.5 rounded-full shadow-lg shadow-violet-100 transition-all cursor-pointer"
              >
                Tambah Akun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[1.5rem] w-[320px] shadow-2xl p-6 flex flex-col items-center text-center">
            <div className="mb-4">
              <svg className="w-14 h-14 text-[#f43f5e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-2">Hapus Akun</h3>
            <p className="text-[11px] text-slate-600 font-semibold mb-6">Anda akan menghapus {userToDelete ? 'akun' : (selectedUsers.length > 1 ? `${selectedUsers.length} akun` : 'akun')} ini.</p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => { setShowDeleteConfirm(false); setUserToDelete(null); }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Tidak, simpan.
              </button>
              <button
                onClick={handleDeleteSelected}
                className="flex-1 bg-[#de3b4b] hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
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
