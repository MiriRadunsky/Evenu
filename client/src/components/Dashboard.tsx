import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Send,
  DollarSign,
  FileText,
  AlertCircle,
  Bell,
  ArrowLeft,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

import type { Notification } from "../types/Notification";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import {
  formatRelativeTime,
  getNotificationColor,
  getNotificationIcon,
} from "../Utils/NotificationUtils";
import { formatEventDate } from "../Utils/DataUtils";

export default function Dashboard() {
  const {
    upcomingEvent,
    pendingRequestsCount,
    approvedRequestsCount,
    activeContractsCount,
    pendingPaymentsCount,
    pendingPaymentsTotal,
    overduePaymentsCount,
  } = useSelector((state: RootState) => state.dashboard);
  const user = useSelector((state: RootState) => state.auth.user);
  const [navigetNotification, setNavigetNotification] = useState("");

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
    if (user?.role === "supplier")
      setNavigetNotification("/supplier/notifications");
    else setNavigetNotification("/notifications");
  }, [user]);
  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">שלום, {user?.name || "משתמש"}</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">האירוע הקרוב</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {upcomingEvent && upcomingEvent[0] ? (
              <div className="space-y-1">
                <p className="text-xl font-bold">{upcomingEvent[0].name}</p>
                <p className="text-sm text-muted-foreground">
                  {upcomingEvent[0].type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatEventDate(
                    upcomingEvent[0].date && upcomingEvent[0].date.toString()
                  )}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                אין אירועים קרובים
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">בקשות פעילות</CardTitle>
            <Send className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingRequestsCount}</p>
            <p className="text-sm text-muted-foreground">בקשות ממתינות</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              תשלומים ממתינים
            </CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pendingPaymentsCount}</p>
            <p className="text-sm text-muted-foreground">
              סה"כ: ₪{pendingPaymentsTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">בקשות ממתינות</CardTitle>
            <Clock className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingRequestsCount}</div>
            <p className="text-sm text-muted-foreground">בקשות שצריכות מענה</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">בקשות מאושרות</CardTitle>
            <CheckCircle className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{approvedRequestsCount}</div>
            <p className="text-sm text-muted-foreground">בקשות מאושרות</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">חוזים פעילים</CardTitle>
            <FileText className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeContractsCount}</div>
            <p className="text-sm text-muted-foreground">חוזים פעילים</p>
          </CardContent>
        </Card>
      </div>

      {overduePaymentsCount > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              תשלומים באיחור
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              יש לך {overduePaymentsCount} תשלומים שעברו את מועד הפירעון
            </p>
            <Link to={"/contract-payment"}>
              <Button variant="destructive" className="mt-3">
                צפה בתשלומים
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ציר זמן אירועים</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvent && upcomingEvent?.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvent.map((event) => {
                  return (
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
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                אין אירועים עדיין
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>התראות אחרונות</CardTitle>
            <Link to={navigetNotification}>
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
                      className={`p-3 rounded-lg border ${"bg-primary/5"}`}
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
