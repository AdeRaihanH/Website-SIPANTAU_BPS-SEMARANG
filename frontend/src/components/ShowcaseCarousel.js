"use client";

import React, { useState, useEffect } from "react";

/* ==========================================================================
   CSS Keyframe Animations
   ========================================================================== */
const CAROUSEL_STYLES = `
  /* ── SLIDE 1: Dashboard Badges Slide-Out ────────────────────────────────── */
  @keyframes badge2SelesaiOut {
    0%   { transform: translate(110px, 90px) rotate(0deg); opacity: 0; }
    20%  { opacity: 1; }
    100% { transform: translate(0, 0) rotate(-6deg); opacity: 1; }
  }
  @keyframes badgeBerandaOut {
    0%   { transform: translate(-260px, 80px) rotate(0deg); opacity: 0; }
    20%  { opacity: 1; }
    100% { transform: translate(0, 0) rotate(4deg); opacity: 1; }
  }
  @keyframes badge1DiperbaruiOut {
    0%   { transform: translate(-100px, -80px) rotate(0deg); opacity: 0; }
    20%  { opacity: 1; }
    100% { transform: translate(0, 0) rotate(6deg); opacity: 1; }
  }

  /* ── SLIDE 2: Task Detail 3-Card Spread ─────────────────────────────────── */
  @keyframes slide2LeftCardSpread {
    0%, 10%   { transform: translate(90px, -45px) scale(0.9); opacity: 0; }
    30%, 75%  { transform: translate(0, 0) scale(1); opacity: 1; }
    90%, 100% { transform: translate(90px, -45px) scale(0.9); opacity: 0; }
  }
  @keyframes slide2RightCardSpread {
    0%, 10%   { transform: translate(-100px, 50px) scale(0.9); opacity: 0; }
    30%, 75%  { transform: translate(0, 0) scale(1); opacity: 1; }
    90%, 100% { transform: translate(-100px, 50px) scale(0.9); opacity: 0; }
  }
  @keyframes slide2MainCardReveal {
    0%, 5%    { opacity: 0; transform: scale(0.92); }
    22%, 80%  { opacity: 1; transform: scale(1); }
    95%, 100% { opacity: 0; transform: scale(0.92); }
  }

  /* ── SLIDE 3: Base Cards Reveal (Pengaturan & Tim UNDIP) ──────────────── */
  @keyframes slide3BaseReveal {
    0%, 5%    { opacity: 0; transform: scale(0.94); }
    20%, 85%  { opacity: 1; transform: scale(1); }
    95%, 100% { opacity: 0; transform: scale(0.94); }
  }

  /* Cursor Sequence: Bergerak presisi ke tombol 'Lihat Detail >' di card Tim lalu klik */
  @keyframes cursorClickLihatDetail {
    0%   { transform: translate(70px, 120px); opacity: 0; }
    12%  { transform: translate(70px, 120px); opacity: 1; }
    35%  { transform: translate(52px, 64px); opacity: 1; } /* Tepat di tombol 'Lihat Detail >' */
    42%  { transform: translate(52px, 64px) scale(0.75); opacity: 1; } /* CLICK ACTION */
    48%  { transform: translate(52px, 64px) scale(1); opacity: 1; }
    78%  { transform: translate(52px, 64px); opacity: 1; }
    90%  { transform: translate(70px, 120px); opacity: 0; }
    100% { transform: translate(70px, 120px); opacity: 0; }
  }

  /* Pop-up Card "Rincian Prioritas & Log Aktivitas" MUNCUL HANYA SETELAH KLIK (~42%) */
  @keyframes popupRincianPrioritasReveal {
    0%, 41%   { opacity: 0; transform: scale(0.85) translate(-15px, -15px); pointer-events: none; }
    48%, 82%  { opacity: 1; transform: scale(1) translate(0, 0); pointer-events: auto; }
    92%, 100% { opacity: 0; transform: scale(0.85) translate(-15px, -15px); pointer-events: none; }
  }

  @keyframes textSlideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const slides = [
  {
    title: "Pantau Lebih Mudah. Kelola Lebih Baik.",
    subtitle:
      "SIPANTAU memudahkan proses pemantauan kegiatan, pelaporan, dan evaluasi mahasiswa magang di BPS Kota Semarang.",
  },
  {
    title: "Kelola Tugas dengan Detail & Presisi.",
    subtitle:
      "Lihat semua informasi tugas dalam satu tampilan — jenis, prioritas, penerima, tenggat, dan riwayat aktivitas tim.",
  },
  {
    title: "Profil & Tim dalam Satu Genggaman.",
    subtitle:
      "Atur profil magang, pantau tim, dan lihat analitik performa langsung dari dashboard SIPANTAU.",
  },
];

export default function ShowcaseCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [textKey, setTextKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
      setTextKey((k) => k + 1);
    }, 6500);
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
        className="relative w-full max-w-[500px] rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 p-6 flex flex-col justify-between shadow-2xl overflow-hidden"
        style={{ minHeight: "590px", flex: 1 }}
      >
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

        {/* Dynamic Display Area */}
        <div className="relative flex-1 flex items-center justify-center w-full" style={{ minHeight: "360px" }}>
          {activeSlide === 0 && <Slide1Dashboard />}
          {activeSlide === 1 && <Slide2TaskDetail />}
          {activeSlide === 2 && <Slide3SettingsProfile />}
        </div>

        {/* Bottom Text & Pagination */}
        <div className="relative z-10 text-center text-white mt-4" key={textKey}>
          <h3
            className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2"
            style={{ animation: "textSlideUp 0.4s ease-out both" }}
          >
            {slides[activeSlide].title}
          </h3>
          <p
            className="text-xs sm:text-sm text-indigo-100/90 max-w-sm mx-auto leading-relaxed"
            style={{ animation: "textSlideUp 0.4s ease-out 0.1s both" }}
          >
            {slides[activeSlide].subtitle}
          </p>

          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === activeSlide ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
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
   SLIDE 1 — DASHBOARD
   ========================================================================== */
function Slide1Dashboard() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <div className="w-[88%] max-w-[380px] aspect-[16/10] rounded-2xl bg-white border border-slate-100 shadow-2xl overflow-hidden flex flex-col z-10">
        <div className="h-4 border-b border-slate-100 bg-slate-50 flex items-center px-3 gap-1 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
        </div>

        <div className="flex flex-1 min-h-0">
          <div className="w-[64px] border-r border-slate-100 bg-slate-50/60 p-1.5 flex flex-col justify-between flex-shrink-0">
            <div className="space-y-2">
              <div className="w-5 h-5 rounded-full bg-slate-200 mx-auto mb-2 flex items-center justify-center">
                <span className="text-[8px]">👤</span>
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-100 rounded px-1 py-0.5 shadow-sm">
                <span className="text-[6px]">🏠</span>
                <span className="text-[5px] font-bold text-slate-800">Beranda</span>
              </div>
              <div className="flex items-center gap-1 px-1 py-0.5 text-slate-400">
                <span className="text-[6px]">👥</span>
                <span className="text-[5px]">Team</span>
              </div>
            </div>
            <div className="space-y-1 text-slate-400 text-[4px]">
              <div>⚙️ Pengaturan</div>
              <div>🚪 Keluar</div>
            </div>
          </div>

          <div className="flex-1 p-2 flex flex-col justify-between min-h-0">
            <div>
              <div className="text-[8px] font-bold text-slate-800">Beranda</div>
              <div className="text-[5px] text-slate-400">Selamat datang kembali Andi!</div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-2 text-white my-1">
              <div className="text-[7px] font-bold mb-0.5">Selamat Pagi, Andi!</div>
              <div className="text-[4px] text-indigo-100 leading-tight mb-1">
                &quot;Tanpa data, Anda hanyalah orang lain dengan pendapat.&quot; Mari bantu BPS menyediakan data berkualitas.
              </div>
              <span className="px-1.5 py-0.5 rounded bg-white text-indigo-600 text-[4.5px] font-bold inline-block">
                Lihat Tugas Hari Ini →
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1">
              {[
                { icon: "✓", label: "2 Selesai", color: "text-emerald-500" },
                { icon: "📄", label: "4 Dijadwalkan", color: "text-blue-500" },
                { icon: "🔄", label: "1 Diperbarui", color: "text-amber-500" },
                { icon: "⚠️", label: "1 Terlambat", color: "text-rose-500" },
              ].map((item, i) => (
                <div key={i} className="p-1 border border-slate-100 bg-white rounded flex flex-col items-start">
                  <span className={`text-[6px] font-bold ${item.color}`}>{item.icon}</span>
                  <span className="text-[4px] font-bold text-slate-700">{item.label}</span>
                  <span className="text-[3px] text-slate-400">Status terkait</span>
                </div>
              ))}
            </div>

            <div className="text-right mt-1">
              <span className="text-[4.5px] font-bold text-indigo-600">Lihat Tim Sekarang →</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute top-[8%] left-[-8px] bg-white rounded-xl p-2.5 shadow-2xl border border-slate-100 flex items-center gap-2 z-20"
        style={{
          width: "145px",
          animation: "badge2SelesaiOut 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both",
        }}
      >
        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 font-bold text-xs flex-shrink-0">
          ✓
        </div>
        <div>
          <div className="text-[8px] font-extrabold text-slate-800">2 Selesai</div>
          <div className="text-[5.5px] text-slate-400">Tugas yang sudah terselesaikan.</div>
        </div>
      </div>

      <div
        className="absolute top-[3%] right-[30px] bg-white rounded-lg px-2.5 py-1.5 shadow-xl border border-slate-100 flex items-center gap-1.5 z-20"
        style={{
          animation: "badgeBerandaOut 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both",
        }}
      >
        <span className="text-[9px]">🏠</span>
        <span className="text-[7.5px] font-bold text-slate-700">Beranda</span>
      </div>

      <div
        className="absolute bottom-[5%] right-[-10px] bg-white rounded-xl p-2.5 shadow-2xl border border-slate-100 flex items-center gap-2 z-20"
        style={{
          width: "145px",
          animation: "badge1DiperbaruiOut 1.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s both",
        }}
      >
        <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 font-bold text-xs flex-shrink-0">
          🔄
        </div>
        <div>
          <div className="text-[8px] font-extrabold text-slate-800">1 Diperbarui</div>
          <div className="text-[5.5px] text-slate-400">Perubahan dalam penugasan.</div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 2 — TASK DETAIL
   ========================================================================== */
function Slide2TaskDetail() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: "330px" }}>
      <div
        className="absolute bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 z-10"
        style={{
          width: "260px",
          top: "30px",
          animation: "slide2MainCardReveal 6.5s ease-in-out infinite",
        }}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
            Pembuatan UI/UX Website
          </h4>
          <span className="text-slate-400 font-bold text-sm">···</span>
        </div>
        <p className="text-[9px] text-slate-500 leading-snug mb-4">
          Membuat tampilan antarmuka website Kanban
        </p>

        <div className="flex gap-2.5 mb-5">
          <span className="px-3 py-1.5 rounded-lg bg-indigo-100 text-indigo-700 font-extrabold text-[10px] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" />
            Tugas
          </span>
          <span className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-600 font-extrabold text-[10px] flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            Tertinggi
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">👤</div>
            <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">👤</div>
            <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-700">+</div>
          </div>
          <span className="text-[8px] text-slate-400 font-semibold">📅 1 Jul 2026</span>
        </div>
      </div>

      <div
        className="absolute bg-white rounded-2xl p-3.5 shadow-2xl border border-slate-100 z-20"
        style={{
          width: "125px",
          left: "12px",
          bottom: "15px",
          animation: "slide2LeftCardSpread 6.5s ease-in-out infinite",
        }}
      >
        <div className="space-y-2.5">
          <div>
            <div className="text-[6.5px] font-bold text-slate-800 mb-1">Jenis Tugas</div>
            <div className="flex items-center justify-between border border-slate-200 rounded px-1.5 py-1 text-[6.5px] font-bold text-indigo-600 bg-indigo-50/50">
              <span>■ Design</span>
              <span className="text-slate-400">▾</span>
            </div>
          </div>
          <div>
            <div className="text-[6.5px] font-bold text-slate-800 mb-1">Prioritas Tugas</div>
            <div className="flex items-center justify-between border border-slate-200 rounded px-1.5 py-1 text-[6.5px] font-bold text-rose-600 bg-rose-50/50">
              <span>● Tertinggi</span>
              <span className="text-slate-400">▾</span>
            </div>
          </div>
          <div>
            <div className="text-[6.5px] font-bold text-slate-800 mb-1">Penerima Tugas</div>
            <div className="flex -space-x-1">
              <div className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[4px] font-bold flex items-center justify-center border border-white">AB</div>
              <div className="w-4 h-4 rounded-full bg-purple-500 text-white text-[4px] font-bold flex items-center justify-center border border-white">MA</div>
              <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[4px] font-bold flex items-center justify-center border border-white">+</div>
            </div>
          </div>
          <div>
            <div className="text-[6.5px] font-bold text-slate-800 mb-0.5">Tenggat Tugas</div>
            <div className="text-[6px] text-slate-500 font-medium">📅 4 Juli 2026</div>
          </div>
        </div>
      </div>

      <div
        className="absolute bg-white rounded-2xl p-3.5 shadow-2xl border border-slate-100 z-20"
        style={{
          width: "150px",
          right: "10px",
          top: "10px",
          animation: "slide2RightCardSpread 6.5s ease-in-out infinite",
        }}
      >
        <div className="text-[7.5px] font-bold text-slate-800 mb-1.5">Riwayat</div>
        <div className="space-y-1.5 pb-2 mb-2 border-b border-slate-100 text-[5.5px]">
          <div>
            <span className="font-bold text-slate-800">Andi Basudara</span>
            <span className="text-slate-500"> telah membuat penugasan </span>
            <span className="text-indigo-600 font-bold underline">Pembuatan UI/UX Website</span>
          </div>
          <div>
            <span className="font-bold text-slate-800">Miyesha Azka</span>
            <span className="text-slate-500"> telah mengubah penerima tugas.</span>
          </div>
        </div>
        <div className="text-[7.5px] font-bold text-slate-800 mb-1">Komentar</div>
        <div className="text-[5.5px]">
          <span className="font-bold text-slate-800">Nurul Kumala</span>
          <p className="text-slate-400">Semangat!!!</p>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   SLIDE 3 — SETTINGS & PROFIL
   Awalnya HANYA Card Pengaturan & Card Tim Teknologi.
   Popup Card Rincian Prioritas BARU MUNCUL setelah Kursor Klik 'Lihat Detail >'.
   ========================================================================== */
function Slide3SettingsProfile() {
  return (
    <div className="relative w-full flex items-center justify-center" style={{ minHeight: "340px" }}>
      
      <div className="relative w-[92%] max-w-[420px] h-[280px] flex items-start justify-center">

        {/* ── LAPISAN 1 (Awal - Belakang Kiri): Card Pengaturan Profil ── */}
        <div
          className="absolute bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-10 flex flex-col"
          style={{
            left: "10px",
            top: "10px",
            width: "220px",
            animation: "slide3BaseReveal 6.5s ease-in-out infinite",
          }}
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2.5 text-white">
            <div className="text-[9px] font-extrabold mb-0.5">Pengaturan</div>
            <div className="text-[5.5px] text-indigo-100">Simpan perubahan profil Anda.</div>
          </div>

          <div className="p-3 bg-white flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow">
                  👤
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-slate-800 border border-white flex items-center justify-center">
                  <span className="text-[5px] text-white">📷</span>
                </div>
              </div>
              <div>
                <div className="text-[8.5px] font-extrabold text-slate-800">Andi Basudara</div>
                <div className="text-[6px] text-slate-400">Pemagang</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="text-[5px] font-bold text-slate-400 uppercase tracking-wide">Detail Profil</div>
              <div className="border border-slate-100 rounded-lg p-1 text-[5.5px] text-slate-600 flex items-center gap-1 bg-slate-50/40">
                <span>👤</span> <span>Nama: Andi Basudara</span>
              </div>
              <div className="border border-slate-100 rounded-lg p-1 text-[5.5px] text-slate-600 flex items-center gap-1 bg-slate-50/40">
                <span>✉️</span> <span>Email: andi@bps.go.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── LAPISAN 2 (Awal - Menempel & Menumpuk di Tengah): Card Tim Teknologi Informasi UNDIP ── */}
        <div
          className="absolute bg-white rounded-2xl p-3.5 shadow-2xl border border-slate-100 z-20"
          style={{
            left: "85px",
            top: "95px",
            width: "245px",
            animation: "slide3BaseReveal 6.5s ease-in-out infinite",
          }}
        >
          <div className="text-[9.5px] font-extrabold text-slate-800 mb-1">
            Tim Teknologi Informasi UNDIP
          </div>
          <div className="text-[5.5px] text-slate-400 mb-2 leading-snug">
            Bertanggung jawab atas pengembangan aplikasi monitoring dan maintenance jaringan.
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="border border-slate-100 rounded-xl p-1.5 flex items-center gap-1.5 bg-slate-50/50">
              <span className="text-[11px]">📋</span>
              <div>
                <div className="text-[4.5px] text-slate-400">Mentor</div>
                <div className="text-[7px] font-bold text-slate-800">Bambang Heru</div>
              </div>
            </div>

            <div className="border border-indigo-100 rounded-xl p-1.5 flex items-center gap-1.5 bg-indigo-50/60 shadow-sm">
              <span className="text-[11px]">☑️</span>
              <div>
                <div className="text-[4.5px] text-indigo-600 font-bold">Tugas Aktif</div>
                <div className="text-[7px] font-bold text-slate-800">5 Tugas</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex -space-x-1.5">
              <div className="w-4.5 h-4.5 rounded-full bg-purple-500 text-white font-bold text-[4.5px] flex items-center justify-center border-2 border-white shadow-sm">AB</div>
              <div className="w-4.5 h-4.5 rounded-full bg-indigo-500 text-white font-bold text-[4.5px] flex items-center justify-center border-2 border-white shadow-sm">MA</div>
              <div className="w-4.5 h-4.5 rounded-full bg-emerald-500 text-white font-bold text-[4.5px] flex items-center justify-center border-2 border-white shadow-sm">NK</div>
            </div>

            <button className="text-[7px] font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100">
              Lihat Detail ›
            </button>
          </div>
        </div>

        {/* ── LAPISAN POP-UP (MUNCUL HANYA SETELAH KLIK KURSOR DI CARD TIM): Card Rincian Prioritas & Log Aktivitas ── */}
        <div
          className="absolute bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-indigo-100 z-30 flex flex-col justify-between"
          style={{
            left: "190px",
            top: "25px",
            width: "215px",
            animation: "popupRincianPrioritasReveal 6.5s ease-in-out infinite",
          }}
        >
          <div className="mb-2.5">
            <div className="text-[8px] font-extrabold text-slate-800 mb-0.5">Rincian Prioritas</div>
            <div className="text-[4.5px] text-slate-400 mb-1.5">Rincian banyak item pekerjaan berdasarkan prioritasnya.</div>
            
            <div className="flex items-end justify-between h-9 px-1 pt-1 border-b border-slate-100">
              <div className="w-2 bg-rose-400 h-[60%] rounded-t" />
              <div className="w-2 bg-rose-200 h-[30%] rounded-t" />
              <div className="w-2 bg-amber-400 h-[90%] rounded-t" />
              <div className="w-2 bg-indigo-300 h-[40%] rounded-t" />
              <div className="w-2 bg-indigo-500 h-[70%] rounded-t" />
            </div>
          </div>

          <div className="pt-1.5 border-t border-slate-100">
            <div className="text-[7px] font-bold text-slate-800 mb-1">Log Aktivitas</div>
            <div className="space-y-1 text-[4.5px]">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block" />
                <span className="text-indigo-600 font-semibold underline">Pembuatan UI/UX Website</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-600">Pembuatan Repo GitHub</span>
              </div>
            </div>
          </div>
        </div>

        {/* Smooth Cursor Animation: Jalan ke 'Lihat Detail >' pada Card Tim di Tengah → Klik → Pop-up MUNCUL */}
        <div
          className="absolute z-40 pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            animation: "cursorClickLihatDetail 6.5s ease-in-out infinite",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#000000" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))" }}>
            <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a1 1 0 0 1 .35-.24l6.26-1.78c.48-.13.57-.79.15-1.06L6.23 3.01a.6.6 0 0 0-.73.2z" />
          </svg>
        </div>

      </div>

    </div>
  );
}
