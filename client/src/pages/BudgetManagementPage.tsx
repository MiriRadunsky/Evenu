// pages/BudgetManagementPage.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  fetchBudgetEvents,
  updateBudget,
} from "../store/budgetSlice";
import type { BudgetHistoryItem } from "@/types/Budget";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { Wallet, Calendar, ArrowUpRight } from "lucide-react";
import type { Event } from "@/types/Event";

export default function BudgetManagementPage() {
  const dispatch: AppDispatch = useDispatch();
  const { events, loading, error } = useSelector(
    (state: RootState) => state.budget
  );

  const [selectedEventId, setSelectedEventId] = useState<string>("all");
  const [newBudget, setNewBudget] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  useEffect(() => {
    dispatch(fetchBudgetEvents());
  }, [dispatch]);

  const selectedEvent: Event | null = useMemo(() => {
    if (selectedEventId === "all") return null;
    return events.find((e) => e._id === selectedEventId) || null;
  }, [events, selectedEventId]);

  const { totalBudget, totalAllocated } = useMemo(() => {
    const targetEvents = selectedEvent ? [selectedEvent] : events;
    const totalBudget = targetEvents.reduce(
      (sum, e) => sum + (e.budget || 0),
      0
    );
    const totalAllocated = targetEvents.reduce(
      (sum, e) => sum + (e.budgetAllocated || 0),
      0
    );
    return { totalBudget, totalAllocated };
  }, [events, selectedEvent]);

  const remaining = totalBudget - totalAllocated;
  const usedPercent =
    totalBudget > 0 ? Math.round((totalAllocated / totalBudget) * 100) : 0;

  const handleSubmitBudget = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) {
      toast.error("נא לבחור אירוע לעדכון תקציב");
      return;
    }

    const parsed = Number(newBudget);
    if (Number.isNaN(parsed) || parsed < 0) {
      toast.error("התקציב חייב להיות מספר גדול או שווה ל־0");
      return;
    }

    if (parsed < (selectedEvent.budgetAllocated || 0)) {
      toast.error("אי אפשר לקבוע תקציב קטן מהסכום שכבר הוקצה");
      return;
    }

    try {
      await dispatch(
        updateBudget({
          eventId: selectedEvent._id,
          newBudget: parsed,
          reason: reason || "עדכון תקציב",
        })
      ).unwrap();
      toast.success("התקציב עודכן בהצלחה");
      setNewBudget("");
      setReason("");
    } catch (err:string | unknown) {
     const errorText = String(err);
      toast.error(errorText);
    }
  };

  const history: BudgetHistoryItem[] = useMemo(() => {
    if (!selectedEvent?.budgetHistory) return [];
    return [...selectedEvent.budgetHistory].sort(
      (a, b) =>
        new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
    );
  }, [selectedEvent]);

  const maxBudgetInHistory =
    history.length > 0
      ? Math.max(...history.map((h) => h.newValue || 0))
      : 0;

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-black">ניהול תקציב</h1>
        </div>
      </div>

      {/* סינון לפי אירוע */}
      <Card className="border border-primary/30 rounded-xl bg-white">
        <CardContent className="py-4">
          <div className="flex flex-col gap-2">
            <Label className="text-sm font-medium text-black">
              סנן לפי אירוע
            </Label>
            <Select
              value={selectedEventId}
              onValueChange={setSelectedEventId}
            >
              <SelectTrigger className="w-full md:w-80">
                <SelectValue placeholder="בחר אירוע" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל האירועים</SelectItem>
                {events.map((e) => (
                  <SelectItem key={e._id} value={e._id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* כרטיס תקציב ראשי */}
      <Card className="border border-primary/30 rounded-xl bg-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold text-black">
              {selectedEvent ? selectedEvent.name : "סיכום כל האירועים"}
            </CardTitle>
            {selectedEvent && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>
                  {new Date(selectedEvent.date).toLocaleDateString("he-IL", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-1 text-sm text-slate-700">
            <span>תקציב כולל</span>
            <span className="text-lg font-bold text-primary">
              ₪{totalBudget.toLocaleString()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* שלושת המספרים */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-xs text-muted-foreground mb-1">
                תקציב שהוצא
              </div>
              <div className="text-lg font-semibold text-black">
                ₪{totalAllocated.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">
                {usedPercent}% מנוצל
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">
                תקציב נותר
              </div>
              <div className="text-lg font-semibold text-primary">
                ₪{remaining.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="text-xs text-muted-foreground mb-1">
                סטטוס שימוש
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge
                  variant="outline"
                  className="border border-primary/40 bg-primary/5 text-black"
                >
                  {usedPercent <= 70
                    ? "במסגרת התקציב"
                    : usedPercent < 100
                    ? "קרוב לגבול"
                    : "חריגה"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {usedPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* progress bar שימוש */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 ₪</span>
              <span>תקציב: ₪{totalBudget.toLocaleString()}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-primary/5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>
          </div>

          {/* טופס עדכון תקציב */}
          {selectedEvent && (
            <form
              onSubmit={handleSubmitBudget}
              className="mt-4 border-t border-slate-200 pt-4 grid gap-4 md:grid-cols-[1.2fr,1.2fr,auto]"
            >
              <div className="space-y-1">
                <Label className="text-xs text-black">תקציב חדש (₪)</Label>
                <Input
                  type="number"
                  min={0}
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">
                  לא ניתן לקבוע פחות מ־{" "}
                  {(selectedEvent.budgetAllocated || 0).toLocaleString()} ₪
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-black">סיבת שינוי</Label>
                <Input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="לדוגמה: הוספת ספק צילום"
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" className="w-full md:w-auto">
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                  עדכון תקציב
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* היסטוריה + "גרף" */}
      {selectedEvent && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* היסטוריית תקציב */}
          <Card className="border border-primary/30 rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-black">
                היסטוריית שינויים בתקציב
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {history.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  אין שינויים היסטוריים לתקציב.
                </p>
              )}

              {history.map((h, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between border border-primary/15 rounded-lg p-2"
                >
                  <div className="flex flex-col gap-0.5 text-xs text-slate-800">
                    <span className="font-medium">
                      {new Date(h.changedAt).toLocaleString("he-IL")}
                    </span>
                    <span>
                      {h.oldValue.toLocaleString()} ₪ →{" "}
                      <span className="font-semibold">
                        {h.newValue.toLocaleString()} ₪
                      </span>
                    </span>
                    {h.reason && (
                      <span className="text-[11px] text-muted-foreground">
                        סיבה: {h.reason}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* גרף עמודות קטן */}
          <Card className="border border-primary/30 rounded-xl bg-white">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-black">
                גרף תקציב לאורך זמן
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              {history.length === 0 || maxBudgetInHistory === 0 ? (
                <p>אין מספיק נתונים לגרף.</p>
              ) : (
                <div className="flex items-end gap-3 h-40 mt-2">
                  {history.map((h, idx) => {
                    const height =
                      (h.newValue / maxBudgetInHistory) * 100 || 5;

                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center justify-end gap-1 flex-1 h-full"
                      >
                        <div
                          className="w-full bg-primary/15 border border-primary/50 rounded-t-md"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-[10px] text-center text-slate-600">
                          {new Date(h.changedAt).toLocaleDateString("he-IL")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {loading && (
        <p className="text-xs text-muted-foreground">טוען נתוני תקציב...</p>
      )}
      {error && (
        <p className="text-xs text-destructive">שגיאה: {error}</p>
      )}
    </div>
  );
}
