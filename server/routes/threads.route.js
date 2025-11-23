import express from "express";
import * as cnt from "../controllers/thread.controller.js";

const router = express.Router();

// יצירת ת'רד חדש או מחזור קיים
router.post("/create", cnt.createOrReuseThread);

// ת'רד לפי מזהה
router.get("/:threadId", cnt.getThread);

// ת'רדים עבור משתמש
router.get("/user/:userId", cnt.getUserThreads);

// ת'רדים עבור ספק
router.get("/supplier/:supplierId", cnt.getSupplierThreads);

export default router;
