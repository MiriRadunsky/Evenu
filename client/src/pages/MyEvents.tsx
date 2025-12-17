import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";

import {
  fetchEvents,
} from "../store/eventsSlice";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Eye, Plus } from "lucide-react";
import { Button } from "../components/ui/button";

import { formatEventDate } from "../Utils/DataUtils";

import { EventFormDialog } from "../components/Event/EventFormDialog";
import { EventDetailsDialog } from "../components/Event/EventsDetailsDialog";
import { toast } from "sonner";
import type { Event } from "@/types/Event";

export default function MyEvents() {
  const dispatch: AppDispatch = useDispatch();
  const { eventsList, loadingList, error } = useSelector(
    (state: RootState) => state.events);
console.log("eventsList ", eventsList);
  const [selectedTab, setSelectedTab] = useState("הכל");
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch events when page or tab changes
  useEffect(() => {
    const status = selectedTab === "הכל" ? undefined : selectedTab;
    dispatch(fetchEvents({ page, pageSize, status }));
  }, [dispatch, page, pageSize, selectedTab]);

  const filteredEvents = useMemo(() => {
    if (!eventsList) return [];
    if (selectedTab === "הכל") return eventsList;
    return eventsList.filter((e:Event) => e.status === selectedTab);
  }, [eventsList, selectedTab]);

  // const handleCreateEvent = async (data: Event) => {
  //   await dispatch(createEvent(data));
  //   setIsCreateDialogOpen(false);
  // };

  useEffect(() => {
    if (error) {
      toast.error("אירעה שגיאה בטעינת האירועים");
    }
  }, [error]);

  if (loadingList) return <p>טוען אירועים...</p>;

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">האירועים שלי</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="ml-2 h-4 w-4" />
          צור אירוע חדש
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="הכל">הכל</TabsTrigger>
          <TabsTrigger value="מתוכנן">מתוכנן</TabsTrigger>
          <TabsTrigger value="הושלם">הושלם</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {eventsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {eventsList.map((event:Event) => (
                <Card key={event._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{event.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{event.type}</p>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>תאריך:</span>
                        <span>{formatEventDate(event.date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>מיקום:</span>
                        <span>{event.locationRegion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>אורחים:</span>
                        <span>{event.estimatedGuests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>תקציב:</span>
                        <span>₪{event.budget?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setViewingEvent(event)}
                      >
                        <Eye className="ml-2 h-4 w-4" />
                        צפה
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">אין אירועים להצגה</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  צור אירוע ראשון
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-center my-4 gap-2">
        <Button disabled={page === 1} onClick={() => setPage(page - 1)}>הקודם</Button>
        <span>עמוד {page}</span>
        <Button disabled={eventsList.length < pageSize} onClick={() => setPage(page + 1)}>הבא</Button>
      </div>

      {/* יצירת אירוע */}
      <EventFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        // onSubmit={handleCreateEvent}
      />

      {/* פירוט אירוע */}
      {viewingEvent && (
        <EventDetailsDialog
          event={viewingEvent}
          open={!!viewingEvent}
          onOpenChange={(open) => !open && setViewingEvent(null)}
        />
      )}
    </div>
  );
}
