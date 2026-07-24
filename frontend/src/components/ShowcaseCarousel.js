"use client";

import React, { useState, useEffect } from "react";

/* ==========================================================================
   CSS Keyframe Animations
   ========================================================================== */
const CAROUSEL_STYLES = `
  /* ── Slide 1: Badge "Walking" animations ── */
  @keyframes badgeWalkFromLeft {
    0%    { transform: translateX(-180%); opacity: 0; }
    12%   { transform: translateX(0);     opacity: 1; }
    78%   { transform: translateX(0);     opacity: 1; }
    90%   { transform: translateX(-180%); opacity: 0; }
    100%  { transform: translateX(-180%); opacity: 0; }
  }
  @keyframes badgeWalkFromRight {
    0%    { transform: translateX(180%);  opacity: 0; }
    18%   { transform: translateX(0);     opacity: 1; }
    78%   { transform: translateX(0);     opacity: 1; }
    96%   { transform: translateX(180%);  opacity: 0; }
    100%  { transform: translateX(180%);  opacity: 0; }
  }
  @keyframes badgeWalkFromTop {
    0%    { transform: translateY(-250%); opacity: 0; }
    15%   { transform: translateY(0);     opacity: 1; }
    78%   { transform: translateY(0);     opacity: 1; }
    93%   { transform: translateY(-250%); opacity: 0; }
    100%  { transform: translateY(-250%); opacity: 0; }
  }

  /* ── Slide 2: Three-panel spread animations ── */
  @keyframes panelSpreadLeft {
    0%, 8%    { transform: translateX(135%) translateY(-50%); opacity: 0; }
    28%, 72%  { transform: translateX(0)    translateY(-50%); opacity: 1; }
    92%, 100% { transform: translateX(135%) translateY(-50%); opacity: 0; }
  }
  @keyframes panelSpreadRight {
    0%, 8%    { transform: translateX(-135%) translateY(-50%); opacity: 0; }
    28%, 72%  { transform: translateX(0)      translateY(-50%); opacity: 1; }
    92%, 100% { transform: translateX(-135%) translateY(-50%);  opacity: 0; }
  }
  @keyframes panelCenterReveal {
    0%, 5%    { opacity: 0; transform: scale(0.86); }
    22%, 78%  { opacity: 1; transform: scale(1); }
    95%, 100% { opacity: 0; transform: scale(0.86); }
  }

  /* ── Slide 3: Cursor click + card popup ── */
  @keyframes cursorClick {
    0%    { transform: translate(0px, 0px);            opacity: 0; }
    8%    { transform: translate(0px, 0px);            opacity: 1; }
    38%   { transform: translate(22px, -20px);         opacity: 1; }
    46%   { transform: translate(22px, -20px) scale(0.72); opacity: 1; }
    54%   { transform: translate(22px, -20px);         opacity: 1; }
    82%   { transform: translate(0px, 0px);            opacity: 1; }
    92%   { transform: translate(0px, 0px);            opacity: 0; }
    100%  { transform: translate(0px, 0px);            opacity: 0; }
  }
  @keyframes teamCardReveal {
    0%, 52%   { opacity: 0; transform: scale(0.70) translateY(12px); }
    62%, 85%  { opacity: 1; transform: scale(1)    translateY(0px); }
    93%, 100% { opacity: 0; transform: scale(0.70) translateY(12px); }
  }

  /* ── Shared: gentle float ── */
  @keyframes floatUp {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-5px); }
  }
  @keyframes floatDown {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(5px); }
  }

  /* ── Slide text entry ── */
  @keyframes textSlideUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ==========================================================================
   Slide Data — unique title & subtitle per slide
   ========================================================================== */
const slides = [
  {
    title: "Pantau Lebih Mudah. Kelola Lebih Baik.",
    subtitle:
      "SIPANTAU memudahkan proses pemantauan kegiatan, pelaporan, dan evaluasi mahasiswa magang di BPS Kota Semarang.",
    type: "dashboard",
  },
  {
    title: "Kelola Tugas dengan Detail & Presisi.",
    subtitle:
      "Lihat semua informasi tugas dalam satu tampilan — jenis, prioritas, penerima, tenggat, dan riwayat aktivitas tim.",
    type: "task",
  },
  {
    title: "Profil & Tim dalam Satu Genggaman.",
    subtitle:
      "Atur profil magang, pantau tim, dan lihat analitik performa langsung dari dashboard SIPANTAU.",
    type: "settings",
  },
];

/* ==========================================================================
   Main Carousel Component
   ========================================================================== */
export default function ShowcaseCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [textKey, setTextKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
      setTextKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleDotClick = (index) => {
    setActiveSlide(index);
    setTextKey((k) => k + 1);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CAROUSEL_STYLES }} />

      <div
        className="relative w-full max-w-[520px] rounded-[2.5rem] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-6 flex flex-col justify-between shadow-2xl shadow-indigo-200 overflow-hidden"
        style={{ minHeight: "610px", flex: 1 }}
      >
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-300/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* ── Illustration Area ── */}
        <div
          className="relative flex-1 flex items-center justify-center w-full"
          style={{ minHeight: "370px" }}
        >
          {activeSlide === 0 && <DashboardSlide />}
          {activeSlide === 1 && <TaskDetailSlide />}
          {activeSlide === 2 && <SettingsSlide />}
        </div>

        {/* ── Text & Dot Indicators ── */}
        <div className="relative z-10 text-center text-white mt-5" key={textKey}>
          <h3
            className="text-xl sm:text-2xl font-bold tracking-tight mb-2"
            style={{ animation: "textSlideUp 0.45s ease-out both" }}
          >
            {slides[activeSlide].title}
          </h3>
          <p
            className="text-xs sm:text-sm text-indigo-100/90 max-w-sm mx-auto leading-relaxed"
            style={{ animation: "textSlideUp 0.45s ease-out 0.1s both" }}
          >
            {slides[activeSlide].subtitle}
          </p>

          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeSlide
                    ? "w-6 bg-white"
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ==========================================================================
   Slide 1 — Dashboard Mockup
   Animation: Badge cards "berjalan" masuk dari kiri, atas, dan kanan
   ========================================================================== */
function DashboardSlide() {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/* ── Main Mockup Window ── */}
      <div className="w-[88%] max-w-[390px] aspect-[16/10] rounded-2xl bg-white border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Title bar dots */}
        <div className="h-5 border-b border-slate-100 bg-slate-50 flex items-center px-3 gap-1 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-[68px] border-r border-slate-100 bg-slate-50/60 p-1.5 flex flex-col justify-between flex-shrink-0">
            <div className="space-y-2">
              <div className="w-5 h-5 rounded-full bg-slate-200 mx-auto mb-2 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-100 rounded px-1.5 py-1 shadow-sm">
                <span className="text-[7px]">🏠</span>
                <span className="text-[5.5px] font-bold text-slate-800">Beranda</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-1 text-slate-400">
                <span className="text-[7px]">👥</span>
                <span className="text-[5.5px] font-medium">Team</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-400">
                <span className="text-[6px]">⚙️</span>
                <span className="text-[4.5px]">Pengaturan</span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-400">
                <span className="text-[6px]">🚪</span>
                <span className="text-[4.5px]">Keluar</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-2.5 flex flex-col gap-1.5 min-h-0 overflow-hidden">
            <div>
              <div className="text-[9px] font-bold text-slate-800">Beranda</div>
              <div className="text-[5.5px] text-slate-400">Selamat datang kembali Andi!</div>
            </div>

            {/* Welcome Banner */}
            <div className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 p-2 text-white">
              <div className="text-[7.5px] font-bold mb-0.5">Selamat Pagi, Andi!</div>
              <div className="text-[4.5px] text-indigo-100 leading-tight mb-1">
                &quot;Tanpa data, Anda hanyalah orang lain dengan pendapat.&quot; Mari bantu BPS menyediakan data berkualitas untuk Indonesia hari ini.
              </div>
              <button className="px-1.5 py-0.5 rounded bg-white text-indigo-600 text-[5px] font-bold">
                Lihat Tugas Hari Ini →
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-1">
              {[
                { icon: "✓", label: "2 Selesai", desc: "Tugas sudah terselesaikan.", border: "border-emerald-400" },
                { icon: "📄", label: "4 Dijadwalkan", desc: "Tugas yang segera dimulai.", border: "border-blue-400" },
                { icon: "🔄", label: "1 Diperbarui", desc: "Perubahan dalam penugasan.", border: "border-amber-400" },
                { icon: "⚠️", label: "1 Terlambat", desc: "Melewati batas waktu.", border: "border-rose-400" },
              ].map((s, i) => (
                <div key={i} className="p-1 border border-slate-100 bg-white rounded-md shadow-sm flex flex-col gap-0.5">
                  <div className="flex items-center gap-0.5">
                    <span className="text-[7px]">{s.icon}</span>
                    <span className="text-[4.5px] font-bold text-slate-800 leading-tight">{s.label}</span>
                  </div>
                  <span className="text-[3.5px] text-slate-400 leading-tight">{s.desc}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <span className="text-[5.5px] font-bold text-indigo-600">Lihat Tim Sekarang →</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Floating Badge: 2 Selesai — masuk dari kiri ── */}
      <div
        className="absolute top-[22%] bg-white border border-slate-100 rounded-xl px-2 py-1.5 flex items-center gap-1.5 shadow-lg z-20"
        style={{ left: "4px", animation: "badgeWalkFromLeft 4.5s ease-in-out infinite" }}
      >
        <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold flex-shrink-0" style={{ fontSize: "10px" }}>
          ✓
        </div>
        <div>
          <div className="text-[7.5px] font-bold text-slate-800 whitespace-nowrap">2 Selesai</div>
          <div className="text-[5px] text-slate-400 whitespace-nowrap">Tugas sudah terselesaikan.</div>
        </div>
      </div>

      {/* ── Floating Badge: Beranda — masuk dari atas ── */}
      <div
        className="absolute top-[5%] right-[12%] bg-white border border-slate-100 rounded-lg px-2 py-1 flex items-center gap-1.5 shadow-md z-20"
        style={{ animation: "badgeWalkFromTop 4.5s ease-in-out 0.6s infinite" }}
      >
        <span className="text-[8px]">🏠</span>
        <span className="text-[6.5px] font-bold text-slate-700 whitespace-nowrap">Beranda</span>
        {/* Cursor icon */}
        <div className="absolute -bottom-2.5 -right-1.5">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#1e293b">
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a1 1 0 0 1 .35-.24l6.26-1.78c.48-.13.57-.79.15-1.06L6.23 3.01a.6.6 0 0 0-.73.2z" />
          </svg>
        </div>
      </div>

      {/* ── Floating Badge: 1 Diperbarui — masuk dari kanan ── */}
      <div
        className="absolute bottom-[18%] bg-white border border-slate-100 rounded-xl px-2 py-1.5 flex items-center gap-1.5 shadow-lg z-20"
        style={{ right: "4px", animation: "badgeWalkFromRight 4.5s ease-in-out 1s infinite" }}
      >
        <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0" style={{ fontSize: "10px" }}>
          🔄
        </div>
        <div>
          <div className="text-[7.5px] font-bold text-slate-800 whitespace-nowrap">1 Diperbarui</div>
          <div className="text-[5px] text-slate-400 whitespace-nowrap">Perubahan dalam penugasan.</div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Slide 2 — Task Detail Mockup
   Animation: 3 panel (kiri, tengah, kanan) awalnya tumpuk lalu melebar
   ========================================================================== */
function TaskDetailSlide() {
  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{ minHeight: "285px" }}
    >
      {/* ── Left Panel: Task Detail Sidebar ── */}
      <div
        className="bg-white rounded-2xl p-3 shadow-xl border border-slate-100 z-10"
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          width: "102px",
          animation: "panelSpreadLeft 5.5s ease-in-out infinite",
        }}
      >
        <div className="space-y-2.5">
          <div>
            <div className="text-[4.5px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Jenis Tugas</div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[5.5px] font-bold bg-indigo-50 text-indigo-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block flex-shrink-0" />
              Design
            </span>
          </div>
          <div>
            <div className="text-[4.5px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Prioritas Tugas</div>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[5.5px] font-bold bg-rose-50 text-rose-700">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block flex-shrink-0" />
              Tertinggi
            </span>
          </div>
          <div>
            <div className="text-[4.5px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Penerima Tugas</div>
            <div className="flex -space-x-1">
              {["A", "M", "+"].map((l, i) => (
                <div key={i} className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center font-bold text-white ${i === 0 ? "bg-violet-400" : i === 1 ? "bg-emerald-400" : "bg-slate-300"}`} style={{ fontSize: "4px" }}>{l}</div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[4.5px] text-slate-400 font-semibold uppercase tracking-wide mb-1">Tenggat Tugas</div>
            <div className="text-[5.5px] font-bold text-slate-800">📅 4 Juli 2026</div>
          </div>
        </div>
      </div>

      {/* ── Center Panel: Main Task Card ── */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 z-20 flex-shrink-0"
        style={{
          width: "178px",
          padding: "14px",
          animation: "panelCenterReveal 5.5s ease-in-out infinite",
        }}
      >
        <div className="flex items-start justify-between mb-1.5">
          <h4 className="text-[8px] font-extrabold text-slate-800 leading-tight" style={{ maxWidth: "140px" }}>
            Pembuatan UI/UX Website
          </h4>
          <span className="text-slate-400 ml-1 leading-none" style={{ fontSize: "12px" }}>···</span>
        </div>
        <p className="text-[5.5px] text-slate-500 leading-tight mb-3">
          Membuat tampilan antarmuka website Kanban
        </p>

        <div className="flex gap-1.5 mb-3">
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold whitespace-nowrap" style={{ fontSize: "6px" }}>
            <span className="w-2 h-2 rounded-sm bg-indigo-500 inline-block flex-shrink-0" />
            Tugas
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 text-rose-600 font-bold whitespace-nowrap" style={{ fontSize: "6px" }}>
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block flex-shrink-0" />
            Tertinggi
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex -space-x-1.5">
            {[["A", "bg-violet-400"], ["M", "bg-emerald-400"], ["+", "bg-slate-200 text-slate-500"]].map(([l, cls], i) => (
              <div key={i} className={`w-4 h-4 rounded-full border-2 border-white flex items-center justify-center font-bold ${cls} ${i < 2 ? "text-white" : ""}`} style={{ fontSize: "4px" }}>{l}</div>
            ))}
          </div>
          <span className="text-slate-400" style={{ fontSize: "5px" }}>📅 1 Jul 2026</span>
        </div>
      </div>

      {/* ── Right Panel: Riwayat & Komentar ── */}
      <div
        className="bg-white rounded-2xl p-2.5 shadow-xl border border-slate-100 z-10"
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          width: "112px",
          animation: "panelSpreadRight 5.5s ease-in-out infinite",
        }}
      >
        <div className="text-[6px] font-bold text-slate-800 mb-2">Riwayat</div>
        <div className="space-y-1.5 pb-2 mb-2 border-b border-slate-100">
          <div className="flex items-start gap-1">
            <div className="w-3 h-3 rounded-full bg-violet-400 flex-shrink-0 text-white flex items-center justify-center font-bold mt-0.5" style={{ fontSize: "3.5px" }}>A</div>
            <p style={{ fontSize: "4.5px" }} className="text-slate-500 leading-tight">
              <span className="font-semibold text-slate-700">Andi B. </span>
              telah membuat penugasan{" "}
              <span className="text-indigo-600 font-medium">Pembuatan UI/UX Website</span>
            </p>
          </div>
          <div className="flex items-start gap-1">
            <div className="w-3 h-3 rounded-full bg-pink-400 flex-shrink-0 text-white flex items-center justify-center font-bold mt-0.5" style={{ fontSize: "3.5px" }}>M</div>
            <p style={{ fontSize: "4.5px" }} className="text-slate-500 leading-tight">
              <span className="font-semibold text-slate-700">Miyesha A. </span>
              telah mengubah penerima tugas.
            </p>
          </div>
        </div>

        <div className="text-[6px] font-bold text-slate-800 mb-1.5">Komentar</div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0 text-white flex items-center justify-center font-bold" style={{ fontSize: "3.5px" }}>N</div>
          <span style={{ fontSize: "4.5px" }} className="text-slate-500">Nurul Kumala</span>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Slide 3 — Settings / Profile Mockup
   Animation: Kursor bergerak → klik → card tim muncul (loop)
   ========================================================================== */
