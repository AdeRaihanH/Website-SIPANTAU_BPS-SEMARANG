"use client";

import React, { useState, useEffect } from "react";

/* ==========================================================================
   CSS Keyframe Animations for Showcase Carousel
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
    35%  { transform: translate(95px, 58px); opacity: 1; } /* Tepat di tombol 'Lihat Detail >' */
    42%  { transform: translate(95px, 58px) scale(0.75); opacity: 1; } /* CLICK ACTION */
    48%  { transform: translate(95px, 58px) scale(1); opacity: 1; }
    78%  { transform: translate(95px, 58px); opacity: 1; }
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

export default function ShowcaseCarousel({ onSelectSignUp, onSelectSignIn, isMobileFullScreen = false }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [textKey, setTextKey] = useState(0);

  // Touch Swipe Gesture State
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 40) {
      // Swipe left -> Next slide
      setActiveSlide((prev) => (prev + 1) % slides.length);
      setTextKey((k) => k + 1);
    } else if (distance < -40) {
      // Swipe right -> Prev slide
      setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setTextKey((k) => k + 1);
    }
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CAROUSEL_STYLES }} />
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative w-full flex-1 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 select-none touch-pan-y ${
          isMobileFullScreen
            ? "min-h-screen h-screen rounded-none p-6 sm:p-8 shadow-none border-none"
            : "max-w-[550px] min-h-[460px] md:min-h-[650px] md:h-[650px] rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-indigo-200 transform scale-95 md:scale-100 origin-top"
        }`}
      >

        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        {/* Dynamic Display Area */}
        <div className="relative flex-1 flex items-center justify-center w-full min-h-[340px]">
          {activeSlide === 0 && <Slide1Dashboard />}
          {activeSlide === 1 && <Slide2TaskDetail />}
          {activeSlide === 2 && <Slide3SettingsProfile />}
        </div>

        {/* Bottom Text, Pagination & Mobile Actions */}
        <div className="relative z-10 text-center text-white mt-4" key={textKey}>
          <h3
            className="text-xl sm:text-2xl font-extrabold tracking-tight mb-2 min-h-[32px]"
            style={{ animation: "textSlideUp 0.4s ease-out both" }}
          >
            {slides[activeSlide].title}
          </h3>
          <p
            className="text-xs sm:text-sm text-indigo-100/90 max-w-sm mx-auto leading-relaxed min-h-[44px]"
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

          {/* Action Buttons for Mobile Onboarding View */}
          {onSelectSignUp && onSelectSignIn && (
            <div className="flex md:hidden flex-col gap-2.5 mt-5 w-full max-w-xs mx-auto z-20">
              <button
                type="button"
                onClick={onSelectSignUp}
                className="w-full bg-white hover:bg-slate-50 active:bg-slate-100 text-violet-700 font-extrabold py-3 px-6 rounded-full text-xs shadow-lg transition-all cursor-pointer transform active:scale-95"
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={onSelectSignIn}
                className="w-full bg-white/20 hover:bg-white/30 active:bg-white/40 text-white font-bold py-3 px-6 rounded-full text-xs border border-white/40 backdrop-blur-sm transition-all cursor-pointer transform active:scale-95"
              >
                Login
              </button>
            </div>
          )}
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
                <svg className="w-2.5 h-2.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex items-center gap-1 bg-white border border-slate-100 rounded px-1 py-0.5 shadow-sm">
                <svg className="w-2 h-2 text-violet-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-[5px] font-bold text-slate-800">Beranda</span>
              </div>
              <div className="flex items-center gap-1 px-1 py-0.5 text-slate-400">
                <svg className="w-2 h-2 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-[5px]">Team</span>
              </div>
            </div>
            <div className="space-y-1 text-slate-400 text-[4px]">
              <div className="flex items-center gap-0.5">
                <svg className="w-1.5 h-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pengaturan
              </div>
              <div className="flex items-center gap-0.5">
                <svg className="w-1.5 h-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
              </div>
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
                { 
                  icon: (
                    <svg className="w-2 h-2 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ), 
                  label: "2 Selesai" 
                },
                { 
                  icon: (
                    <svg className="w-2 h-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  ), 
                  label: "4 Dijadwalkan" 
                },
                { 
                  icon: (
                    <svg className="w-2 h-2 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ), 
                  label: "1 Diperbarui" 
                },
                { 
                  icon: (
                    <svg className="w-2 h-2 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ), 
                  label: "1 Terlambat" 
                },
              ].map((item, i) => (
                <div key={i} className="p-1 border border-slate-100 bg-white rounded flex flex-col items-start">
                  {item.icon}
                  <span className="text-[4px] font-bold text-slate-700 mt-0.5">{item.label}</span>
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
          <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
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
        <svg className="w-3 h-3 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
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
          <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
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
            <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow-sm">AB</div>
            <div className="w-6 h-6 rounded-full bg-purple-500 border-2 border-white flex items-center justify-center text-[7px] font-bold text-white shadow-sm">MA</div>
            <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">+</div>
          </div>
          <span className="text-[8px] text-slate-400 font-semibold flex items-center gap-1">
            <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
          </span>
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
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-violet-500 rounded-sm" />
                Design
              </span>
              <span className="text-slate-400">▾</span>
            </div>
          </div>
          <div>
            <div className="text-[6.5px] font-bold text-slate-800 mb-1">Prioritas Tugas</div>
            <div className="flex items-center justify-between border border-slate-200 rounded px-1.5 py-1 text-[6.5px] font-bold text-rose-600 bg-rose-50/50">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                Tertinggi
              </span>
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
            <div className="text-[6px] text-slate-500 font-medium flex items-center gap-1">
              <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(Date.now() + 3 * 86400000).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </div>
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
   ========================================================================== */
function Slide3SettingsProfile() {
  return (
    <div className="relative w-full flex items-center justify-center overflow-visible" style={{ minHeight: "340px" }}>
      <div className="relative w-[410px] h-[280px] shrink-0 origin-center transform scale-[0.75] sm:scale-95 md:scale-100 flex items-start justify-center">

        {/* LAPISAN 1: Card Pengaturan Profil */}
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
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold border-2 border-white shadow">
                  AB
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-slate-800 border border-white flex items-center justify-center">
                  <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-[8.5px] font-extrabold text-slate-800">Andi Basudara</div>
                <div className="text-[6px] text-slate-400">Pemagang</div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1">
              <div className="text-[5px] font-bold text-slate-400 uppercase tracking-wide">Detail Profil</div>
              <div className="border border-slate-100 rounded-lg p-1 text-[5.5px] text-slate-600 flex items-center gap-1.5 bg-slate-50/40">
                <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Nama: Andi Basudara</span>
              </div>
              <div className="border border-slate-100 rounded-lg p-1 text-[5.5px] text-slate-600 flex items-center gap-1.5 bg-slate-50/40">
                <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email: andi@bps.go.id</span>
              </div>
            </div>
          </div>
        </div>

        {/* LAPISAN 2: Card Tim Teknologi Informasi UNDIP */}
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
              <svg className="w-3 h-3 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              <div>
                <div className="text-[4.5px] text-slate-400">Mentor</div>
                <div className="text-[7px] font-bold text-slate-800">Bambang Heru</div>
              </div>
            </div>

            <div className="border border-indigo-100 rounded-xl p-1.5 flex items-center gap-1.5 bg-indigo-50/60 shadow-sm">
              <svg className="w-3 h-3 text-indigo-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
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

        {/* LAPISAN POP-UP: Card Rincian Prioritas & Log Aktivitas */}
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

        {/* Cursor Animation */}
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
