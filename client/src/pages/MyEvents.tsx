import { useEffect, useMemo, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";

import {
  fetchEvents,
  createEvent,
  fetchEventTypes,
} from "../store/eventsSlice";

import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Eye, Plus } from "lucide-react";
import { Button } from "../components/ui/button";

import { formatEventDate, getEventStatusProgress } from "../Utils/DataUtils";

import { EventFormDialog } from "../components/Event/EventFormDialog";
import { EventDetailsDialog } from "../components/Event/EventsDetailsDialog";
import { toast } from "sonner";

export default function MyEvents() {
  const dispatch: AppDispatch = useDispatch();
  const { eventsList, loadingList, error, types: eventTypes } = useSelector(
    (state: RootState) => state.events
  );

  const [selectedTab, setSelectedTab] = useState("הכל");
  const [viewingEvent, setViewingEvent] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);


  const eventsFetched = useRef(false);

  useEffect(() => {
    if (!eventsFetched.current) {
      dispatch(fetchEvents());
      eventsFetched.current = true;
    }
  }, [dispatch]);


  const filteredEvents = useMemo(() => {
    if (!eventsList) return [];
    if (selectedTab === "הכל") return eventsList;
    return eventsList.filter((e) => e.status === selectedTab);
  }, [eventsList, selectedTab]);

  const handleCreateEvent = async (data: any) => {
    await dispatch(createEvent(data));
    setIsCreateDialogOpen(false);
  };

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
          <TabsTrigger value="פעיל">פעיל</TabsTrigger>
          <TabsTrigger value="הושלם">הושלם</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
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

      {/* יצירת אירוע */}
      <EventFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateEvent}
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
