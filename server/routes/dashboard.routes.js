import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authGuard } from "../middlewares/auth.middleware.js";
import { roleGuard } from "../middlewares/role.middleware.js";

const router = Router();

router.use(authGuard);

router.get("/summaryUser", roleGuard(["user"]), DashboardController.getDashboardSummaryForUser);

router.get("/summarySupplier", roleGuard(["supplier"]), DashboardController.getDashboardSummaryForSupplier);
router.get("/summaryAdmin", roleGuard(["admin"]), DashboardController.getDashboardSummaryForAdmin);

export default router;
