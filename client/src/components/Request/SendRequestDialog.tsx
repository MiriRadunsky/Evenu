import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import type { Supplier } from "../../types/Supplier";
import type { Event } from "../../types/Event";
import type { AppDispatch, RootState } from "../../store";
import { fetchRelevantEvents } from "../../store/eventsSlice";

interface SendRequestDialogProps {
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { eventId: string; requestMessage: string; supplierId: string }) => Promise<void>;
  isLoading: boolean;
  isSending: boolean;
}

export const SendRequestDialog = ({
  supplier,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  isSending,
}: SendRequestDialogProps) => {
  const { eventsList, loadingList } = useSelector(
      (state: RootState) => state.events);
  console.log("events", eventsList);
  
  const dispatch: AppDispatch = useDispatch();

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [requestMessage, setRequestMessage] = useState("");

  const supplierId = supplier._id;

  // טוען אירועים רלוונטיים
  useEffect(() => {
    dispatch(fetchRelevantEvents());
  }, [dispatch]);

  // בוחר את האירוע הראשון אוטומטית
  useEffect(() => {
    if (open && eventsList?.length > 0) {
      setSelectedEvent(eventsList[0]);
    }
  }, [open, eventsList]);

  // ניקוי השדות כשסוגרים
  useEffect(() => {
    if (!open) {
      setSelectedEvent(null);
      setRequestMessage("");
    }
  }, [open]);

  const isRegionMismatch = selectedEvent && supplier.regions !== selectedEvent.locationRegion;
  console.log("aaa", supplier.regions, selectedEvent?.locationRegion);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || isRegionMismatch) return;

    await onSubmit({ eventId: selectedEvent._id, requestMessage, supplierId });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>שליחת בקשה ל{supplier.user.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* בחירת אירוע */}
          <div className="space-y-2">
            <Label>בחר אירוע</Label>
            <Select
              value={selectedEvent?._id || ""}
              onValueChange={(id) => {
                const ev = eventsList.find((e) => e._id === id) || null;
                setSelectedEvent(ev);
              }}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingList ? "טוען..." : "בחר אירוע"} />
              </SelectTrigger>
              <SelectContent>
                {eventsList?.map((event: Event) => (
                  <SelectItem key={event._id} value={event._id}>
                    {event.name} - {event.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* הודעה לספק */}
          <div className="space-y-2">
            <Label>הודעה לספק (לפחות 5 תווים)</Label>
            <Textarea
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder="כתוב הודעה לספק (לפחות 5 תווים)..."
              rows={4}
              required
              minLength={5}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !selectedEvent || Boolean(isRegionMismatch)}>
              {isRegionMismatch
                ? "אזור הספק לא תואם לאירוע"
                : isSending
                  ? "שולח..."
                  : "שלח בקשה"}
            </Button>
            {isRegionMismatch && (
              <p className="text-sm text-red-500 mt-1">
                לא ניתן לשלוח בקשה – אזור הספק אינו תואם את אזור האירוע
              </p>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
