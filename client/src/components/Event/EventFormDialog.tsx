import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { createEvent, fetchEventTypes } from "../../store/eventsSlice";
import type { AppDispatch, RootState } from "../../store";
import { toast } from "sonner";

// Wrapper עבור Input עם מסגרת זהובה בעת ריחוף
const GoldInput = (props: any) => (
    <Input
        {...props}
        className={`border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 ${props.className || ""}`}
    />
);

interface EventFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EventFormDialog = ({ open, onOpenChange }: EventFormDialogProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { types: eventTypes, loadingList } = useSelector((state: RootState) => state.events);

    const [formData, setFormData] = useState({
        name: "",
        type: "",
        date: "",
        locationRegion: "",
        budget: "",
        estimatedGuests: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // טען סוגי אירועים
    useEffect(() => {
        dispatch(fetchEventTypes());
    }, [dispatch]);

    // פונקציית בדיקות ידניות
    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) newErrors.name = "שם האירוע הוא שדה חובה";
        else if (formData.name.trim().length < 2) newErrors.name = "שם האירוע חייב להכיל לפחות 2 תווים";
        else if (formData.name.trim().length > 100) newErrors.name = "שם האירוע לא יכול להכיל יותר מ-100 תווים";

        if (!formData.type) newErrors.type = "יש לבחור סוג אירוע";
        else if (!eventTypes.includes(formData.type)) newErrors.type = `סוג האירוע לא תקין. אפשרויות: ${eventTypes.join(", ")}`;

        if (!formData.date) newErrors.date = "תאריך האירוע הוא חובה";
        else if (new Date(formData.date) < new Date(new Date().toISOString().split("T")[0]))
            newErrors.date = "תאריך האירוע חייב להיות בעתיד";

        if (formData.estimatedGuests) {
            const guests = Number(formData.estimatedGuests);
            if (!Number.isInteger(guests) || guests < 1 || guests > 10000) newErrors.estimatedGuests = "מספר האורחים חייב להיות מספר שלם בין 1 ל-10,000";
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

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
        setErrors({ ...errors, [field]: "" });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        try {
            await dispatch(
                createEvent({
                    ...formData,
                    budget: formData.budget ? parseFloat(formData.budget) : undefined,
                    estimatedGuests: formData.estimatedGuests ? parseInt(formData.estimatedGuests) : undefined,
                })
            ).unwrap();

            toast.success("האירוע נוצר בהצלחה!");

            onOpenChange(false);
        }  catch (err: any) {
    console.error("Error saving event:", err);

    const errorText = String(err);

    // אם כל חריגה מהשרת/רשת, סגור את הדיאלוג
    if (errorText.includes("Error creating event") || 
        errorText.includes("Network") || 
        errorText.includes("ERR_CONNECTION_REFUSED")) 
    {
        toast.error("השרת אינו זמין כרגע");
        onOpenChange(false); // סגירת הדיאלוג
        return;
    }

    // אחרת, שגיאה רגילה - נשאר בטופס
    toast.error("אירעה שגיאה בעת שמירת האירוע");
}
    finally {
        setIsSubmitting(false);
    }
};

const isLoading = isSubmitting || loadingList;

return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800" style={{ direction: "rtl" }}>
            <DialogHeader>
                <DialogTitle>יצירת אירוע חדש</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="eventName">שם האירוע</Label>
                    <GoldInput
                        id="eventName"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        required
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="eventType">סוג אירוע</Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) => handleChange("type", value)}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="בחר סוג אירוע" />
                        </SelectTrigger>
                        <SelectContent>
                            {loadingList ? (
                                <SelectItem value="">טוען...</SelectItem>
                            ) : (
                                eventTypes?.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {type}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="eventDate">תאריך האירוע</Label>
                    <GoldInput
                        id="eventDate"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleChange("date", e.target.value)}
                        required
                    />
                    {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="guestCount">מספר אורחים</Label>
                        <GoldInput
                            id="guestCount"
                            type="number"
                            value={formData.estimatedGuests}
                            onChange={(e) => handleChange("estimatedGuests", e.target.value)}
                        />
                        {errors.estimatedGuests && <p className="text-red-500 text-sm">{errors.estimatedGuests}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="budget">תקציב (₪)</Label>
                        <GoldInput
                            id="budget"
                            type="number"
                            value={formData.budget}
                            onChange={(e) => handleChange("budget", e.target.value)}
                        />
                        {errors.budget && <p className="text-red-500 text-sm">{errors.budget}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location">מיקום</Label>
                    <GoldInput
                        id="location"
                        value={formData.locationRegion}
                        onChange={(e) => handleChange("locationRegion", e.target.value)}
                    />
                    {errors.locationRegion && <p className="text-red-500 text-sm">{errors.locationRegion}</p>}
                </div>

                <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "שומר..." : "שמור"}
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
);
};
