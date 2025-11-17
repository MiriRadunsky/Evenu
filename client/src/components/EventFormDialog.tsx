import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useDispatch, useSelector } from "react-redux";
import { createEvent, updateEvent, fetchEventTypes } from "../store/eventsSlice";
import type { AppDispatch, RootState } from "../store";
import { Button } from "./ui/button";

// קומפוננטת Wrapper עבור Input עם מסגרת זהובה בעת ריחוף
const GoldInput = (props: any) => (
    <Input
        {...props}
        className={`border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 ${props.className || ""}`}
    />
);

const GoldTextarea = (props: any) => (
    <Textarea
        {...props}
        className={`border-gray-300 focus:border-yellow-500 focus:ring-yellow-500 ${props.className || ""}`}
    />
);

interface EventFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: any;
}

export const EventFormDialog = ({ open, onOpenChange, initialData }: EventFormDialogProps) => {
    const dispatch = useDispatch<AppDispatch>();
    const { types: eventTypes, loadingList, loadingOne } = useSelector((state: RootState) => state.events);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        type: "",
        date: "",
        locationRegion: "",
        budget: "",
        estimatedGuests: "",
    });

    useEffect(() => {
        
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                type: initialData.type || "",
                date: initialData.date ? initialData.date.split("T")[0] : "",
                locationRegion: initialData.locationRegion || "",
                budget: initialData.budget?.toString() || "",
                estimatedGuests: initialData.estimatedGuests?.toString() || "",
            });
        } else {
            setFormData({
                name: "",
                type: "",
                date: "",
                locationRegion: "",
                budget: "",
                estimatedGuests: "",
            });
        }
    }, [initialData, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const payload = {
            ...formData,
            budget: formData.budget ? parseFloat(formData.budget) : undefined,
            estimatedGuests: formData.estimatedGuests ? parseInt(formData.estimatedGuests) : undefined,
        };
        try {
            if (initialData?._id) {
                await dispatch(updateEvent({ id: initialData._id, data: payload }));
            } else {
                await dispatch(createEvent(payload));
            }
            onOpenChange(false);
        } catch (error) {
            console.error("Error saving event:", error);
        } finally {
            setIsSubmitting(false);
        }
    };
    const isLoading = isSubmitting || loadingList || loadingOne;
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800" style={{ direction: "rtl" }}>
                <DialogHeader>
                    <DialogTitle>{initialData ? "עריכת אירוע" : "יצירת אירוע חדש"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="eventName">שם האירוע</Label>
                        <GoldInput
                            id="eventName"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eventType">סוג אירוע</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData({ ...formData, type: value })}
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
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="eventDate">תאריך האירוע</Label>
                        <GoldInput
                            id="eventDate"
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="guestCount">מספר אורחים</Label>
                            <GoldInput
                                id="guestCount"
                                type="number"
                                value={formData.estimatedGuests}
                                onChange={(e) => setFormData({ ...formData, estimatedGuests: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="budget">תקציב (₪)</Label>
                            <GoldInput
                                id="budget"
                                type="number"
                                value={formData.budget}
                                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">מיקום</Label>
                        <GoldInput
                            id="location"
                            value={formData.locationRegion}
                            onChange={(e) => setFormData({ ...formData, locationRegion: e.target.value })}
                        />
                    </div>

                    {/* <div className="space-y-2">
                        <Label htmlFor="notes">הערות</Label>
                        <GoldTextarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                        />
                    </div> */}

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
