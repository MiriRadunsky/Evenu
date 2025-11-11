export const getPaymentStatusVariant = (status?: string, isOverdue?: boolean): "default" | "secondary" | "destructive" | "outline" => {
  if (isOverdue) return "destructive";
  if (status === "שולם") return "default";
  if (status === "ממתין") return "outline";
  return "secondary";
};