import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
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
import {
  fetchNotifications,
  markNotificationAsRead,
} from "../store/notificationsSlice";
import { logout } from "../services/auth";
import { fetchUser } from "../store/authSlice";

import type { AppRoute } from "../types/AppRouter";
import type { Notification } from "../types/type";
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

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [navigateNotification, setNavigateNotification] = useState("");

  const user = useSelector((state: RootState) => state.auth.user);
  const { notifications } = useSelector(
    (state: RootState) => state.notifications
  );
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);
  const { notifications } = useSelector((state: RootState) => state.notifications);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [navigetNotification, setNavigetNotification] = useState("");

  /** --- USER LOAD --- */
  useEffect(() => {
    dispatch(fetchUser());

    if (user?.role === "supplier")
      setNavigateNotification("/supplier/notifications");
    else
      setNavigateNotification("/notifications");
  }, [dispatch, user?.role]);

  // --- SOCKET + INIT NOTIFICATIONS ---
  }, [dispatch]);

  /** קביעת נתיב בסיס להתראות */
  useEffect(() => {
    if (user) {
      setNavigetNotification(
        user.role === "supplier"
          ? "/supplier/notifications"
          : "/notifications"
      );
    }
  }, [user]);

  /** --- SOCKET + INITIAL NOTIFICATION FETCH --- */
  useEffect(() => {
    if (user?._id) {
      initSocket(user._id, dispatch);
      dispatch(fetchNotifications());
      return () => socket?.disconnect?.();
    }
  }, [user?._id, dispatch]);

  // --- USER INITIALS ---
  /** LOGOUT */
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  /** USER INITIALS */
  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}${parts[1][0]}`
      : parts[0][0];
  }, [user?.name]);

  // ----- NOTIFICATIONS -----
  const unreadCount = useMemo(() => notifications?.length || 0, [notifications]);
  /** UNREAD COUNT */
  const unreadCount = useMemo(
    () => notifications?.length || 0,
    [notifications]
  );

  /** SORTED FIVE RECENT NOTIFICATIONS */
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
      .sort((a: Notification, b: Notification) =>
        new Date(b.payload.time).getTime() -
        new Date(a.payload.time).getTime()
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  /** ============================= JSX ============================= */

  return (
    <>
      <SidebarProvider style={{ direction: "rtl" } as React.CSSProperties}>
        <Sidebar side="right">
          {/* HEADER */}
          <SidebarHeader>
            <div className="px-4 py-6 border-b">
              <h1 className="text-xl font-bold text-primary">ניהול אירועים</h1>
            </div>
          </SidebarHeader>

          {/* SIDEBAR MENU */}
          <SidebarContent>
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

          {/* FOOTER */}
          <SidebarFooter>
            <SidebarMenu>
              {/* USER */}
              <SidebarMenuItem>
                <div className="flex items-center gap-3 px-4 py-3 border-t">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={""} alt={user?.name || ""} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-xs truncate text-muted-foreground">
                      {user?.email}
                    </p>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
              </SidebarMenuItem>

              {/* LOGOUT */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="w-5 h-5" />
                  <span>התנתק</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* MAIN SECTION */}
        <SidebarInset>
          {/* TOP BAR */}
          <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 border-b bg-background">
            <SidebarTrigger />

            {/* NOTIFICATION BELL */}
            <div className="ml-auto">
              <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`relative ${hasNewNotifications ? "animate-pulse" : ""}`}
                  >
                    <Bell className="w-5 h-5 text-primary" />
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute flex items-center justify-center w-5 h-5 p-0 text-xs rounded-full -top-1 -right-1"
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

                {/* NOTIFICATION POPOVER */}
                <PopoverContent className="w-[360px] p-0" align="end">
                  <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="text-sm font-bold">התראות</h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => setIsNotificationsOpen(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <ScrollArea className="max-h-[360px]">
                    {recentNotifications.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {recentNotifications.map((notification, index) => {
                          const Icon = getNotificationIcon(notification.type);
                          const iconColor = getNotificationColor(notification.type);
                          const colorClass = getNotificationColor(notification.type);

                          return (
                            <React.Fragment key={notification.id}>
                              <div
                                className="p-3 transition-colors rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                                onClick={() => handleNotificationClick(notification)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={`p-2 rounded-full ${iconColor}`}>
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="text-sm font-medium truncate">
                                        {notification.type}
                                      </p>
                                      <div className="w-2 h-2 rounded-full bg-destructive"></div>
                                    </div>
                                    <p className="mb-1 text-xs text-muted-foreground line-clamp-2">
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

                              {index < recentNotifications.length - 1 && (
                                <Separator className="my-1" />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                        <p>אין התראות</p>
                      </div>
                    )}
                  </ScrollArea>

                  {recentNotifications.length > 0 && (
                    <div className="p-2 border-t">
                      <Link to={navigateNotification}>
                        <Button
                          variant="ghost"
                          className="justify-center w-full text-xs"
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

          {/* PAGE CONTENT */}
          <main className="p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
