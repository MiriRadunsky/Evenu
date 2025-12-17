import { AppError } from "../middlewares/error.middleware.js";
import * as repo from "../repositories/event.repository.js";
import { EVENT_TYPES } from "../shared/eventTypes.shared.js";

function buildPagination(total, page, limit) {
  return {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}
export async function updateBudgetAllocated(eventId, userId, amount, session) {
  const event = await repo.getEventById(eventId);
  if (!event) {
    throw new AppError(404, "האירוע לא נמצא");
  }
 
const eventDate = new Date(event.date);

if (!event.date || isNaN(eventDate.getTime())) {
  throw new AppError(400, "תאריך האירוע אינו תקין");
}

if (eventDate < new Date()) {
  throw new AppError(400, "אין להשתמש בתקציב לאחר התחלה של האירוע");
}

  const ownerId =
    event.ownerId?._id?.toString?.() ?? event.ownerId?.toString?.();

  if (ownerId !== userId.toString()) {
    throw new AppError(403, "אין לך הרשאה להשתמש בתקציב של אירוע זה");
  }
  console.log("sign", eventId, amount, session);

  const updatedEvent = await repo.updateBudgetAllocated(
    eventId,
    amount,
    session
  );
  if (!updatedEvent) {
    throw new AppError(
      400,
      "אין מספיק תקציב זמין עבור החוזה. עדכני תקציב לפני החתימה."
    );
  }

  return updatedEvent;
}
export async function createEvent(ownerId, data) {
  const eventData = { ...data, ownerId };

  if (typeof data.budget === "number") {
    eventData.budgetHistory = [
      {
        oldValue: data.budget,
        newValue: data.budget,
        changedBy: ownerId,
        reason: "תקציב התחלתי",
      },
    ];
  }

  const event = await repo.create(eventData);
  return { ...event.toObject(), status: event.autoStatus };
}
export async function getUserRelevantEvents(ownerId, query) {
  const events = await repo.findRelevantByOwnerId(ownerId, query);
  console.log('📋 Relevant events for user:', events.length, 'events');
  return { events };
}
export async function getEventById(id, ownerId) {
  const event = await repo.getEventById(id);

  if (!event) {
    throw new AppError(404, "האירוע לא נמצא");
  }

  const eventOwnerId =
    event.ownerId?._id?.toString?.() ?? event.ownerId?.toString?.();
  console.log(eventOwnerId, ownerId);

  if (eventOwnerId !== ownerId.toString()) {
    throw new AppError(403, "אין לך הרשאה לצפות באירוע הזה");
  }
  return { ...event.toObject(), status: event.autoStatus };
}
export function getEventTypes() {
  return EVENT_TYPES;
}
export async function getUserEventsPaged(ownerId, query) {
  const { items, total, page, limit } = await repo.findByOwnerId(
    ownerId,
    query
  );

  return {
    events: items,
    pagination: buildPagination(total, page, limit),
  };
}
export async function getUserEvents(ownerId, query = {}) {
  const { items, total, page, limit } = await repo.findByOwnerId(
    ownerId,
    query
  );

  const events = items
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((e) => ({
      ...e.toObject(),
      status: e.autoStatus,
    }));

  return {
    events,
    total,
    page,
    limit,
  };
}
export async function updateEvent(id, ownerId, data) {
  const event = await repo.updateById(id, ownerId, data);
  if (!event) {
    throw new AppError(404, "האירוע לא נמצא או אין לך הרשאה לעדכן את האירוע");
  }

  return event;
}
export async function deleteEvent(id, ownerId) {
  const event = await repo.deleteById(id, ownerId);

  if (!event) {
    throw new AppError(404, "האירוע לא נמצא או אין לך הרשאה למחוק את האירוע");
  }

  return event;
}
export async function updateEventBudget(eventId, userId, newBudget, reason) {
  const event = await repo.getEventById(eventId);
  if (!event) {
    throw new AppError(404, "האירוע לא נמצא");
  }

  const ownerId =
    event.ownerId?._id?.toString?.() ?? event.ownerId?.toString?.();

  if (ownerId !== userId.toString()) {
    throw new AppError(403, "אין לך הרשאה לעדכן את האירוע");
  }
  if (newBudget < event.budgetAllocated) {
    throw new AppError(
      400,
      "מינימום תקציב האירוע הוא " +
        event.budgetAllocated +
        ' ש"ח עבור חוזים שנחתמו כבר'
    );
  }
  const oldValue = event.budget ?? 0;

  const historyRecord = {
    oldValue,
    newValue: newBudget,
    changedBy: userId,
    reason,
  };

  const updated = await repo.updateBudget(
    eventId,
    ownerId,
    newBudget,
    historyRecord
  );
  if (!updated) {
    throw new AppError(400, "עדכון התקציב נכשל");
  }

  return updated;
}
