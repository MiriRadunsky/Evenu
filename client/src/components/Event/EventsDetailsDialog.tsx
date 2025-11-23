import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {Button} from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../store/eventsSlice";
import type { RootState } from "../../store";
import { formatEventDate } from "../../Utils/DataUtils";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface EventDetailsDialogProps {
  event: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EventDetailsDialog = ({
  event,
  open,
  onOpenChange,
}: EventDetailsDialogProps) => {
    
  const dispatch = useDispatch();
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const events = useSelector((state: RootState) => state.events.eventsList);

  // כאן אפשר לדמות "המלצות" – למשל לקרוא API דרך slice אם קיים
  const handleGetRecommendations = async () => {
    if (!event.eventType || !event.location || !event.budget || !event.guestCount) {
      toast.error("נא למלא את כל פרטי האירוע לקבלת המלצות");
      return;
    }

    try {
      // כאן אפשר לבצע קריאה ל-API דרך thunk (אם יצרת thunk כזה)
      // לדוגמה: dispatch(fetchRecommendations(event))
      // לעכשיו נשתמש בדמה
      const simulatedResult = [
        {
          supplierName: "ספק לדוגמה 1",
          category: "קייטרינג",
          matchScore: 95,
          reasoning: "מתאים לתקציב ולאירוע",
        },
        {
          supplierName: "ספק לדוגמה 2",
          category: "צילום",
          matchScore: 88,
          reasoning: "מומלץ לאירועים בגודל כזה",
        },
      ];
      setRecommendations(simulatedResult);
      setShowRecommendations(true);
      toast.success("המלצות נוצרו בהצלחה");
    } catch (error) {
      toast.error("שגיאה בקבלת המלצות");
    }
  };

  // דוגמה להצגת requests/contracts/payments – אפשר לשמור ב-slice אם רוצים
  const requests = []; // או state מסוים ב-slice
  const contracts = [];
  const payments = [];

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
              {event.notes && (
                <div>
                  <span className="text-muted-foreground">הערות:</span>
                  <p className="mt-1">{event.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div>
            <Button onClick={handleGetRecommendations} className="w-full">
              <Sparkles className="ml-2 h-4 w-4" />
              קבל המלצות ספקים
            </Button>
          </div>

          {showRecommendations && recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>המלצות ספקים</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{rec.supplierName}</p>
                          <p className="text-sm text-muted-foreground">{rec.category}</p>
                        </div>
                        <Badge variant="outline">התאמה: {rec.matchScore}%</Badge>
                      </div>
                      <p className="text-sm">{rec.reasoning}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {requests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>בקשות שנשלחו</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {requests.length} בקשות נשלחו לספקים
                </p>
              </CardContent>
            </Card>
          )}

          {contracts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>חוזים</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {contracts.length} חוזים פעילים
                </p>
              </CardContent>
            </Card>
          )}

          {payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>תשלומים</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {payments.length} תשלומים רשומים
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default EventDetailsDialog;