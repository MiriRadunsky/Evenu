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
  isSending:boolean
}

export const SendRequestDialog = ({
  supplier,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  isSending,
}: SendRequestDialogProps) => {

  const { eventsList, loadingList } = useSelector((state: RootState) => state.events);
  const dispatch: AppDispatch = useDispatch();

  const [eventId, setEventId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  // קובע supplierId מהקומפוננטה (אין צורך ב־state נוסף)
  const supplierId = supplier._id;

  useEffect(() => {
    dispatch(fetchRelevantEvents());    
  }, [dispatch]);

  // בחירת אירוע ראשון אוטומטית
  useEffect(() => {
    if (open && eventsList?.length > 0) {
      setEventId(eventsList[0]._id);
    }
  }, [open, eventsList]);

  // ניקוי השדות כשסוגרים
  useEffect(() => {
    if (!open) {
      setEventId("");
      setRequestMessage("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('📤 Sending request:', { eventId, requestMessage, supplierId });
    
    await onSubmit({
      eventId,
      requestMessage,
      supplierId       
    });
    
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
            <Select value={eventId} onValueChange={setEventId} required>
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
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRequestMessage(e.target.value)}
              placeholder="כתוב הודעה לספק (לפחות 5 תווים)..."
              rows={4}
              required
              minLength={5}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading || !eventId}>
              {isSending ? "שולח..." : "שלח בקשה"}
            </Button>
          </DialogFooter>

        </form>
      </DialogContent>
    </Dialog>
  );
};
