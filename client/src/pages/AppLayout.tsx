import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

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
import { ScrollArea } from "../components/ui/scroll-area";

import { initSocket } from "../services/socket";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markNotificationAsRead } from "../store/notificationsSlice";
import { fetchUser } from "../store/authSlice";

import { logout } from "../services/auth";

import type { AppDispatch, RootState } from "../store";
import type { AppRoute } from "../types/AppRouter";
import type { Notification } from "../types/type";

import {
  formatRelativeTime,
  getNotificationColor,
  getNotificationIcon,
} from "../Utils/NotificationUtils";

export default function AppLayout({
  navigationItems,
  children,
}: {
  navigationItems: AppRoute[];
  children: React.ReactNode;
}) {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);
  const { notifications } = useSelector((state: RootState) => state.notifications);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [navigetNotification, setNavigetNotification] = useState("");

  /** --- USER LOAD --- */
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  /** קביעת נתיב בסיס להתראות */
  useEffect(() => {
    if (user) {
      setNavigetNotification(
        user.role === "supplier" ? "/supplier/notifications" : "/notifications"
      );
    }
  }, [user]);

  /** --- SOCKET + INITIAL NOTIFICATION FETCH --- */
  useEffect(() => {
    if (user?._id) {
      const socket = initSocket(user._id, dispatch);
      dispatch(fetchNotifications());
      return () => socket?.disconnect?.();
    }
  }, [user?._id, dispatch]);

  /** LOGOUT */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /** USER INITIALS */
  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  }, [user?.name]);

  /** UNREAD COUNT */
  const unreadCount = useMemo(() => notifications?.length || 0, [notifications]);

  /** SORTED FIVE RECENT NOTIFICATIONS */
  const recentNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications]
      .sort(
        (a: Notification, b: Notification) =>
          new Date(b.payload.time).getTime() - new Date(a.payload.time).getTime()
      )
      .slice(0, 5);
  }, [notifications]);

  /** CLICK ON NOTIFICATION */
  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      dispatch(markNotificationAsRead(notification.id));
      setIsNotificationsOpen(false);
    },
    [dispatch]
  );

  /** ============================= JSX ============================= */
  return (
    <SidebarProvider style={{ direction: "rtl" } as React.CSSProperties}>
      <Sidebar side="right" className="bg-background w-64 md:w-72">
        <SidebarHeader>
          <div className="px-4 py-6 border-b bg-background">
            <h1 className="text-xl font-bold text-primary">ניהול אירועים</h1>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-background">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive = location.pathname.startsWith(item.path);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.path} className="flex items-center gap-2">
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

        <SidebarFooter className="bg-background border-t">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center gap-3 px-4 py-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={""} alt={user?.name || ""} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
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
        {/* טופבר */}
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-2">
          <SidebarTrigger />

          <div className="ml-auto">
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-primary" />

                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center rounded-full"
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
                      {recentNotifications.map((notification, index) => {
                        const Icon = getNotificationIcon(notification.type);
                        const colorClass = getNotificationColor(notification.type);

                        return (
                          <React.Fragment key={notification.id}>
                            <div
                              className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${colorClass}`}>
                                  <Icon className="h-4 w-4" />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{notification.type}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.payload.note}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatRelativeTime(notification.payload.time)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {index < recentNotifications.length - 1 && <Separator className="my-1" />}
                          </React.Fragment>
                        );
                      })}
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
  );
}
