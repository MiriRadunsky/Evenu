import { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";

import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Bell, AlertCircle } from "lucide-react";

import {
  fetchNotifications,
  markNotificationAsRead,
} from "../store/notificationsSlice";

import {
  formatFullDate,
  getNotificationIcon,
  getNotificationColor,
} from '../Utils/NotificationUtils';
import type { Notification } from "../types/Notification";

export default function NotificationsPage() {
  const dispatch: AppDispatch = useDispatch();

  const { notifications, loading, error } = useSelector(
    (state: RootState) => state.notifications
  );

  const [activeTab, setActiveTab] = useState<"הכל" | "תשלומים" | "יםאירוע" | "בקשות" | "חוזים">("הכל");

  useEffect(() => {
    dispatch(fetchNotifications());

  }, [dispatch]);

  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications].sort((a: Notification, b: Notification) => {
      if (!a.payload.time) return 1;
      if (!b.payload.time) return -1;
      return new Date(b.payload.time).getTime() - new Date(a.payload.time).getTime();
    });
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "הכל") return sortedNotifications;
    if (activeTab === "תשלומים") {
      return sortedNotifications.filter(
        (n: Notification) =>
          n.type === "תשלום"
      );
    }
    if (activeTab === "יםאירוע") {
      return sortedNotifications.filter(
        (n: Notification) => n.type === "אירוע"
      );
    }
    if (activeTab === "בקשות") {
      return sortedNotifications.filter(
        (n: Notification) =>
          n.type === "בקשה"
      );
    }
    if (activeTab === "חוזים") {
      return sortedNotifications.filter(
        (n: Notification) => n.type === "חוזה"
      );
    }
    return sortedNotifications;
  }, [sortedNotifications, activeTab]);

  const handleNotificationClick = useCallback(

    async (notification: Notification) => {      
    await dispatch(markNotificationAsRead(notification.id));
    },
    [dispatch]
  );

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">ההתראות שלי</h1>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="תשלומים">תשלומים</TabsTrigger>
          <TabsTrigger value="אירועים">אירועים</TabsTrigger>
          <TabsTrigger value="בקשות">בקשות</TabsTrigger>
          <TabsTrigger value="חוזים">חוזים</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">טוען התראות...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-800 flex items-center gap-3 mb-4">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {!loading && filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification: Notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getNotificationColor(notification.type);
                  
                return (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer hover:shadow-md transition-all bg-primary/5 border-primary/20`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${iconColor}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="font-bold text-lg truncate">
                              {notification.type}
                            </h3>
                            {notification.priority && (
                              <Badge>
                                {notification.priority}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">
                            {notification.payload.note}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{formatFullDate(notification.payload.time)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            !loading && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Bell className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-bold mb-2">אין התראות להצגה</h3>
                </CardContent>
              </Card>
            )
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
