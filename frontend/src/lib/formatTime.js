/**
 * Convert a date string/timestamp to a relative time string in Indonesian
 * e.g. "baru saja", "2 menit lalu", "1 jam lalu", "3 hari lalu"
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return "";

  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  
  // Invalid date
  if (isNaN(diffMs)) return "";
  
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 10) return "baru saja";
  if (diffSec < 60) return `${diffSec} detik lalu`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) return "kemarin";
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`;

  // For older entries, show the date
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}