function SettingsSlide() {
  return (
    <div
      className="relative w-full flex items-center justify-center"
      style={{ minHeight: "295px" }}
    >
      {/* ── Main Settings Window ── */}
      <div className="w-[88%] max-w-[390px] aspect-[16/10] rounded-2xl bg-white border border-slate-100 shadow-2xl overflow-hidden flex flex-col">
        {/* Title bar */}
        <div className="h-5 border-b border-slate-100 bg-slate-50 flex items-center px-3 gap-1 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Mini sidebar */}
          <div className="w-16 border-r border-slate-100 bg-slate-50 p-1.5 flex flex-col gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1 bg-white border border-slate-100 rounded px-1.5 py-1 shadow-sm">
              <span style={{ fontSize: "6px" }}>⚙️</span>
              <span style={{ fontSize: "4.5px" }} className="font-bold text-slate-800">Pengaturan</span>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-2.5 flex flex-col gap-1.5 min-h-0 overflow-hidden">
            <div>
              <div className="text-[9px] font-bold text-slate-800">Pengaturan</div>
              <div className="text-[5.5px] text-slate-400">Simpan perubahan profil Anda.</div>
            </div>

            {/* Profile row */}
            <div className="flex items-center gap-2">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white font-bold" style={{ fontSize: "8px" }}>
                  AB
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-violet-600 border border-white flex items-center justify-center">
                  <span className="text-white" style={{ fontSize: "5px" }}>+</span>
                </div>
              </div>
              <div>
                <div className="text-[7.5px] font-bold text-slate-800">Andi Basudara</div>
                <div className="text-[5.5px] text-slate-400">Pemagang</div>
              </div>
            </div>

            {/* Form fields */}
            <div className="space-y-1">
              <div style={{ fontSize: "5px" }} className="font-bold text-slate-500 uppercase tracking-wide">Detail Profil</div>
              {[
                { icon: "👤", label: "Nama:", val: "Andi Basudara" },
                { icon: "✉️", label: "Email:", val: "andi@bps.go.id" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-1 border border-slate-100 rounded-md p-1.5">
                  <span style={{ fontSize: "6px" }}>{f.icon}</span>
                  <span style={{ fontSize: "5px" }} className="text-slate-400">{f.label}</span>
                  <span style={{ fontSize: "5px" }} className="text-slate-700 font-medium">{f.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Rincian Prioritas Bar Chart — floats gently ── */}
      <div
        className="absolute bg-white rounded-xl p-2 shadow-xl border border-slate-100 z-20"
        style={{
          top: "4%",
          right: "2%",
          width: "108px",
          animation: "floatUp 3s ease-in-out infinite",
        }}
      >
        <div style={{ fontSize: "5.5px" }} className="font-bold text-slate-800 mb-1.5">Rincian Prioritas</div>
        <div style={{ fontSize: "4px" }} className="text-slate-400 mb-1">Beri nilai sesuai pelayanan tempatmu.</div>
        <div className="flex items-end gap-0.5" style={{ height: "32px" }}>
          {[
            { color: "bg-rose-400", h: "38%", label: "Tertinggi" },
            { color: "bg-amber-400", h: "80%", label: "Tinggi" },
            { color: "bg-slate-300", h: "55%", label: "Sedang" },
            { color: "bg-blue-300", h: "28%", label: "Rendah" },
            { color: "bg-violet-300", h: "18%", label: "Terendah" },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div className={`w-full rounded-t ${bar.color}`} style={{ height: bar.h }} />
              <span style={{ fontSize: "3px" }} className="text-slate-400 text-center leading-tight">{bar.label.slice(0, 3)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Log Aktivitas hint ── */}
      <div
        className="absolute bg-white/90 backdrop-blur rounded-xl p-2 shadow-md border border-slate-100 z-15"
        style={{
          bottom: "4%",
          right: "3%",
          width: "100px",
          animation: "floatDown 3.5s ease-in-out infinite",
        }}
      >
        <div style={{ fontSize: "5.5px" }} className="font-bold text-slate-700 mb-1">Log Aktivitas</div>
        {[
          { color: "bg-violet-400", text: "Pembuatan UI/UX Website" },
          { color: "bg-emerald-400", text: "Pembuatan Repo GitHub" },
          { color: "bg-indigo-400", text: "Pembuatan Database" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-1 mb-0.5">
            <div className={`w-1 h-1 rounded-full ${item.color} flex-shrink-0`} />
            <span style={{ fontSize: "4px" }} className="text-indigo-600 leading-tight truncate">{item.text}</span>
          </div>
        ))}
      </div>

      {/* ── Team Info Card — muncul saat kursor klik ── */}
      <div
        className="absolute bg-white rounded-2xl shadow-2xl border border-slate-100 z-30"
        style={{
          bottom: "6%",
          left: "4%",
          width: "145px",
          padding: "10px",
          animation: "teamCardReveal 5s ease-in-out infinite",
        }}
      >
        <div style={{ fontSize: "6px" }} className="font-bold text-slate-800 mb-0.5 leading-tight">
          Tim Teknologi Informasi UNDIP
        </div>
        <div style={{ fontSize: "4.5px" }} className="text-slate-400 mb-2 leading-tight">
          Bertanggung jawab atas pengembangan aplikasi monitoring dan maintenance jaringan.
        </div>
        <div className="grid grid-cols-2 gap-1 mb-2">
          {[
            { icon: "📋", label: "Mentor", val: "Bambang H" },
            { icon: "✅", label: "Tugas Aktif", val: "5 Tugas" },
          ].map((item, i) => (
            <div key={i} className="border border-slate-100 rounded-lg p-1 flex flex-col items-center gap-0.5">
              <span style={{ fontSize: "9px" }}>{item.icon}</span>
              <span style={{ fontSize: "4px" }} className="text-slate-500">{item.label}</span>
              <span style={{ fontSize: "5px" }} className="font-bold text-slate-800">{item.val}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex -space-x-1">
            {[["A", "bg-violet-400"], ["R", "bg-emerald-400"], ["H", "bg-amber-400"]].map(([l, cls], i) => (
              <div key={i} className={`w-3.5 h-3.5 rounded-full border border-white text-white flex items-center justify-center font-bold ${cls}`} style={{ fontSize: "3.5px" }}>{l}</div>
            ))}
          </div>
          <button style={{ fontSize: "5px" }} className="text-indigo-600 font-bold flex items-center gap-0.5">
            Lihat Detail <span>›</span>
          </button>
        </div>
      </div>

      {/* ── Animated Cursor ── */}
      <div
        style={{
          position: "absolute",
          bottom: "28%",
          left: "22%",
          zIndex: 35,
          animation: "cursorClick 5s ease-in-out infinite",
          pointerEvents: "none",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="#1e293b"
          style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}
        >
          <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a1 1 0 0 1 .35-.24l6.26-1.78c.48-.13.57-.79.15-1.06L6.23 3.01a.6.6 0 0 0-.73.2z" />
        </svg>
      </div>
    </div>
  );
}
