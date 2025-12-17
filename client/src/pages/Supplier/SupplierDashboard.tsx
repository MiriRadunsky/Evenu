import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import {
  fetchDashboardSummarySupplier,
  fetchDashboardChartsSupplier,
} from "../../store/supplierDashboardSlice";

import { Link } from "react-router-dom";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

import {
  Calendar,
  DollarSign,
  FileText,
  Bell,
  BarChart3,
  Send,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";

import type { Notification } from "../../types/Notification";
import type { Event } from "../../types/Event";

import { formatEventDate } from "../../Utils/DataUtils";
import {
  formatRelativeTime,
  getNotificationColor,
  getNotificationIcon,
} from "../../Utils/NotificationUtils";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Legend,
  Cell,
} from "recharts";

function getStatusColor(status: string): string {
  switch (status) {
    case "שולם":
      return "hsl(var(--primary))";
    case "ממתין":
      return "hsl(var(--ring))";
    case "באיחור":
      return "hsl(var(--destructive))";
    default:
      return "hsl(var(--muted))";
  }
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  actionTo?: string;
  actionLabel?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  actionTo,
  actionLabel,
}: StatCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow w-full overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <span>{title}</span>
          <Icon className="h-5 w-5 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl sm:text-3xl font-bold break-words">{value}</div>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
        {actionTo && actionLabel && (
          <Link to={actionTo}>
            <Button variant="outline" size="sm" className="mt-2 w-full">
              {actionLabel}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}

export default function SupplierDashboard() {
  const dispatch: AppDispatch = useDispatch();

  const {
    loading,
    error,
    upcomingEvent,
    pendingRequestsCount,
    activeContractsCount,
    pendingPaymentsCount,
    pendingPaymentsTotal,
    overduePaymentsCount,
    monthRevenue,
    revenueByMonth,
    paymentsByStatus,
  } = useSelector((state: RootState) => state.supplierDashboard);

  const user = useSelector((state: RootState) => state.auth.user);

  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications
  );

  const recentNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications]
      .sort((a: Notification, b: Notification) => {
        if (!a.payload.time) return 1;
        if (!b.payload.time) return -1;
        return (
          new Date(b.payload.time).getTime() -
          new Date(a.payload.time).getTime()
        );
      })
      .slice(0, 3);
  }, [notifications]);

  useEffect(() => {
    dispatch(fetchDashboardSummarySupplier());
    dispatch(fetchDashboardChartsSupplier());
  }, [dispatch]);

  useEffect(() => {
    console.log("📊 [ספק] נתוני גרפים:", { 
      revenueByMonth, 
      paymentsByStatus,
      hasRevenueData: revenueByMonth?.length > 0,
      hasStatusData: paymentsByStatus?.length > 0 
    });
  }, [revenueByMonth, paymentsByStatus]);

  const upcomingFirst = upcomingEvent?.[0] || null;

  const formattedPendingTotal = `₪${pendingPaymentsTotal.toLocaleString(
    "he-IL"
  )}`;
  const formattedMonthRevenue = `₪${monthRevenue.toLocaleString("he-IL")}`;

  return (
    <div className="w-full max-w-full space-y-6 overflow-x-hidden" style={{ direction: "rtl" }}>
      {/* כותרת עליונה */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold break-words max-w-full">
            שלום, {user?.name || "ספק"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            תמונת מצב מרוכזת של התשלומים והעבודה שלך.
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-muted-foreground">טוען נתונים...</div>
      )}

      {error && !loading && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      {/* שורת KPI עליונה – כסף נטו */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        <StatCard
          title="הכנסה החודש"
          value={formattedMonthRevenue}
          subtitle="סה״כ שולם החודש"
          icon={DollarSign}
        />

        <StatCard
          title="תשלומים פתוחים"
          value={pendingPaymentsCount}
          subtitle={`סה״כ פתוחים: ${formattedPendingTotal}${
            overduePaymentsCount ? ` • באיחור: ${overduePaymentsCount}` : ""
          }`}
          icon={FileText}
          actionTo="/supplier/payments"
          actionLabel="לניהול תשלומים"
        />

        <StatCard
          title="בקשות ממתינות"
          value={pendingRequestsCount}
          subtitle="בקשות שדורשות מענה"
          icon={Send}
          actionTo="/supplier/requests?status=pending"
          actionLabel="לטיפול בבקשות"
        />
      </div>

      {/* שורת סטטוס – אירועים וחוזים */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        {/* האירוע הקרוב */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              האירוע הקרוב
            </CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {upcomingFirst ? (
              <div className="space-y-1">
                <p className="text-xl font-bold">{upcomingFirst.name}</p>
                <p className="text-sm text-muted-foreground">
                  {upcomingFirst.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatEventDate(
                    upcomingFirst.date && upcomingFirst.date.toString()
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {upcomingFirst.locationRegion}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                אין אירועים קרובים כרגע
              </p>
            )}
          </CardContent>
        </Card>

        {/* חוזים פעילים */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              חוזים פעילים
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-3xl font-bold">{activeContractsCount}</div>
            <p className="text-sm text-muted-foreground">
              אירועים עם חוזה בתוקף
            </p>
            <Link to="/supplier/contracts">
              <Button variant="outline" size="sm" className="mt-2 w-full">
                לצפייה בחוזים
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* גרפים: הכנסות לפי חודש + תשלומים לפי סטטוס */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        {/* גרף עמודות - הכנסות לפי חודש */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              הכנסות לפי חודש
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueByMonth && revenueByMonth.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--primary))" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      `₪${value.toLocaleString("he-IL")}`
                    }
                  />
                  <Bar
                    dataKey="total"
                    name="הכנסה"
                    fill="hsl(var(--primary))"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                אין עדיין נתוני הכנסה להצגה.
              </p>
            )}
          </CardContent>
        </Card>

        {/* גרף עוגה - תשלומים לפי סטטוס */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              תשלומים לפי סטטוס
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsByStatus && paymentsByStatus.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {paymentsByStatus.map((item, idx) => (
                      <Cell
                        key={item.status + idx}
                        fill={getStatusColor(item.status)}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                אין מספיק נתוני תשלומים לסטטיסטיקה.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ציר זמן + התראות */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
        {/* ציר זמן אירועים כספק */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>ציר זמן אירועים כספק</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvent && upcomingEvent.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvent.map((event: Event) => (
                  <div key={event._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatEventDate(
                            event.date && event.date.toString()
                          )}{" "}
                          • {event.locationRegion}
                        </p>
                      </div>
                      <Badge
                        variant={
                          event.status === "הושלם"
                            ? "secondary"
                            : event.status === "פעיל"
                            ? "default"
                            : "outline"
                        }
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                אין אירועים עדיין
              </p>
            )}
          </CardContent>
        </Card>

        {/* התראות אחרונות */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>התראות אחרונות</CardTitle>
            <Link to="/supplier/notifications">
              <Button variant="ghost" size="sm">
                צפה בכל ההתראות
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentNotifications.length > 0 ? (
              <div className="space-y-3">
                {recentNotifications.map((notification: Notification) => {
                  const Icon = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type);

                  return (
                    <div
                      key={notification.id}
                      className="p-3 rounded-lg border bg-primary/5"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm truncate">
                              {notification.type}
                            </p>
                            <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0" />
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                            {notification.payload.note}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatRelativeTime(notification.payload.time)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  אין התראות חדשות
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
