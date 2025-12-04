export type RequestStatus = "ממתין" | "מאושר" | "נדחה" | "פג" | string;

export const GOLD_CARD_BORDER =
  "border border-primary/30 rounded-xl bg-white";

export const GOLD_LABEL = "text-xs font-semibold text-muted-foreground";

export function getStatusBadgeClass(status: RequestStatus) {
  switch (status) {
    case "ממתין":
      return "bg-muted text-muted-foreground border border-border";

    case "מאושר":
      return "bg-primary/10 text-primary border border-primary/40";

    case "נדחה":
      return "bg-destructive/10 text-destructive border border-destructive/40";

    case "פג":
      return "bg-muted text-muted-foreground border border-border";

    default:
      return "bg-primary/5 text-primary border border-primary/30";
  }
}
