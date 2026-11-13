// Returns Monday 00:00:00 (local) of the week containing `date`
export const getMondayOfWeek = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sun, 1 = Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Returns array of 7 Date objects [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
export const getWeekDays = (mondayDate) => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);
    return d;
  });
};

export const isSameDay = (d1, d2) => {
  const a = new Date(d1);
  const b = new Date(d2);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const formatFullDate = (dateInput) => {
  const d = new Date(dateInput);
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

export const formatTimeOnly = (dateInput) => {
  const d = new Date(dateInput);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const toDateInputValue = (isoString) => {
  const d = isoString ? new Date(isoString) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const toTimeInputValue = (isoString) => {
  const d = isoString ? new Date(isoString) : new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
