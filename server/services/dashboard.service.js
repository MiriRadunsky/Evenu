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
  // async getDashboardSummaryForSupplier(userId) {
  //   const SupplierId=await SupplierRepository.getSupplierIdByUserId(userId);
  //   if (!SupplierId) {
  //       throw new AppError(404, "ספק לא נמצא");
  //     }
  //   const upcomingEvents = await DashboardRepository.findUpcomingEventsForSupplier(SupplierId);
  //   const upcomingEventsWithStatus = upcomingEvents.map(e => ({
  //     ...e.toObject(),
  //     status: e.autoStatus, 
  //   }));
  //   const pendingRequestsCount = await DashboardRepository.countPendingRequestsForSupplier(SupplierId);
  //   const approvedRequestsCount=await DashboardRepository.countApprovedRequestsForSupplier(SupplierId);     
  //   const activeContractsCount=await DashboardRepository.countActiveContractsForSupplier(SupplierId);
  //   const pendingPayments = await DashboardRepository.findPendingPaymentsForSupplier(SupplierId);
  //   const pendingPaymentsCount = pendingPayments.length;
  //   const pendingPaymentsTotal = pendingPayments.reduce(
  //     (sum, p) => sum + (p.amount || 0),
  //     0
  //   );
  //   const overduePaymentsCount = await DashboardRepository.countOverduePaymentsForSupplier(SupplierId);

  //   return {
  //     upcomingEvent: upcomingEventsWithStatus, 
  //     approvedRequestsCount,
  //     activeContractsCount,
  //     pendingRequestsCount,
  //     pendingPaymentsCount,
  //     pendingPaymentsTotal,
  //     overduePaymentsCount,
  //   };
  // },
   async getDashboardChartsForSupplier(userId) {
  const SupplierId = await SupplierRepository.getSupplierIdByUserId(userId);
  if (!SupplierId) {
    throw new AppError(404, "ספק לא נמצא");
  }

  // 1. הכנסות לפי חודש (12 חודשים אחרונים)
  const now = new Date();
  const twelveMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 11,
    1
  );

  const paidPaymentsLastYear =
    await DashboardRepository.getPaidPaymentsForSupplier(SupplierId, {
      // אם השדה אצלך לא נקרא paidAt אלא paymentDate / updatedAt וכו' – תחליפי כאן
      paidAt: { $gte: twelveMonthsAgo },
    });

  const revenueByMonthMap = new Map();

  for (const payment of paidPaymentsLastYear) {
    const paidAt = payment.paidAt ? new Date(payment.paidAt) : null;
    if (!paidAt) continue;

    const key = `${paidAt.getFullYear()}-${String(
      paidAt.getMonth() + 1
    ).padStart(2, "0")}`;

    const prev = revenueByMonthMap.get(key) || 0;
    revenueByMonthMap.set(key, prev + (payment.amount || 0));
  }

  const revenueByMonth = Array.from(revenueByMonthMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, total]) => ({ month, total }));

  // 2. תשלומים לפי סטטוס עבור הספק
  const [paidCount, pendingCount, overdueCount] = await Promise.all([
    DashboardRepository.countPaidPaymentsForSupplier(SupplierId),
    DashboardRepository.countPendingPaymentsForSupplier(SupplierId),
    DashboardRepository.countOverduePaymentsForSupplier(SupplierId),
  ]);

  const paymentsByStatus = [
    { status: "שולם", count: paidCount },
    { status: "ממתין", count: pendingCount },
    { status: "באיחור", count: overdueCount },
  ];

  return {
    revenueByMonth,
    paymentsByStatus,
  };
}
,

  async getDashboardSummaryForSupplier(userId) {
    const SupplierId = await SupplierRepository.getSupplierIdByUserId(userId);
    if (!SupplierId) {
      throw new AppError(404, "ספק לא נמצא");
    }

    // 1. אירועים ותצוגה כמו קודם
    const upcomingEvents = await DashboardRepository.findUpcomingEventsForSupplier(SupplierId);
    const upcomingEventsWithStatus = upcomingEvents.map((e) => ({
      ...e.toObject(),
      status: e.autoStatus,
    }));

    // 2. ספירות כמו קודם
    const pendingRequestsCount =
      await DashboardRepository.countPendingRequestsForSupplier(SupplierId);
    const approvedRequestsCount =
      await DashboardRepository.countApprovedRequestsForSupplier(SupplierId);
    const activeContractsCount =
      await DashboardRepository.countActiveContractsForSupplier(SupplierId);

    const pendingPayments =
      await DashboardRepository.findPendingPaymentsForSupplier(SupplierId);
    const pendingPaymentsCount = pendingPayments.length;
    const pendingPaymentsTotal = pendingPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const overduePaymentsCount =
      await DashboardRepository.countOverduePaymentsForSupplier(SupplierId);

    // 3. חישוב הכנסות לחודש ולשנה

    const now = new Date();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

    // שימי לב: כאן אני מניח שיש שדה paidAt בתשלום. אם השם אצלך שונה,
    // פשוט תחליפי ל־paymentDate/updatedAt וכו'.
    const [monthPaid, yearPaid] = await Promise.all([
      DashboardRepository.getPaidPaymentsForSupplier(SupplierId, {
        paidAt: { $gte: monthStart, $lt: monthEnd },
      }),
      DashboardRepository.getPaidPaymentsForSupplier(SupplierId, {
        paidAt: { $gte: yearStart, $lt: yearEnd },
      }),
    ]);

    const monthRevenue = monthPaid.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );
    const yearRevenue = yearPaid.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    return {
      upcomingEvent: upcomingEventsWithStatus,
      approvedRequestsCount,
      activeContractsCount,
      pendingRequestsCount,
      pendingPaymentsCount,
      pendingPaymentsTotal,
      overduePaymentsCount,
      monthRevenue,
      yearRevenue,
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
  },
  async getDashboardChartsForUser(userId) {
  // 1. תשלומים ששולמו ב־12 חודשים אחרונים (נשאר כמו אצלך)
  const now = new Date();
  const twelveMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 11,
    1
  );

  const paidPaymentsLastYear =
    await DashboardRepository.getPaidPaymentsForUser(userId, {
      paidAt: { $gte: twelveMonthsAgo },
    });

  const paymentsByMonthMap = new Map();

  for (const payment of paidPaymentsLastYear) {
    const paidAt = payment.paidAt ? new Date(payment.paidAt) : null;
    if (!paidAt) continue;

    const key = `${paidAt.getFullYear()}-${String(
      paidAt.getMonth() + 1
    ).padStart(2, "0")}`;

    const prev = paymentsByMonthMap.get(key) || 0;
    paymentsByMonthMap.set(key, prev + (payment.amount || 0));
  }

  const paymentsByMonth = Array.from(paymentsByMonthMap.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([month, total]) => ({ month, total }));

  // 2. תשלומים לפי סטטוס – בדיוק כמו אצל הספק
  const [paidCount, pendingCountRaw, overdueCount] = await Promise.all([
    DashboardRepository.countPaidPaymentsForUser(userId),
    DashboardRepository.countPendingPaymentsForUser(userId),
    DashboardRepository.countOverduePaymentsForUser(userId),
  ]);

  // אם את רוצה שפנדינג *לא* יכלול את מה שבאיחור:
  const pendingCount = Math.max(pendingCountRaw - overdueCount, 0);

  const paymentsByStatus = [
    { status: "שולם", count: paidCount },
    { status: "ממתין", count: pendingCount },
    { status: "באיחור", count: overdueCount },
  ];

  return {
    paymentsByMonth,
    paymentsByStatus,
  };
}


}
