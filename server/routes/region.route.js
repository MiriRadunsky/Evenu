import express from "express";

const router = express.Router();

// רשימת אזורים בישראל (לא מחוזות)
export const israelRegions = [
  "גליל עליון",
  "גליל תחתון",
  "הגולן",
  "עמק יזרעאל",
  "קריות",
  "חיפה והסביבה",
  "צפון",
  "השרון",
  "גוש דן",
  "המרכז",
  "השפלה",
  "ירושלים והסביבה",
  "הרי יהודה",
  "בקעת הירדן",
  "הנגב",
  "הערבה",
  "אילת"
].sort((a, b) => a.localeCompare(b, "he"));

// GET /api/regions - מחזיר את רשימת האזורים
router.get("/", (req, res) => {
  res.json({
    success: true,
    regions: israelRegions
  });
});

export default router;
