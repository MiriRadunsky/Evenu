import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";
import { LogOut, Bell, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Separator } from "../components/ui/separator";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

import { initSocket } from "../services/socket";
import type { AppDispatch, RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationAsRead, // 👉 צריך להוסיף ב-slice אם אין
} from "../store/notificationsSlice";
import NotificationsList from "./NotificationsList";
import { logout } from "../services/auth";
import { fetchUser } from "../store/authSlice";
import type { AppRoute } from "../types/AppRouter";
import type { Notification } from "../types/type";
import { formatRelativeTime, getNotificationColor, getNotificationIcon } from "../Utils/NotificationUtils";
import { ScrollArea } from "../components/ui/scroll-area";

export default function AppLayout({
  navigationItems,
  children,
}: {
  navigationItems: AppRoute[];
  children: React.ReactNode;
}) {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const [navigetNotification,setNavigetNotification]=useState('')
  const user = useSelector((state: RootState) => state.auth.user);
  const { notifications } = useSelector(
    (state: RootState) => state.notifications
  ); // אם אצלך זה בשם אחר – תשני פה

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // --- USER ---
  useEffect(() => {
    dispatch(fetchUser());
    if(user?.role==='supplier')
      setNavigetNotification("/supplier/notifications")
    else
      setNavigetNotification("/notifications")
  }, [dispatch]);

  // --- SOCKET + טעינת התראות ראשונית ---
  useEffect(() => {
    if (user?._id) {
      const socket = initSocket(user._id, dispatch);
      dispatch(fetchNotifications());
      // אם את רוצה, יכולה להחזיר socket.disconnect ב-cleanup
    }
  }, [user, dispatch]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const userInitials = useMemo(() => {
    if (!user) return "U";
    if (!user.name) return "U";
    const parts = user.name.split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  }, [user?.name]);

  // ===== התראות מה-STORE =====

  const unreadCount = useMemo(
    () => notifications?.length || 0,
    [notifications]
  );

  const recentNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications]
      .sort((a: Notification, b: Notification) => {
        if (!a.payload.time) return 1;
        if (!b.payload.time) return -1;
        return (
          new Date(b.payload.time).getTime() - new Date(a.payload.time).getTime()
        );
      })
      .slice(0, 5);
  }, [notifications]);

  const hasNewNotifications = unreadCount > 0;

  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
      // סימון כנקרא
    
        // אם אצלך ה-id הוא _id / id – תתאימי
        dispatch(markNotificationAsRead(notification.id));
      

      setIsNotificationsOpen(false);

      // if (notification.actionUrl) {-cool feature
      //   navigate(notification.actionUrl);
      // }
    },
    [dispatch, navigate]
  );

  // =======================

  return (
    <>
      <SidebarProvider style={{ direction: "rtl" } as React.CSSProperties}>
        <Sidebar side="right">
          <SidebarHeader>
            <div className="px-4 py-6 border-b">
              <h1 className="text-xl font-bold text-primary">
                ניהול אירועים
              </h1>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link
                            to={item.path}
                            className="flex items-center gap-2"
                          >
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-3 px-4 py-3 border-t">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={""} alt={user?.name || ""} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                  <span>התנתק</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          {/* טופ בר – הוספתי פה את הפעמון */}
          <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-2">
            <SidebarTrigger />

            {/* מרווח ימינה, הפעמון בצד שמאל של הטופבר */}
            <div className="ml-auto">
              <Popover
                open={isNotificationsOpen}
                onOpenChange={setIsNotificationsOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`relative ${
                      hasNewNotifications ? "animate-pulse" : ""
                    }`}
                  >
                    <Bell className="h-5 w-5 text-primary" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[360px] p-0" align="end">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-bold text-sm">התראות</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <ScrollArea className="max-h-[360px]">
                    {recentNotifications.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {recentNotifications.map(
                          (notification: Notification, index: number) => {
                            const Icon = getNotificationIcon(
                              notification.type
                            );
                            const iconColor = getNotificationColor(
                              notification.type
                            );

                            return (
                              <React.Fragment
                                key={notification.id}
                              >
                                <div
                                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                      "bg-slate-50 hover:bg-slate-100"
                                  }`}
                                  onClick={() =>
                                    handleNotificationClick(notification)
                                  }
                                >
                                  <div className="flex items-start gap-3">
                                    <div
                                      className={`p-2 rounded-full ${iconColor}`}
                                    >
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
                                        {formatRelativeTime(
                                          notification.payload.time
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                {index <
                                  recentNotifications.length - 1 && (
                                  <Separator className="my-1" />
                                )}
                              </React.Fragment>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="h-10 w-10 mx-auto mb-2 opacity-40" />
                        <p>אין התראות</p>
                      </div>
                    )}
                  </ScrollArea>

                  {recentNotifications.length > 0 && (
                    <div className="border-t p-2">
                      <Link to={navigetNotification}>
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-xs"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          צפה בכל ההתראות
                        </Button>
                      </Link>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>

      {/* אם יש לך קומפוננטת עמוד התראות מלאה – את יכולה להשאיר / להסיר לפי הצורך */}
      {/* <NotificationsList /> */}
    </>
  );
}
