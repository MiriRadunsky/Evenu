import {
  DollarSign,
  AlertCircle,
  Calendar,
  Mail,
  MessageCircle,
  FileText,
  Bell,
} from "lucide-react";

export const getNotificationIcon = (notificationType?: string) => {
  switch (notificationType) {
    case "תשלום_מתקרב":
      return DollarSign;
    case "תשלום_באיחור":
      return AlertCircle;
    case "אירוע_מתקרב":
      return Calendar;
    case "בקשה_חדשה":
      return Mail;
    case "הודעה_חדשה":
      return MessageCircle;
    case "חוזה_חדש":
      return FileText;
    default:
      return Bell;
  }
};

export const getNotificationColor = (notificationType?: string) => {
  switch (notificationType) {
    case "תשלום_מתקרב":
      return "bg-chart-1/20 text-chart-1";
    case "תשלום_באיחור":
      return "bg-destructive/20 text-destructive";
    case "אירוע_מתקרב":
      return "bg-chart-3/20 text-chart-3";
    case "בקשה_חדשה":
      return "bg-chart-2/20 text-chart-2";
    case "הודעה_חדשה":
      return "bg-chart-4/20 text-chart-4";
    case "חוזה_חדש":
      return "bg-chart-5/20 text-chart-5";
    default:
      return "bg-muted text-muted-foreground";
  }
};



export const formatRelativeTime = (date?: Date) => {
  if (!date) return "";
  try {
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

export const formatFullDate = (date: Date) => {
  if (!date) return "לא צוין";
  try {
    return date.toLocaleString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "תאריך לא תקין";
  }
};