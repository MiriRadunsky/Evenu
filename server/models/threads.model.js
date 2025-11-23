import mongoose from "mongoose";

const threadSchema = new mongoose.Schema(
  {
    // קישור לבקשה
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplierRequest",
      required: true,
    },

    // הספק שהשיחה מולו
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    // המשתמש שפתח את הבקשה
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // יוצר createdAt + updatedAt אוטומטית
  }
);

export default mongoose.model("Thread", threadSchema);
