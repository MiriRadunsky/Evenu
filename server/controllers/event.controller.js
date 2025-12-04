import {
  createEvent,
  getEventById,
  getEventTypes,
  getUserEvents,
  updateEvent,
  deleteEvent
} from "../services/event.service.js";

export async function create(req, res) {
  const event = await createEvent(req.user._id, req.body);
  res.status(201).json({ success: true, data: event });
}

export async function getById(req, res) {
  const event = await getEventById(req.params.id, req.user._id);
  res.json({ success: true, data: event });
}

export function eventTypes(req, res) {
  const data = getEventTypes();

  if (!data) {
    throw new AppError(404, "No event types found");
  }

  res.json({ success: true, data });
}

export async function list(req, res) {
  const eventsArray = await getUserEvents(req.user._id);
  res.json({ success: true, events: eventsArray });
}

export async function update(req, res) {
  const event = await updateEvent(req.params.id, req.user._id, req.body);
  res.json({ success: true, data: event });
}

export async function remove(req, res) {
  await deleteEvent(req.params.id, req.user._id);
  res.json({ success: true, message: 'The event deleted successfully' });
}