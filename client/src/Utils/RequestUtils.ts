export const getStatusBadgeVariant = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "אושר") return "default";
  if (status === "נדחה") return "destructive";
  if (status === "פג תוקף") return "secondary";
  return "outline";
};