export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "ממתין":
    case "ממתין לספק":
      return "bg-white text-black border-border";

    case "שולם":
      return "bg-primary/10 text-primary border border-primary/40";

    case "באיחור":
      return "bg-destructive/10 text-destructive border border-destructive/40";

    case "נדחה":
      return "bg-destructive/10 text-destructive border border-destructive/40";

    default:
      return "bg-white text-black border-border";
  }
};
