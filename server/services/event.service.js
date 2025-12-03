import { AppError } from '../middlewares/error.middleware.js';
import * as repo from '../repositories/event.repository.js';
import { EVENT_TYPES } from '../shared/eventTypes.shared.js';

/**
 * יצירת אירוע חדש
 */
export async function createEvent(ownerId, data) {
  const event = await repo.create({ ...data, ownerId });
  return { ...event.toObject(), autoStatus: event.autoStatus };
}

/**
 * קבלת אירוע לפי ID
 */
export async function getEventById(id, ownerId) {
  const event = await repo.findById(id);

  if (!event) {
    throw new AppError(404, 'האירוע לא נמצא');
  }

  if (event.ownerId._id.toString() !== ownerId.toString()) {
    throw new AppError(403, 'אין לך הרשאה לצפות באירוע הזה');
  }

  return { ...event.toObject(), autoStatus: event.autoStatus };
}

/**
 * קבלת סוגי אירועים
 */
export function getEventTypes() {
  return EVENT_TYPES;
}

export async function getUserEvents(ownerId) {
  const events = await repo.findByOwnerId(ownerId);

  const eventsWithStatus = events.items
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(e => ({ ...e.toObject(), autoStatus: e.autoStatus }));

  return eventsWithStatus;
}

/**
 * עדכון אירוע
 */
export async function updateEvent(id, ownerId, data) {
  const event = await repo.updateById(id, ownerId, data);

  if (!event) {
    throw new AppError(404, 'האירוע לא נמצא או שאין לך הרשאה לעדכן אותו');
  }

  return { ...event.toObject(), autoStatus: event.autoStatus };
}

/**
 * מחיקת אירוע
 */
export async function deleteEvent(id, ownerId) {
  const event = await repo.deleteById(id, ownerId);

  if (!event) {
    throw new AppError(404, 'האירוע לא נמצא או שאין לך הרשאה למחוק אותו');
  }

  return { ...event.toObject(), autoStatus: event.autoStatus };
}
