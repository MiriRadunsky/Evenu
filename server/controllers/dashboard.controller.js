import asyncHandler from "../middlewares/asyncHandler.middleware.js";
import  {DashboardService}  from "../services/dashboard.service.js";

export const DashboardController = {
  getDashboardSummaryForUser : asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const summary = await DashboardService.getDashboardSummaryForUser(userId);
    return res.status(200).json(summary);
}),
  getDashboardChartsForUser: asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const charts = await DashboardService.getDashboardChartsForUser(userId);
    return res.status(200).json(charts);
  }),

  getDashboardSummaryForSupplier : asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const summary = await DashboardService.getDashboardSummaryForSupplier(userId);
    return res.status(200).json(summary);
}),
 getDashboardChartsForSupplier: asyncHandler(async (req, res, next) => {
    const userId = req.user?._id;
    const charts =
      await DashboardService.getDashboardChartsForSupplier(userId);
    return res.status(200).json(charts);
  }),
  getDashboardSummaryForAdmin : asyncHandler(async (req, res, next) => {
    const summary = await DashboardService.getDashboardSummaryForAdmin();
    return res.status(200).json(summary);
})};