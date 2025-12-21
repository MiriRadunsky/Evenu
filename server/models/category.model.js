import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const categorySchema = new Schema(
  {
    label: {
      type: String,
      enum: ['צלם','מסריט', 'תזמורת', 'אולם', 'קייטרינג', 'עיצוב אולמות', 'אחר','מאפרת', 'שמלות כלה', 'עיצוב והדפסת הזמנות','מעצבת שיער', 'מתחם לשבת שבע ברכות', 'זרי פרחים', 'עיצוב ברים',  'שמלות ערב','הסעות', ],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model('Category', categorySchema);
