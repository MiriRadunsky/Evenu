// // import React from "react";
// // import { useState, useEffect } from "react";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// //   DialogFooter,
// // } from "../components/ui/dialog";
// // import { Button } from "../components/ui/button";
// // import { Label } from "../components/ui/label";
// // import { Textarea } from "../components/ui/textarea";
// // import {
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from "../components/ui/select";
// // import type { Supplier } from "../types/Supplier";

// // interface SendRequestDialogProps {
// //   supplier: Supplier;
// //   events: any[];
// //   open: boolean;
// //   onOpenChange: (open: boolean) => void;
// // //   onSubmit: (data: { eventId: string; requestMessage: string }) => Promise<void>;
// //   onSubmit: any;
// //   isLoading: boolean;
// // }

// // export const SendRequestDialog = ({
// //   supplier,
// //   events,
// //   open,
// //   onOpenChange,
// //   onSubmit,
// //   isLoading,
// // }: SendRequestDialogProps) => {
// //   const [eventId, setEventId] = useState("");
// //   const [requestMessage, setRequestMessage] = useState("");

// //   useEffect(() => {
// //     if (!open) {
// //       setEventId("");
// //       setRequestMessage("");
// //     }
// //   }, [open]);

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     await onSubmit({ eventId, requestMessage });
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={onOpenChange}>
// //       <DialogContent className="sm:max-w-[500px]" style={{ direction: "rtl" }}>
// //         <DialogHeader>
// //           <DialogTitle>שליחת בקשה ל{supplier.user.name}</DialogTitle>
// //         </DialogHeader>
// //         <form onSubmit={handleSubmit} className="space-y-4">
// //           <div className="space-y-2">
// //             <Label htmlFor="event">בחר אירוע</Label>
// //             <Select value={eventId} onValueChange={setEventId} required>
// //               <SelectTrigger>
// //                 <SelectValue placeholder="בחר אירוע" />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {events.map((event) => (
// //                   <SelectItem key={event.id} value={event.id}>
// //                     {event.eventName} - {event.eventType}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>
// //           </div>

// //           <div className="space-y-2">
// //             <Label htmlFor="message">הודעה לספק</Label>
// //             <Textarea
// //               id="message"
// //               value={requestMessage}
// //               onChange={(e:any) => setRequestMessage(e.target.value)}
// //               placeholder="כתוב הודעה לספק..."
// //               rows={4}
// //               required
// //             />
// //           </div>

// //           <DialogFooter>
// //             <Button type="submit" disabled={isLoading}>
// //               {isLoading ? "שולח..." : "שלח בקשה"}
// //             </Button>
// //           </DialogFooter>
// //         </form>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // };



// import React, { useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "../components/ui/dialog";
// import { Button } from "../components/ui/button";
// import { Label } from "../components/ui/label";
// import { Textarea } from "../components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../components/ui/select";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchEvents } from "../store/eventsSlice";
// import type { Supplier } from "../types/Supplier";
// import type { Event } from "../types/type";
// import type { RootState } from "../store";

// interface SendRequestDialogProps {
//   supplier: Supplier;
//   open: boolean;
//   events: Event[];
//   onOpenChange: (open: boolean) => void;
//   onSubmit: (data: { eventId: string; requestMessage: string }) => Promise<any>;
//   isLoading: boolean;
// }

// export const SendRequestDialog = ({
//   supplier,
//   open,
//   events,
//   onOpenChange,
//   onSubmit,
//   isLoading,
// }: SendRequestDialogProps) => {

//   const { eventsList, loadingList } = useSelector((state: RootState) => state.events);

//   const [eventId, setEventId] = useState("");
//   const [supplierId, setsupplierId] = useState("");
//   const [requestMessage, setRequestMessage] = useState("");

//   // --- טעינת אירועים בפתיחת הדיאלוג ---
//   // useEffect(() => {
//   //   if (open) {
//   //     dispatch(fetchEvents());
//   //   }
//   // }, [open]);

//   // --- בחירת אירוע ראשון אוטומטית ---
//   useEffect(() => {
//     if (open && eventsList?.length > 0) {
//       setEventId(eventsList[0]._id); // בוחר את הראשון
//     }
//   }, [open, eventsList]);

//   // --- ניקוי שדות ביציאה ---
//   useEffect(() => {
//     if (!open) {
//       setEventId("");
//       setRequestMessage("");
//     }
//   }, [open]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await onSubmit({ eventId, requestMessage });
// console.log('הבקשה נשלחה');

//       // toast({
//       //   title: "הבקשה נשלחה",
//       //   description: "ההודעה הועברה לספק בהצלחה",
//       // });

//       onOpenChange(false);
//     } catch (err: any) {
//       console.log('error');
      
//       // toast({
//       //   title: "שגיאה בשליחה",
//       //   description: err?.message || "משהו השתבש",
//       //   variant: "destructive",
//       // });
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]" style={{ direction: "rtl" }}>
//         <DialogHeader>
//           <DialogTitle>שליחת בקשה ל{supplier.user.name}</DialogTitle>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* בחירת אירוע */}
//           <div className="space-y-2">
//             <Label htmlFor="event">בחר אירוע</Label>
//             <Select value={eventId} onValueChange={setEventId} required>
//               <SelectTrigger>
//                 <SelectValue placeholder={loadingList ? "טוען..." : "בחר אירוע"} />
//               </SelectTrigger>
//               <SelectContent>
//                 {eventsList?.map((event: Event) => (
//                   <SelectItem key={event._id} value={event._id}>
//                     {event.name} - {event.type}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           {/* הודעה לספק */}
//           <div className="space-y-2">
//             <Label htmlFor="message">הודעה לספק</Label>
//             <Textarea
//               id="message"
//               value={requestMessage}
//               onChange={(e: any) => setRequestMessage(e.target.value)}
//               placeholder="כתוב הודעה לספק..."
//               rows={4}
//               required
//             />
//           </div>

//           <DialogFooter>
//             <Button type="submit" disabled={isLoading || !eventId}>
//               {isLoading ? "שולח..." : "שלח בקשה"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// };

import React, { useState, useEffect } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import type { Supplier } from "../types/Supplier";
import type { Event } from "../types/type";
import type { AppDispatch, RootState } from "../store";
import { fetchEvents } from "../store/eventsSlice";

interface SendRequestDialogProps {
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { eventId: string;  requestMessage: string ;supplierId: string;}) => Promise<any>;
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
    dispatch(fetchEvents());
  }, []);

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
            <Label>הודעה לספק</Label>
            <Textarea
              value={requestMessage}
              onChange={(e: Event) => setRequestMessage(e.target.value)}
              placeholder="כתוב הודעה לספק..."
              rows={4}
              required
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
