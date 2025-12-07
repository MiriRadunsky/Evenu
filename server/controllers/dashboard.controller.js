import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import  {DashboardService}  from "../services/dashboard.service.js";

export const DashboardController = {
  getDashboardSummaryForUser : asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const summary = await DashboardService.getDashboardSummaryForUser(userId);
    return res.status(200).json(summary);
}),
  getDashboardSummaryForSupplier : asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const summary = await DashboardService.getDashboardSummaryForSupplier(userId);
    return res.status(200).json(summary);
}),
  getDashboardSummaryForAdmin : asyncHandler(async (req, res, next) => {
    const summary = await DashboardService.getDashboardSummaryForAdmin();
    return res.status(200).json(summary);
}),
  getAdminStats : asyncHandler(async (req, res, next) => {
    const stats = await DashboardService.getAdminStats();
    return res.status(200).json(stats);
})};