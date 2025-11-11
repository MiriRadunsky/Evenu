export const getPriceRangeDisplay = (priceRange?: string) => {
  if (priceRange === "נמוך") return "₪";
  if (priceRange === "בינוני") return "₪₪";
  if (priceRange === "גבוה") return "₪₪₪";
  return "";
};