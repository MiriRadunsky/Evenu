import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
} from "../../components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  LogOut
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { logout } from "../../services/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = useMemo(
    () => [
      { title: "לוח בקרה", url: "/admin/dashboard", icon: LayoutDashboard },
      { title: "ספקים ממתינים", url: "/admin/pending-suppliers", icon: UserCheck },
      { title: "ספקים פעילים", url: "/admin/active-suppliers", icon: Users },
      { title: "משתמשים", url: "/admin/users", icon: Users },
      { title: "אירועים", url: "/admin/events", icon: Calendar },
      { title: "סטטיסטיקות", url: "/admin/statistics", icon: BarChart3 },
    ],
    []
  );

 const handleLogout = () => {
  logout();     
  navigate("/login"); 
};

  return (
    <SidebarProvider style={{ direction: "rtl" } as React.CSSProperties}>
      <Sidebar side="right">
        <SidebarHeader>
          <div className="flex flex-col items-center justify-start p-0 m-0">
            <img
              src="/src/assets/logo.png"
              alt="Évenu לוגו"
              className="w-auto mt-2 mb-2 h-28"
              style={{ maxWidth: '90%', display: 'block' }}
            />
            <div className="w-full border-b border-[#e3e3e6] mt-2"></div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const isActive = location.pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={item.url} className="flex items-center gap-2">
                          <item.icon className="w-5 h-5" />
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
                <Avatar className="w-10 h-10">
                  <AvatarImage src="" alt="Admin" />
                  <AvatarFallback className="bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">מנהל מערכת</p>
                  <p className="text-xs truncate text-muted-foreground">ניהול מלא</p>
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
        <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 border-b bg-background">
          <SidebarTrigger />
          <h2 className="text-lg font-semibold">ניהול מערכת</h2>
        </div>
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
