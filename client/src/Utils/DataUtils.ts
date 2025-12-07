export const formatEventDate = (dateString?: string) => {
  if (!dateString) return "לא צוין";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "תאריך לא תקין";
  }
};

export const formatRequestDate = (dateString?: string) => {
  console.log('date',dateString);
  
  if (!dateString) return "לא צוין";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return "תאריך לא תקין";
  }
};

export const formatMessageTime = (dateString?: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "עכשיו";
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;

    return date.toLocaleDateString("he-IL", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

export const getEventStatusProgress = (status?: string) => {
  if (status === "תכנון") return 33;
  if (status === "פעיל") return 66;
  if (status === "הושלם") return 100;
  return 0;
};

export const isPaymentOverdue = (dueDate?: string, status?: string) => {
  if (status !== "ממתין" || !dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  return due < today;
};