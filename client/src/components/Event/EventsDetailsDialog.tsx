import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import type { Event } from "@/types/Event";
import { formatEventDate } from "@/Utils/DataUtils";

type EventDetailsDialogProps = {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const EventDetailsDialog = ({
  event,
  open,
  onOpenChange,
}: EventDetailsDialogProps) => {

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
        style={{ direction: "rtl" }}
      >
        <DialogHeader>
          <DialogTitle>פרטי האירוע</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{event.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">סוג אירוע:</span>
                  <p className="font-medium">{event.type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">תאריך:</span>
                  <p className="font-medium">{formatEventDate(event.date)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">מיקום:</span>
                  <p className="font-medium">{event.locationRegion}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">מספר אורחים:</span>
                  <p className="font-medium">{event.estimatedGuests}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">תקציב:</span>
                  <p className="font-medium">₪{event.budget?.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">סטטוס:</span>
                  <Badge>{event.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </DialogContent>
    </Dialog>
  );
};
export default EventDetailsDialog;