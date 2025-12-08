export interface Thread {
  _id: string;            // מזהה ה-thread
  userId: string;          // מזהה הלקוח
  supplierId?: string;     // מזהה הספק
  eventId?: string;        // מזהה האירוע (אם יש)
  createdAt?: string;
  updatedAt?: string;

  // שמות להצגה בצד המשתמש והספק
  supplierName?: string;   // שם הספק
  clientName?: string;     // שם הלקוח
  eventName?: string;      // שם האירוע

  status?: string;         // סטטוס הבקשה/השיחה
  hasUnread: boolean;      // האם יש הודעות שלא נקראו
}
