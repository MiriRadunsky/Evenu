// routes/budget.routes.js
import express from "express";
import { authGuard } from "../middlewares/auth.middleware.js";
import {
  getBudgetEvents,
  patchEventBudget,
} from "../controllers/budget.controller.js";

const router = express.Router();
router.use(authGuard);
// GET /api/budget/events   – כל האירועים הרלוונטיים עם תקציב
router.get("/events", getBudgetEvents);

// PATCH /api/budget/events/:eventId   – עדכון תקציב + היסטוריה
router.patch("/events/:eventId", patchEventBudget);

export default router;
