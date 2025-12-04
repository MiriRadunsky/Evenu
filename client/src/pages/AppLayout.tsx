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
import { initSocket } from "../services/socket";
import { useDispatch, useSelector } from "react-redux";
import {
  addNotification,
  fetchNotifications,
  markNotificationAsRead, 
} from "../store/notificationsSlice";
import { logout } from "../services/auth";
import { fetchUser } from "../store/authSlice";
import type { AppRoute } from "../types/AppRouter";
import type { Notification } from "../types/Notification";
import { formatRelativeTime, getNotificationColor, getNotificationIcon } from "../Utils/NotificationUtils";
import { ScrollArea } from "../components/ui/scroll-area";
import { Toaster } from "sonner";
import type { AppDispatch, RootState } from "@/store";

export default function AppLayout({ navigationItems, children }: { navigationItems: AppRoute[]; children: React.ReactNode }) {
  const dispatch: AppDispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const user = useSelector((state: RootState) => state.auth.user);
  const { notifications } = useSelector(
    (state: RootState) => state.notifications
  ); 

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [navigateNotification, setNavigateNotification] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  }
  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  useEffect(() => {
    if(user?.role==='supplier')
      setNavigateNotification("/supplier/notifications")
    else
      setNavigateNotification("/notifications")
  }, [user])
  useEffect(() => {
    if (user?._id) {
      const socket = initSocket(user._id, dispatch);
      dispatch(fetchNotifications());
    }
  }, [user]);

  /** SOCKET + LISTENERS */
  useEffect(() => {
    if (!user?._id) return;
    const socket = initSocket(user._id, dispatch);
    const handleNotification = (notification: Notification) => dispatch(addNotification(notification));
    socket?.on("notification", handleNotification);
    return () => {
      socket?.off("notification", handleNotification);
      socket?.disconnect?.();
    };
  }, [user?._id, dispatch]);

  /** FETCH NOTIFICATIONS */
  useEffect(() => {
    if (user?._id) dispatch(fetchNotifications());
  }, [user?._id, dispatch]);

  /** USER INITIALS */
  const userInitials = useMemo(() => {
    if (!user?.name) return "U";
    const parts = user.name.split(" ");
    return parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  }, [user]);


  const unreadCount = useMemo(
    () => notifications?.length || 0,
    [notifications]
  );

  /** SORTED LAST 5 NOTIFICATIONS */
  const recentNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications]
      .sort((a: Notification, b: Notification) => new Date(b.payload.time).getTime() - new Date(a.payload.time).getTime())
      .slice(0, 5);
  }, [notifications]);

  /** CLICK NOTIFICATION */
  const handleNotificationClick = useCallback(
    async (notification: Notification) => {
        dispatch(markNotificationAsRead(notification.id));
      setIsNotificationsOpen(false);
    },
    [dispatch]
  );


  return (<>
    <SidebarProvider style={{ direction: "rtl" } as React.CSSProperties}>
      <Sidebar side="right">
        {/* HEADER */}
        <SidebarHeader>
          <div className="flex flex-col items-center justify-start p-0 m-0">
            <img
              src="/src/assets/logo.png"
              alt="Évenu לוגו"
              className="h-28 w-auto mb-2 mt-2"
              style={{ maxWidth: '90%', display: 'block' }}
            />
            <div className="w-full border-b border-[#e3e3e6] mt-2"></div>
          </div>
        </SidebarHeader>

        {/* SIDEBAR ITEMS */}
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
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
                  <p className="text-xs truncate text-muted-foreground">{user?.email}</p>
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

          {/* NOTIFICATION BUTTON */}
          <div className="ml-auto">
            <Popover open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5 text-primary" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute flex items-center justify-center w-5 h-5 text-xs rounded-full -top-1 -right-1"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-[360px] p-0" align="end">
                <div className="flex items-center justify-between p-3 border-b">
                  <h3 className="text-sm font-bold">התראות</h3>
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => setIsNotificationsOpen(false)}>
                    <X className="w-4 h-4" />
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
                              className="p-3 rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100"
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${colorClass}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{notification.type}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{notification.payload.note}</p>
                                  <p className="text-xs text-muted-foreground">{formatRelativeTime(notification.payload.time)}</p>
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
                      <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p>אין התראות</p>
                    </div>
                  )}
                </ScrollArea>

                {recentNotifications.length > 0 && (
                  <div className="p-2 border-t">
                    <Link to={navigateNotification}>
                      <Button variant="ghost" className="justify-center w-full text-xs" onClick={() => setIsNotificationsOpen(false)}>
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
      <Toaster />

      
    </>
  );
}
