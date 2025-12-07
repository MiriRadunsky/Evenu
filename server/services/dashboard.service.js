import  {DashboardRepository}  from "../repositories/dashboard.repository.js";
import { SupplierRepository } from "../repositories/suppliers.repositry.js";

export const DashboardService ={
  async getDashboardSummaryForUser(userId) {
    const upcomingEvents = await DashboardRepository.findUpcomingEventsForUser(userId);
    const upcomingEventsWithStatus = upcomingEvents.map(e => ({
      ...e.toObject(),
      status: e.autoStatus, 
    }));
    const pendingRequestsCount = await DashboardRepository.countPendingRequestsForUser(userId);
    const approvedRequestsCount=await DashboardRepository.countApprovedRequestsForUser(userId);     
    const activeContractsCount=await DashboardRepository.countActiveContractsForUser(userId);
    const pendingPayments = await DashboardRepository.findPendingPaymentsForUser(userId);
    const pendingPaymentsCount = pendingPayments.length;
    const pendingPaymentsTotal = pendingPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const overduePaymentsCount = await DashboardRepository.countOverduePaymentsForUser(userId);
    return {
      upcomingEvent: upcomingEventsWithStatus, 
      approvedRequestsCount,
      activeContractsCount,
      pendingRequestsCount,
      pendingPaymentsCount,
      pendingPaymentsTotal,
      overduePaymentsCount,
    };
  },
  async getDashboardSummaryForSupplier(userId) {
    const SupplierId=await SupplierRepository.getSupplierIdByUserId(userId);
    if (!SupplierId) {
        throw new AppError(404, "ספק לא נמצא");
      }
    const upcomingEvents = await DashboardRepository.findUpcomingEventsForSupplier(SupplierId);
    const upcomingEventsWithStatus = upcomingEvents.map(e => ({
      ...e.toObject(),
      status: e.autoStatus, 
    }));
    const pendingRequestsCount = await DashboardRepository.countPendingRequestsForSupplier(SupplierId);
    const approvedRequestsCount=await DashboardRepository.countApprovedRequestsForSupplier(SupplierId);     
    const activeContractsCount=await DashboardRepository.countActiveContractsForSupplier(SupplierId);
    const pendingPayments = await DashboardRepository.findPendingPaymentsForSupplier(SupplierId);
    const pendingPaymentsCount = pendingPayments.length;
    const pendingPaymentsTotal = pendingPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const overduePaymentsCount = await DashboardRepository.countOverduePaymentsForSupplier(SupplierId);

    return {
      upcomingEvent: upcomingEventsWithStatus, 
      approvedRequestsCount,
      activeContractsCount,
      pendingRequestsCount,
      pendingPaymentsCount,
      pendingPaymentsTotal,
      overduePaymentsCount,
    };
  },
  async getDashboardSummaryForAdmin() {
    const totalUsers = await DashboardRepository.countTotalUsers();
    const totalSuppliers = await DashboardRepository.countTotalSuppliers();
    const pendingSuppliers = await DashboardRepository.countPendingSuppliers();
    const totalEvents = await DashboardRepository.countTotalEvents();
    const activeContracts = await DashboardRepository.countAllActiveContracts();
    const totalRevenue = await DashboardRepository.getTotalRevenue();
    
    return {
      totalUsers,
      totalSuppliers,
      pendingSuppliers,
      totalEvents,
      activeContracts,
      totalRevenue,
    };
  }
}
