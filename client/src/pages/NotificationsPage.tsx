import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";

import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Bell, AlertCircle } from "lucide-react";

import {
  fetchNotifications,
  markNotificationAsRead,
} from "../store/notificationsSlice";

import {
  formatFullDate,
  getNotificationIcon,
  getNotificationColor,
} from "../Utils/NotificationUtils";
import type { Notification } from "../types/Notification";

type NotificationTab = "הכל" | "תשלומים"|  "בקשות" | "חוזים";

export default function NotificationsPage() {
  const dispatch: AppDispatch = useDispatch();

  const { notifications, loading, error } = useSelector(
    (state: RootState) => state.notifications
  );

  const [activeTab, setActiveTab] = useState<NotificationTab>("הכל");

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications].sort((a: Notification, b: Notification) => {
      if (!a.payload.time) return 1;
      if (!b.payload.time) return -1;
      return (
        new Date(b.payload.time).getTime() -
        new Date(a.payload.time).getTime()
      );
    });
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "הכל") return sortedNotifications;

    if (activeTab === "תשלומים") {
      return sortedNotifications.filter((n) => n.type === "תשלום");
    }
   
    if (activeTab === "בקשות") {
      return sortedNotifications.filter((n) => n.type === "בקשה");
    }
    if (activeTab === "חוזים") {
      return sortedNotifications.filter((n) => n.type === "חוזה");
    }

    return sortedNotifications;
  }, [sortedNotifications, activeTab]);

  const groupedByDate = useMemo(() => {
    const map: Record<string, Notification[]> = {};

    for (const n of filteredNotifications) {
      const d = n.payload.time ? new Date(n.payload.time) : null;
      const key = d ? d.toISOString().slice(0, 10) : "אחר";
      if (!map[key]) map[key] = [];
      map[key].push(n);
    }

    return Object.entries(map)
      .sort(([a], [b]) => (a < b ? 1 : -1)) 
      .map(([date, items]) => ({ date, items }));
  }, [filteredNotifications]);

  const hasNotifications = !loading && filteredNotifications.length > 0;

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      await dispatch(markNotificationAsRead(notification.id));
    },
    [dispatch]
  );

  return (
    <div
      className="space-y-6 max-w-4xl mx-auto"
      style={{ direction: "rtl" }}
    >
      {/* כותרת עליונה */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Bell className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">ההתראות שלי</h1>
          <p className="text-sm text-muted-foreground">
            כל העדכונים האחרונים על חוזים, אירועים, בקשות ותשלומים
          </p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as NotificationTab)}
      >
        <TabsList className="grid w-full grid-cols-5 rounded-xl bg-muted p-1">
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="תשלומים">תשלומים</TabsTrigger>
          <TabsTrigger value="בקשות">בקשות</TabsTrigger>
          <TabsTrigger value="חוזים">חוזים</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">טוען התראות...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {hasNotifications ? (
            <div className="space-y-8">
              {groupedByDate.map(({ date, items }) => (
                <section key={date} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs md:text-sm text-slate-500 whitespace-nowrap">
                      {new Date(date).toLocaleDateString("he-IL")}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>

                  <div className="relative pr-4 border-r border-slate-200">
                    <div className="space-y-3">
                      {items.map((notification) => {
                        const Icon = getNotificationIcon(notification.type);
                        const iconColor =
                          getNotificationColor(notification.type);

                        return (
                          <button
                            key={notification.id}
                            type="button"
                            className="w-full text-right"
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="flex gap-3">
                              {/* נקודת ציר זמן */}
                              <div className="relative -ml-2 flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-primary shadow" />
                              </div>

                              {/* כרטיס התראה */}
                              <div className="flex-1 rounded-xl bg-white shadow-sm border border-slate-100 px-3 py-2.5 hover:shadow-md transition">
                                <div className="flex items-start gap-2">
                                  <div
                                    className={`mt-0.5 p-2 rounded-full ${iconColor}`}
                                  >
                                    <Icon className="h-4 w-4" />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <h3 className="text-sm font-semibold truncate">
                                        {notification.type}
                                      </h3>
                                      {notification.priority && (
                                        <Badge
                                          variant="outline"
                                          className="text-[10px]"
                                        >
                                          {notification.priority}
                                        </Badge>
                                      )}
                                    </div>

                                    <p className="text-xs md:text-sm text-slate-700 mb-1 line-clamp-2">
                                      {notification.payload.note}
                                    </p>

                                    <div className="text-[11px] text-slate-400">
                                      {formatFullDate(
                                        notification.payload.time
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          ) : (
            !loading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Bell className="h-14 w-14 text-muted-foreground mb-4 opacity-40" />
                  <h3 className="text-xl font-semibold mb-1">
                    אין התראות להצגה
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    כשיהיו הודעות חדשות לגבי האירועים והחוזים שלך, הן יופיעו
                    כאן.
                  </p>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
