import { Router } from "express";
import { authGuard } from '../middlewares/auth.middleware.js';
import { DashboardController } from "../controllers/dashboard.controller.js";
import { roleGuard } from "../middlewares/role.middleware.js";
const router = Router();

router.get("/summaryUser", authGuard,roleGuard(["user"]), DashboardController.getDashboardSummaryForUser);
router.get("/summarySupplier", authGuard,roleGuard(["supplier"]), DashboardController.getDashboardSummaryForSupplier);

export default router;
