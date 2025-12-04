import React, { useEffect, useMemo } from "react";
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
import {
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { initChatSocket } from "../store/chatSlice";
import type { AppDispatch, RootState } from "../store";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications } from "../store/notificationsSlice";
import NotificationsList from "./NotificationsList";
import { logout } from "../services/auth";
import { fetchUser } from "../store/authSlice";
import type { AppRoute } from "../types/AppRouter";

export default function AppLayout({navigationItems, children }: { navigationItems: AppRoute[], children: React.ReactNode }) {
    const dispatch:AppDispatch = useDispatch();
    const user=useSelector((state:RootState)=>state.auth.user);
    
useEffect(() => {
  dispatch(fetchUser());
  const userId = user?._id; 
  if (userId) {
    // initialize socket
    initChatSocket(userId, dispatch);
    // initialize chat socket (uses JWT from auth slice)
    const token = (dispatch as any).getState?.()?.auth?.token;
    initChatSocket(token, () => (dispatch as any).getState(), dispatch);

    dispatch(fetchNotifications());
  }
}, [dispatch, user?._id]);


  const navigate = useNavigate();
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

  {
    // return (
    //   <div className="min-h-screen flex items-center justify-center bg-background" style={{ direction: "rtl" }}>
    //     <div className="text-center">
    //       <h1 className="text-2xl font-bold mb-4">ניהול אירועים</h1>
    //       <p className="text-muted-foreground mb-6">אנא התחבר כדי להמשיך</p>
    //       <Link to="/login">
    //         <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
    //           התחבר
    //         </button>
    //       </Link>
    //     </div>
    //   </div>
    // );

  return (<>
    <SidebarProvider style={{ direction: "rtl" } as React.CSSProperties}>
      <Sidebar side="right">
        <SidebarHeader>
          <div className="px-4 py-6 border-b">
            <h1 className="text-xl font-bold text-primary">ניהול אירועים</h1>
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
                        <Link to={item.path} className="flex items-center gap-2">
                          <item.icon/>
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
                  <AvatarImage src={ ""} alt={user?.name || ""} />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.name || user?.email}</p>
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
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-2">
          <SidebarTrigger />
        </div>

        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
      <NotificationsList />
     </>
  );
}}
