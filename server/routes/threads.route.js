import express from "express";
import * as cnt from "../controllers/thread.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import {threadAuthGuard} from "../middlewares/threadAuth.middleware.js";

const router = express.Router();

router.use(authGuard);
// יצירת ת'רד חדש או מחזור קיים
router.post("/create", cnt.createOrReuseThread);

// ת'רדים עבור משתמש
router.get("/user", cnt.getUserThreads);

router.get("/supplier", cnt.getSupplierThreads);

router.get("/:threadId", threadAuthGuard, cnt.getThread);


export default router;
