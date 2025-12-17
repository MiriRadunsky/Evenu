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
  LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { logout } from "../../services/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = useMemo(
    () => [
      { title: "לוח בקרה", path: "/admin/dashboard", icon: LayoutDashboard },
      { title: "ספקים ממתינים", path: "/admin/pending-suppliers", icon: UserCheck },
      { title: "ספקים פעילים", path: "/admin/active-suppliers", icon: Users },
      { title: "משתמשים", path: "/admin/users", icon: Users },
      { title: "אירועים", path: "/admin/events", icon: Calendar },
    ],
    []
  );

  const handleLogout = () => {
    logout();     
    navigate("/login"); 
  };

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        דלג לתוכן הראשי
      </a>
      
      <SidebarProvider style={{ direction: "rtl" } as React.CSSProperties}>
        <Sidebar
          side="right"
          className="bg-background dark:bg-gray-900 text-gray-900 dark:text-white shadow-md overflow-x-hidden"
        >
          {/* HEADER */}
          <SidebarHeader className="bg-background dark:bg-gray-900">
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
          <SidebarContent className="bg-background dark:bg-gray-900">
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
                            className="flex items-center gap-2 text-gray-900 dark:text-background"
                          >
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

          {/* FOOTER */}
          <SidebarFooter className="bg-background dark:bg-gray-900">
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-3 px-4 py-3 border-t">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="" alt="Admin" />
                    <AvatarFallback className="bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
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

        {/* MAIN SECTION */}
        <SidebarInset className="flex flex-col h-screen overflow-x-hidden max-w-full bg-background dark:bg-gray-900">
          {/* TOP BAR */}
          <div className="sticky top-0 z-10 flex items-center gap-2 px-4 py-3 border-b bg-background dark:bg-gray-900 flex-shrink-0 w-full max-w-full">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">ניהול מערכת</h2>
          </div>

          {/* PAGE CONTENT */}
          <main id="main-content" className="flex-1 w-full max-w-full p-6 overflow-y-auto overflow-x-hidden bg-background dark:bg-gray-900" role="main" aria-label="תוכן ראשי">
            <div className="w-full max-w-full overflow-x-hidden">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
