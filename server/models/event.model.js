import { Schema, model, Types } from "mongoose";
import { EVENT_TYPES } from "../shared/eventTypes.shared.js";
const budgetHistorySub = new Schema(
  {
    oldValue: { type: Number, required: true },
    newValue: { type: Number, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: Types.ObjectId, ref: "User" }, // מי עשה את השינוי
    reason: { type: String }, // אופציונלי: "הוספנו עוד ספק צילום" וכו'
  },
  { _id: false }
);


const eventSchema = new Schema(
  {
    ownerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, trim: true, required: true },
    type: {
      type: String,
      enum: EVENT_TYPES,
      default: "אחר",
      required: true,
    },
    date: { type: Date, index: true, required: true },
    locationRegion: { type: String, trim: true },
    budget: { type: Number },
    budgetHistory: [budgetHistorySub],
    budgetAllocated: { type: Number, default: 0 },
    estimatedGuests: { type: Number, required: true },
  },
  { timestamps: true }
);

// אינדקס לביצועים
// eventSchema.index({ ownerId: 1, date: 1 });

// // סטטוס אוטומטי לפי תאריך
// eventSchema.virtual('autoStatus').get(function () {
//   const now = new Date();

//   if (this.status === 'בוטל') return 'בוטל';
//   if (this.date < now.setHours(0, 0, 0, 0)) return 'הושלם';
//   if (
//     this.date.toDateString() === new Date().toDateString() &&
//     this.status !== 'בוטל'
//   )
//     return 'בפעולה';
//   return this.status;
// });
eventSchema.virtual("autoStatus").get(function () {
  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  // אם בוטל – תמיד בוטל
  if (this.status === "בוטל") return "בוטל";

  const eventDate = this.date instanceof Date ? this.date : new Date(this.date);

  // עבר
  if (eventDate < startOfToday) return "הושלם";

  // היום
  if (eventDate >= startOfToday && eventDate <= endOfToday) {
    return "בפעולה";
  }

  // עתידי
  return this.status ?? "מתוכנן";
});

export default model('Event', eventSchema);
