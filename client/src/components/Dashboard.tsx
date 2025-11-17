
import React, { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Calendar, Send, DollarSign, MessageSquare, Plus, Search, FileText, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import type { Payment, Event, Request, Message } from "../types/type";
import {Button} from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { fetchDashboardData } from "../store/dashboardSlice";

// פונקציות עזר לדוגמא
function formatEventDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("he-IL");
}

function getEventStatusProgress(status: string) {
  switch (status) {
    case "הושלם": return 100;
    case "פעיל": return 50;
    default: return 0;
  }
}

// דאטה זמני במקום fetch
const requests: Request[] = [];
const payments: Payment[] = [];
const messages:Message[] = [];


export default function Dashboard() {
    const dispatch:AppDispatch = useDispatch();
  const events: Event[] = useSelector((state: RootState) => state.dashboard.events);

  const user = useSelector((state:RootState)=>state.auth.user);

  useEffect(() => {
    const loadData = async () => {
      if(user)
      await dispatch(fetchDashboardData(user.email));
    };
    loadData();
  }, [dispatch, user?.email]);

const upcomingEvent = useMemo(() => {
  if (!Array.isArray(events)) return null;
  console.log(events);
  
  const activeEvents = events.filter(e => ["תכנון", "פעיל"].includes(e.status));
  return [...activeEvents].sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
  )[0];
}, [events]);

const recentMessages = useMemo(() => {
  return [...messages]
    .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    .slice(0, 3);
}, [messages]);

  const pendingRequestsCount = useMemo(() => requests.filter(r => r.status === "ממתין").length || 0, [requests]);

  const pendingPaymentsData = useMemo(() => {
    const pending = payments.filter(p => p.status === "ממתין");
    return { count: pending.length, total: pending.reduce((sum, p) => sum + (p.amount || 0), 0) };
  }, [payments]);

 

  const overduePayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return payments.filter(p => p.status === "ממתין" && new Date(p.dueDate || 0) < today);
  }, [payments]);

//   const eventTimeline = useMemo(() => events.sort((a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()) || [], [events]);
const eventTimeline = useMemo(() => {
  if (!Array.isArray(events)) return [];
  return [...events].sort(
    (a, b) => new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime()
  );
}, [events]);

  
return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          שלום, {user?.name || "משתמש"}
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">האירוע הקרוב</CardTitle>
            <Calendar className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            {upcomingEvent ? (
              <div className="space-y-1">
                <p className="text-xl font-bold">{upcomingEvent.name}</p>
                <p className="text-sm text-muted-foreground">
                  {upcomingEvent.type}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatEventDate(upcomingEvent.date.toString())}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">אין אירועים קרובים</p>
            )}
          </CardContent>
        </Card>

        <Link to={'/RequestsPage'}>
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
        </Link>

        <Link to={'/ContractsPaymentsPage'}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">תשלומים ממתינים</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingPaymentsData.count}</p>
              <p className="text-sm text-muted-foreground">
                סה"כ: ₪{pendingPaymentsData.total.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">פעילות אחרונה</CardTitle>
            <MessageSquare className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{recentMessages.length}</p>
            <p className="text-sm text-muted-foreground">הודעות אחרונות</p>
          </CardContent>
        </Card>
      </div>

      {overduePayments.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              תשלומים באיחור
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              יש לך {overduePayments.length} תשלומים שעברו את מועד הפירעון
            </p>
            <Link to={'/ContractsPaymentsPage'}>
              <Button variant="destructive" className="mt-3">
                צפה בתשלומים
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ציר זמן אירועים</CardTitle>
        </CardHeader>
        <CardContent>
          {eventTimeline.length > 0 ? (
            <div className="space-y-4">
              {eventTimeline.map((event) => {
                const progress = getEventStatusProgress(event.status);
                return (
                  <div key={event._id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{event.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatEventDate(event.date.toString())} • {event.locationRegion}
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
                    <Progress value={progress} className="h-2" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to={'/MyEventsPage'}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Plus className="h-8 w-8 text-primary" />
                <h3 className="font-bold">צור אירוע חדש</h3>
                <p className="text-sm text-muted-foreground">
                  הוסף אירוע חדש למערכת
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={'/suppliers'}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <Search className="h-8 w-8 text-primary" />
                <h3 className="font-bold">חפש ספקים</h3>
                <p className="text-sm text-muted-foreground">
                  עיין בקטלוג הספקים
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to={'/ContractsPaymentsPage'}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-2">
                <FileText className="h-8 w-8 text-primary" />
                <h3 className="font-bold">צפה בתשלומים</h3>
                <p className="text-sm text-muted-foreground">
                  נהל חוזים ותשלומים
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );


}



