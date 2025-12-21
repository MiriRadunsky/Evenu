import express from "express";
import { israelRegions } from "../shared/regions.js";

const router = express.Router();

// GET /api/regions - מחזיר את רשימת האזורים
router.get("/", (req, res) => {
  res.json({
    success: true,
    regions: israelRegions
  });
});

export default router;
