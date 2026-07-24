"use client";

import React, { useState, useEffect } from "react";

const slides = [
  {
    title: "Pantau Lebih Mudah. Kelola Lebih Baik.",
    subtitle:
      "SIPANTAU memudahkan proses pemantauan kegiatan, pelaporan, dan evaluasi mahasiswa magang di BPS Kota Semarang.",
    type: "dashboard",
  },
  {
    title: "Pantau Lebih Mudah. Kelola Lebih Baik.",
    subtitle:
      "SIPANTAU memudahkan proses pemantauan kegiatan, pelaporan, dan evaluasi mahasiswa magang di BPS Kota Semarang.",
    type: "analytics",
  },
  {
    title: "Pantau Lebih Mudah. Kelola Lebih Baik.",
    subtitle:
      "SIPANTAU memudahkan proses pemantauan kegiatan, pelaporan, dan evaluasi mahasiswa magang di BPS Kota Semarang.",
    type: "kanban",
  },
];

export default function ShowcaseCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto-rotation of slides
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Rotate every 6 seconds
    return () => clearInterval(interval);
  }, []);

  return (
<<<<<<< Updated upstream
    <div className="relative w-full max-w-[550px] flex-1 min-h-[550px] rounded-[2.5rem] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-8 flex flex-col justify-between overflow-hidden shadow-2xl shadow-indigo-200">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/20 rounded-full blur-3xl -ml-16 -mb-16" />
=======
    <>
      <style dangerouslySetInnerHTML={{ __html: CAROUSEL_STYLES }} />
      <div
        className="relative w-full max-w-[550px] flex-1 min-h-[650px] h-[650px] rounded-[2.5rem] bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-700 p-8 flex flex-col justify-between overflow-hidden shadow-2xl shadow-indigo-200"
      >



        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-300/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
>>>>>>> Stashed changes

      {/* Slide Illustration Preview */}
      <div className="relative flex-1 flex items-center justify-center min-h-[300px] w-full">
        {activeSlide === 0 && <DashboardMockup />}
        {activeSlide === 1 && <AnalyticsMockup />}
        {activeSlide === 2 && <KanbanMockup />}
      </div>

      {/* Slide Text Content & Indicators */}
      <div className="relative z-10 text-center text-white mt-4">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-2 min-h-[32px] transition-all duration-300">
          Pantau Lebih Mudah. Kelola Lebih Baik.
        </h3>
        <p className="text-xs sm:text-sm text-indigo-100/90 max-w-md mx-auto min-h-[50px] transition-all duration-300">
          SIPANTAU memudahkan proses pemantauan kegiatan, pelaporan, dan evaluasi mahasiswa magang di BPS Kota Semarang.
        </p>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${index === activeSlide ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Slide 1 Mockup: Main Dashboard View
   ========================================================================== */
function DashboardMockup() {
  return (
    <div className="relative w-[90%] max-w-[420px] aspect-[4/3] rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden flex flex-col">
      {/* Top Header Bar */}
      <div className="h-6 border-b border-slate-100 bg-slate-50 flex items-center px-3 gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar Mockup */}
        <div className="w-[70px] border-r border-slate-100 bg-slate-50/50 p-1.5 flex flex-col justify-between">
          <div className="space-y-2">
            {/* User Avatar */}
            <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mx-auto mb-3">
              <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            {/* Menu */}
            <div className="space-y-1">
              <div className="flex items-center gap-1 bg-white border border-slate-100 rounded px-1 py-0.5 shadow-sm">
                <span className="text-[6px]">🏠</span>
                <span className="text-[5px] font-bold text-slate-800">Beranda</span>
              </div>
              <div className="flex items-center gap-1 px-1 py-0.5 text-slate-400">
                <span className="text-[6px]">👥</span>
                <span className="text-[5px] font-medium">Team</span>
              </div>
            </div>
          </div>

          {/* Bottom Menu */}
          <div className="space-y-1">
            <div className="flex items-center gap-1 px-1 py-0.5 text-slate-400">
              <span className="text-[6px]">⚙️</span>
              <span className="text-[5px] font-medium">Pengaturan</span>
            </div>
            <div className="flex items-center gap-1 px-1 py-0.5 text-slate-400">
              <span className="text-[6px]">🚪</span>
              <span className="text-[5px] font-medium">Keluar</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-2.5 flex flex-col gap-2 min-h-0 overflow-hidden">
          {/* Header */}
          <div>
            <div className="text-[9px] font-bold text-slate-800">Beranda</div>
            <div className="text-[5.5px] text-slate-400 leading-none">Selamat datang kembali Andi!</div>
          </div>

          {/* Welcome Banner Card */}
          <div className="rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 p-2 text-white flex flex-col gap-0.5">
            <div className="text-[8px] font-bold">Selamat Pagi, Andi!</div>
            <div className="text-[5px] text-indigo-100 leading-tight">
              "Tanpa data, Anda hanyalah orang lain dengan pendapat." Mari bantu BPS menyediakan data berkualitas untuk Indonesia hari ini.
            </div>
            <button className="self-start mt-1 px-1.5 py-0.5 rounded bg-white text-indigo-600 text-[4px] font-bold flex items-center gap-0.5">
              Lihat Tugas Hari Ini <span className="text-[4px]">→</span>
            </button>
          </div>

          {/* Stats Grid - Horizontal 4 Columns */}
          <div className="grid grid-cols-4 gap-1">
            {/* Card 1: 2 Selesai */}
            <div className="p-1 border border-slate-100 bg-white rounded-md shadow-sm flex flex-col justify-between min-h-[36px]">
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full border border-emerald-500 flex items-center justify-center text-[5px] text-emerald-500 font-bold">✓</div>
                <span className="text-[6px] font-bold text-slate-800">2 Selesai</span>
              </div>
              <span className="text-[3.8px] text-slate-400 leading-none">Tugas yang sudah terselesaikan.</span>
            </div>
            {/* Card 2: 4 Dijadwalkan */}
            <div className="p-1 border border-slate-100 bg-white rounded-md shadow-sm flex flex-col justify-between min-h-[36px]">
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full border border-blue-500 flex items-center justify-center text-[5px] text-blue-500 font-bold">📄</div>
                <span className="text-[6px] font-bold text-slate-800">4 Dijadwalkan</span>
              </div>
              <span className="text-[3.8px] text-slate-400 leading-none">Tugas yang segera dimulai.</span>
            </div>
            {/* Card 3: 1 Diperbarui */}
            <div className="p-1 border border-slate-100 bg-white rounded-md shadow-sm flex flex-col justify-between min-h-[36px]">
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full border border-amber-500 flex items-center justify-center text-[5px] text-amber-500 font-bold">🔄</div>
                <span className="text-[6px] font-bold text-slate-800">1 Diperbarui</span>
              </div>
              <span className="text-[3.8px] text-slate-400 leading-none">Perubahan dalam penugasan.</span>
            </div>
            {/* Card 4: 1 Terlambat */}
            <div className="p-1 border border-slate-100 bg-white rounded-md shadow-sm flex flex-col justify-between min-h-[36px]">
              <div className="flex items-center gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full border border-rose-500 flex items-center justify-center text-[5px] text-rose-500 font-bold">⚠️</div>
                <span className="text-[6px] font-bold text-slate-800">1 Terlambat</span>
              </div>
              <span className="text-[3.8px] text-slate-400 leading-none">Penugasan melewati batas waktu.</span>
            </div>
          </div>

          {/* Bottom link */}
          <div className="flex justify-end">
            <span className="text-[5px] font-bold text-indigo-600 hover:underline cursor-pointer">Lihat Tim Sekarang →</span>
          </div>
        </div>
      </div>

      {/* Floating Badges */}
      {/* 2 Selesai Widget */}
      <div className="absolute top-[20%] -left-6 bg-white border border-slate-100/80 rounded-xl p-1.5 flex items-center gap-1.5 shadow-lg animate-float-up z-20">
        <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[8px] text-emerald-600">
          ✓
        </div>
        <div>
          <div className="text-[7px] font-bold text-slate-800">2 Selesai</div>
          <div className="text-[4.5px] text-slate-400">Tugas yang sudah terselesaikan.</div>
        </div>
      </div>

      {/* Beranda Button with Cursor */}
      <div className="absolute top-[12%] right-[10%] bg-white border border-slate-100/80 rounded-lg py-1 px-2 flex items-center gap-1 shadow-md animate-float-slow z-20">
        <span className="text-[6px]">🏠</span>
        <span className="text-[6px] font-bold text-slate-700">Beranda</span>
        {/* Black Cursor Pointer */}
        <div className="absolute -bottom-1 -right-1 text-slate-800">
          <svg className="w-2.5 h-2.5 transform rotate-[25deg]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 4l11.733 11.733-3.733 1.067 2.667 5.333-1.6 0.8-2.667-5.333-3.733 3.733z" />
          </svg>
        </div>
      </div>

      {/* 1 Diperbarui Widget */}
      <div className="absolute bottom-[22%] -right-6 bg-white border border-slate-100/80 rounded-xl p-1.5 flex items-center gap-1.5 shadow-lg animate-float-down z-20">
        <div className="w-4 h-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-[8px] text-amber-600">
          🔄
        </div>
        <div>
          <div className="text-[7px] font-bold text-slate-800">1 Diperbarui</div>
          <div className="text-[4.5px] text-slate-400">Perubahan dalam penugasan.</div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Slide 2 Mockup: Analytics & Performance Preview
   ========================================================================== */
function AnalyticsMockup() {
  return (
    <div className="relative w-[90%] max-w-[420px] aspect-[4/3] rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden flex flex-col">
      {/* Top Header Bar */}
      <div className="h-6 border-b border-slate-100 bg-slate-50 flex items-center px-3 gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Mini Sidebar */}
        <div className="w-16 border-r border-slate-100 bg-slate-50 p-2 flex flex-col gap-2">
          <div className="h-4 w-8 bg-indigo-100 rounded" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-slate-300" />
              <div className="h-1.5 w-6 bg-slate-300 rounded" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-indigo-600" />
              <div className="h-1.5 w-6 bg-slate-300 rounded" />
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-3 flex flex-col gap-2.5 min-h-0 overflow-hidden">
          {/* Header */}
          <div>
            <div className="text-[10px] font-bold text-slate-800">Evaluasi</div>
            <div className="text-[6px] text-slate-400">Statistik aktivitas magang Anda</div>
          </div>

          {/* Bar Chart Mockup */}
          <div className="flex-1 border border-slate-100 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
              <span className="text-[7px] font-bold text-slate-700">Aktivitas Mingguan</span>
              <span className="text-[5px] text-slate-400">Update 5 mnt lalu</span>
            </div>

            <div className="flex-1 flex items-end justify-between px-2 pt-3 pb-1 gap-2">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-200 rounded-t h-[40%]" />
                <span className="text-[4px] text-slate-400">Sen</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-200 rounded-t h-[65%]" />
                <span className="text-[4px] text-slate-400">Sel</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-600 rounded-t h-[90%] shadow-sm shadow-indigo-100" />
                <span className="text-[4px] text-indigo-600 font-bold">Rab</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-200 rounded-t h-[50%]" />
                <span className="text-[4px] text-slate-400">Kam</span>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-indigo-200 rounded-t h-[75%]" />
                <span className="text-[4px] text-slate-400">Jum</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Badges */}
      {/* Performance Score */}
      <div className="absolute top-[20%] -left-6 bg-white border border-indigo-100 rounded-xl p-2 flex items-center gap-2 shadow-lg animate-float-up">
        <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[8px] font-extrabold text-indigo-600">
          A
        </div>
        <div>
          <div className="text-[7.5px] font-bold text-slate-800">Nilai Rata-rata</div>
          <div className="text-[5px] text-slate-400">Sangat Memuaskan</div>
        </div>
      </div>

      {/* Analytics Widget */}
      <div className="absolute bottom-[20%] -right-6 bg-white border border-indigo-100 rounded-xl p-2 flex items-center gap-2 shadow-lg animate-float-down">
        <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-xs">
          📈
        </div>
        <div>
          <div className="text-[8px] font-bold text-slate-800">89% Selesai</div>
          <div className="text-[5px] text-slate-400">Rasio penyelesaian tugas</div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   Slide 3 Mockup: Kanban Board View
   ========================================================================== */
function KanbanMockup() {
  return (
    <div className="relative w-[90%] max-w-[420px] aspect-[4/3] rounded-2xl bg-white border border-slate-100 shadow-xl overflow-hidden flex flex-col">
      {/* Top Header Bar */}
      <div className="h-6 border-b border-slate-100 bg-slate-50 flex items-center px-3 gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
      </div>

      <div className="flex flex-1 p-2.5 gap-2 min-h-0 bg-slate-50/50">
        {/* Kanban Task Card Detailed */}
        <div className="flex-1 bg-white border border-slate-100 rounded-xl p-2 flex flex-col justify-between shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="px-1 py-0.5 rounded text-[5px] font-bold bg-indigo-50 text-indigo-700">Tugas</span>
              <span className="px-1 py-0.5 rounded text-[5px] font-bold bg-rose-50 text-rose-700">Tertinggi</span>
            </div>

            <h4 className="text-[8.5px] font-extrabold text-slate-800 leading-tight">Pembuatan UI/UX Website</h4>
            <p className="text-[6px] text-slate-400 leading-tight">Membuat tampilan antarmuka website Kanban</p>
          </div>

          <div className="flex items-center justify-between mt-3 pt-1.5 border-t border-slate-50">
            <span className="text-[5px] text-slate-400">1 Jul 2026</span>
            <div className="flex -space-x-1.5">
              <div className="w-3.5 h-3.5 rounded-full bg-violet-400 border border-white text-[4px] text-white font-bold flex items-center justify-center">A</div>
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-white text-[4px] text-white font-bold flex items-center justify-center">R</div>
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-white text-[4px] text-white font-bold flex items-center justify-center">H</div>
              <div className="w-3.5 h-3.5 rounded-full bg-slate-100 border border-white text-[4px] text-slate-500 font-bold flex items-center justify-center">+</div>
            </div>
          </div>
        </div>

        {/* Task Details Side Card */}
        <div className="w-[100px] bg-white border border-slate-100 rounded-xl p-2 flex flex-col justify-between shadow-sm gap-2">
          <div className="space-y-1.5">
            <div>
              <div className="text-[4.5px] text-slate-400">Jenis Tugas</div>
              <span className="inline-block mt-0.5 px-1 py-0.5 rounded text-[5.5px] font-bold bg-indigo-50 text-indigo-700">Design</span>
            </div>
            <div>
              <div className="text-[4.5px] text-slate-400">Prioritas Tugas</div>
              <span className="inline-block mt-0.5 px-1 py-0.5 rounded text-[5.5px] font-bold bg-rose-50 text-rose-700">Tertinggi</span>
            </div>
            <div>
              <div className="text-[4.5px] text-slate-400">Penerima Tugas</div>
              <div className="flex -space-x-1 mt-0.5">
                <div className="w-3 h-3 rounded-full bg-violet-400 border border-white text-[3.5px] text-white font-bold flex items-center justify-center">A</div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 border border-white text-[3.5px] text-white font-bold flex items-center justify-center">R</div>
                <div className="w-3 h-3 rounded-full bg-amber-400 border border-white text-[3.5px] text-white font-bold flex items-center justify-center">H</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-1.5">
            <div className="text-[4.5px] text-slate-400">Tenggat Tugas</div>
            <div className="text-[5.5px] font-bold text-slate-800 mt-0.5">4 Jul 2026</div>
          </div>
        </div>
      </div>

      {/* Floating Chat/Comments Panel */}
      <div className="absolute bottom-[5%] left-[10%] right-[10%] bg-white/95 backdrop-blur border border-indigo-50 rounded-xl p-2 shadow-lg flex flex-col gap-1.5 animate-float-down">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
          <span className="text-[6.5px] font-bold text-slate-800">Diskusi Tugas</span>
          <span className="text-[5px] text-slate-400">3 komentar</span>
        </div>

        <div className="space-y-1">
          {/* Comment 1 */}
          <div className="flex items-start gap-1">
            <div className="w-3 h-3 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[4px]">A</div>
            <div>
              <div className="text-[5.5px] font-bold text-slate-700">Andi Basudara</div>
              <div className="text-[5px] text-slate-500 leading-tight">Saya sudah menyelesaikan tugas...</div>
            </div>
          </div>
          {/* Comment 2 */}
          <div className="flex items-start gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-[4px]">R</div>
            <div>
              <div className="text-[5.5px] font-bold text-slate-700">Riyadi</div>
              <div className="text-[5px] text-slate-500 leading-tight">Bagus sekali...</div>
            </div>
          </div>
          {/* Comment 3 */}
          <div className="flex items-start gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-100 text-amber-700 font-bold flex items-center justify-center text-[4px]">H</div>
            <div>
              <div className="text-[5.5px] font-bold text-slate-700">Hardi</div>
              <div className="text-[5px] text-slate-500 leading-tight">Terima kasih</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
