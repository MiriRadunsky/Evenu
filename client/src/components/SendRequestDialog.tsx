import React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { Supplier } from "../types/Supplier";

interface SendRequestDialogProps {
  supplier: Supplier;
  events: any[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
//   onSubmit: (data: { eventId: string; requestMessage: string }) => Promise<void>;
  onSubmit: any;
  isLoading: boolean;
}

export const SendRequestDialog = ({
  supplier,
  events,
  open,
  onOpenChange,
  onSubmit,
  isLoading,
}: SendRequestDialogProps) => {
  const [eventId, setEventId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setEventId("");
      setRequestMessage("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ eventId, requestMessage });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>שליחת בקשה ל{supplier.user.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="event">בחר אירוע</Label>
            <Select value={eventId} onValueChange={setEventId} required>
              <SelectTrigger>
                <SelectValue placeholder="בחר אירוע" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.eventName} - {event.eventType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">הודעה לספק</Label>
            <Textarea
              id="message"
              value={requestMessage}
              onChange={(e:any) => setRequestMessage(e.target.value)}
              placeholder="כתוב הודעה לספק..."
              rows={4}
              required
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "שולח..." : "שלח בקשה"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};