import {
  getUserRelevantEvents,
  updateEventBudget,
} from "../services/event.service.js";
import asyncHandler from '../middlewares/asyncHandler.middleware.js';

export const getBudgetEvents = asyncHandler(async (req, res) =>{
    const ownerId = req.user._id;

    const { from, to, status, type } = req.query;

    const { events } = await getUserRelevantEvents(ownerId, {
      from,
      to,
      status,
      type,
    });

    res.status(200).json({ events });
  
})

export const patchEventBudget=asyncHandler(async  (req, res)=> {
  try {
    const ownerId = req.user._id;
    const { eventId } = req.params;
    const { newBudget, reason } = req.body;

    const parsed = Number(newBudget);
    if (Number.isNaN(parsed) || parsed < 0) {
      return res.status(400).json({
        message: "התקציב החדש חייב להיות מספר גדול או שווה ל־0",
      });
    }

    const updated = await updateEventBudget(
      eventId,
      ownerId,
      parsed,
      reason || "עדכון תקציב"
    );

    res.json(updated);
  } catch (err) {
    next(err);
  }
})
