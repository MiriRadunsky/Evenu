import * as eventService from '../services/event.service.js';

export async function create(req, res) {
  const event = await eventService.createEvent(req.user._id, req.body);
  res.status(201).json({ success: true, data: event });
}

export async function getById(req, res) {
  const event = await eventService.getEventById(req.params.id, req.user._id);
  res.json({ success: true, data: event });
}

export async function list(req, res) {
  const result = await eventService.getUserEvents(req.user._id, req.query);
  res.json({ success: true, ...result });
}

export async function update(req, res) {
  const event = await eventService.updateEvent(req.params.id, req.user._id, req.body);
  res.json({ success: true, data: event });
}

export async function remove(req, res) {
  await eventService.deleteEvent(req.params.id, req.user._id);
  res.json({ success: true, message: 'The event deleted successfully' });}