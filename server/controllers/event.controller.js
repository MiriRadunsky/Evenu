import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import * as eventService from '../services/event.service.js';

export const EventController = {
  // יצירת אירוע
  create: asyncHandler(async (req, res) => {
    const event = await eventService.createEvent(req.user._id, req.body);
    res.status(201).json({ success: true, data: event });
  }),

  updateEventBudget :asyncHandler(async (req, res) => {
  const { id } = req.params;                 
  const userId = req.user._id;               
  const { newBudget, reason } = req.body;

  const updatedEvent = await eventService.updateEventBudget(
    id,
    userId,
    newBudget,
    reason
  );

  res.status(200).json({
    message: "התקציב עודכן בהצלחה",
    event: updatedEvent,
  });
}),

  // אירוע בודד לפי ID
  getById: asyncHandler(async (req, res) => {
    const event = await eventService.getEventById(
      req.params.id,
      req.user._id
    );
    res.status(200).json({ success: true, data: event });
  }),

  // סוגי אירועים
  eventTypes: asyncHandler(async (req, res) => {
    const types = await eventService.getEventTypes();
    res.status(200).json({ success: true, data: types });
  }),

  // 🔹 כל האירועים (בלי פגינציה)
  getAllEvents: asyncHandler(async (req, res) => {
    
    const { events } = await eventService.getUserEvents(
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: events,
    });
  }),

  //תאריך שם ומזהה 🔹 רק אירועים רלוונטיים (תאריכים רלוונטיים)
  getRelevantEvents: asyncHandler(async (req, res) => {
    const { events } = await eventService.getUserRelevantEvents(
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      data: events,
    });
  }),

  // 🔹 גרסה עם פגינציה (אם תרצי להשתמש בעתיד)
  getEventsPaged: asyncHandler(async (req, res) => {
    const result = await eventService.getUserEventsPaged(
      req.user._id,
      req.query
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }),

  // עדכון
  update: asyncHandler(async (req, res) => {
    const event = await eventService.updateEvent(
      req.params.id,
      req.user._id,
      req.body
    );

    res.status(200).json({ success: true, data: event });
  }),

  // מחיקה
  remove: asyncHandler(async (req, res) => {
    await eventService.deleteEvent(req.params.id, req.user._id);
    res.status(200).json({
      success: true,
      message: 'The event deleted successfully',
    });
  }),

  // Fetch events for the logged-in user
  getUserEvents: asyncHandler(async (req, res) => {
    const events = await eventService.getUserEvents(req.user._id, req.query);

    res.status(200).json({
      success: true,
      events,
    });
  }),
};

