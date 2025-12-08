import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from "../ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { createEvent, fetchEventTypes } from "../../store/eventsSlice";
import type { AppDispatch, RootState } from "../../store";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import { useCitiesList } from "../../hooks/useCitiesList";

/* ----- טיפוסים ----- */

type EventType =
  | "חתונה"
  | "ברית"
  | "בר מצווה"
  | "בת מצווה"
  | "שבע ברכות"
  | "אחר";

interface Event {
  name: string;
  type?: EventType;
  date?: string;
  locationRegion?: string;
  budget?: number;
  estimatedGuests?: number;
  // שדות נוספים אם יש
}

interface FormData {
  name: string;
  type: EventType | "";
  date: string;
  locationRegion: string;
  budget: string;
  estimatedGuests: string;
}

/* ----- רכיב ----- */

const GoldInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => {
  const className = `${props.className ?? ""} border-gray-300 focus:border-yellow-500 focus:ring-yellow-500`;
  return <Input {...props} className={className} />;
};

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<Event> | null;
}

export const EventFormDialog: React.FC<EventFormDialogProps> = ({
  open,
  onOpenChange,
  initialData = null,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { types: rawEventTypes, loadingList, loadingOne } = useSelector(
    (s: RootState) => s.events
  );

  // מניעת undefined עבור eventTypes
  const eventTypes: EventType[] = (rawEventTypes ?? []) as EventType[];

  const cities = useCitiesList();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    type: "",
    date: "",
    locationRegion: "",
    budget: "",
    estimatedGuests: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");

  useEffect(() => {
    dispatch(fetchEventTypes());
  }, [dispatch]);

  useEffect(() => {
    if (!initialData) return;
    setFormData({
      name: initialData.name ?? "",
      type: (initialData.type as EventType) ?? "",
      date: initialData.date ? initialData.date.split("T")[0] : "",
      locationRegion: initialData.locationRegion ?? "",
      budget: initialData.budget?.toString() ?? "",
      estimatedGuests: initialData.estimatedGuests?.toString() ?? "",
    });
  }, [initialData]);

  const filteredCities = useMemo(() => {
    if (!citySearch) return cities.slice(0, 50);
    return cities.filter((c) => c.includes(citySearch)).slice(0, 50);
  }, [cities, citySearch]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "שם האירוע הוא שדה חובה";
    else if (formData.name.trim().length < 2)
      newErrors.name = "שם האירוע חייב להכיל לפחות 2 תווים";
    else if (formData.name.trim().length > 100)
      newErrors.name = "שם האירוע לא יכול להכיל יותר מ-100 תווים";

    if (!formData.type) newErrors.type = "יש לבחור סוג אירוע";
    else if (!eventTypes.includes(formData.type as EventType))
      newErrors.type = `סוג האירוע לא תקין. אפשרויות: ${eventTypes.join(", ")}`;

    if (!formData.date) newErrors.date = "תאריך האירוע הוא חובה";
    else {
      const chosen = new Date(formData.date);
      const today = new Date(new Date().toISOString().split("T")[0]);
      if (chosen < today) newErrors.date = "תאריך האירוע חייב להיות בעתיד";
    }

    if (formData.estimatedGuests) {
      const guests = Number(formData.estimatedGuests);
      if (!Number.isInteger(guests) || guests < 1 || guests > 10000)
        newErrors.estimatedGuests =
          "מספר האורחים חייב להיות מספר שלם בין 1 ל-10,000";
    } else {
      newErrors.estimatedGuests = "מספר האורחים הוא חובה";
    }

    if (formData.budget) {
      const budget = Number(formData.budget);
      if (isNaN(budget) || budget < 0) newErrors.budget = "תקציב לא תקין";
    }

    if (formData.locationRegion && formData.locationRegion.length > 100)
      newErrors.locationRegion = "אזור המיקום לא יכול להכיל יותר מ-100 תווים";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const payload: Partial<Event> = {
      name: formData.name,
      type: (formData.type || "אחר") as EventType,
      date: formData.date || undefined,
      locationRegion: formData.locationRegion || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      estimatedGuests: formData.estimatedGuests
        ? parseInt(formData.estimatedGuests, 10)
        : undefined,
    };

    try {
      await dispatch(createEvent(payload)).unwrap();
      toast.success("האירוע נוצר בהצלחה!");
      onOpenChange(false);
    } catch (err: unknown) {
      const errorText = String(err);
      if (
        errorText.includes("Error creating event") ||
        errorText.includes("Network") ||
        errorText.includes("ERR_CONNECTION_REFUSED")
      ) {
        toast.error("השרת אינו זמין כרגע");
        onOpenChange(false);
        return;
      }
      toast.error(errorText);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] bg-white dark:bg-gray-800"
        style={{ direction: "rtl" }}
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "עריכת אירוע" : "יצירת אירוע חדש"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* שם האירוע */}
          <div className="space-y-2">
            <Label>שם האירוע</Label>
            <GoldInput
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: (e.target as HTMLInputElement).value })
              }
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* סוג אירוע */}
          <div className="space-y-2">
            <Label>סוג אירוע</Label>
            <Select
              value={formData.type}
              onValueChange={(val: string) =>
                setFormData({ ...formData, type: val as EventType })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="בחר סוג אירוע" />
              </SelectTrigger>
              <SelectContent>
                {loadingList ? (
                  <SelectItem value="אחר">טוען...</SelectItem>
                ) : (
                  eventTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
          </div>

          {/* תאריך */}
          <div className="space-y-2">
            <Label>תאריך האירוע</Label>
            <GoldInput
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: (e.target as HTMLInputElement).value })
              }
            />
            {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
          </div>

          {/* אורחים ותקציב */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>מספר אורחים</Label>
              <GoldInput
                type="number"
                value={formData.estimatedGuests}
                onChange={(e) =>
                  setFormData({ ...formData, estimatedGuests: (e.target as HTMLInputElement).value })
                }
              />
              {errors.estimatedGuests && (
                <p className="text-red-500 text-sm">{errors.estimatedGuests}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>תקציב (₪)</Label>
              <GoldInput
                type="number"
                value={formData.budget}
                onChange={(e) =>
                  setFormData({ ...formData, budget: (e.target as HTMLInputElement).value })
                }
              />
              {errors.budget && <p className="text-red-500 text-sm">{errors.budget}</p>}
            </div>
          </div>

          {/* מיקום */}
          <div className="space-y-2">
            <Label>מיקום (עיר)</Label>
            <Popover open={cityOpen} onOpenChange={setCityOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between border-gray-300 hover:border-yellow-500"
                >
                  {formData.locationRegion || "בחר עיר..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] p-0"
                align="start"
              >
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="חפש עיר..."
                    value={citySearch}
                    onValueChange={(val: string) => setCitySearch(val)}
                    className="h-9"
                  />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>
                      {cities.length === 0 ? "טוען ערים..." : "לא נמצאה עיר"}
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredCities.map((city) => (
                        <CommandItem
                          key={city}
                          value={city}
                          onSelect={(val: string) => {
                            setFormData({ ...formData, locationRegion: val });
                            setCityOpen(false);
                            setCitySearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.locationRegion === city ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.locationRegion && (
              <p className="text-red-500 text-sm">{errors.locationRegion}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || loadingList || loadingOne}>
              {isSubmitting || loadingOne ? "שומר..." : "שמור"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
