const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const units = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export const timeAgo = (dateString) => {
  const seconds = Math.round((new Date(dateString) - Date.now()) / 1000);
  const abs = Math.abs(seconds);

  if (abs < 60) return "Just now";

  for (const [unit, size] of units) {
    if (abs >= size) return rtf.format(Math.trunc(seconds / size), unit);
  }
  return "Just now";
};