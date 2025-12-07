// import { AppError } from '../middlewares/error.middleware.js';
// import * as repo from '../repositories/event.repository.js';
// import { EVENT_TYPES } from '../shared/eventTypes.shared.js';

// export async function createEvent(ownerId, data) {

//   const event = await repo.create({ ...data, ownerId });
//   return event;
// }

// export async function getEventById(id, ownerId) {
//   const event = await repo.findById(id);

//   if (!event) {
//     throw new AppError(404, 'The event doesn\'t exist');
//   }

//   if (event.ownerId._id.toString() !== ownerId.toString()) {
//     throw new AppError(403, 'You are not authorized to view this event');
//   }

//   return event;
// }
// export function getEvevtTypes() {
//   return EVENT_TYPES;

// }

// export async function getUserEvents(ownerId, query) {
//   const { items, total, page, limit } = await repo.findByOwnerId(ownerId, query);

//   return {
//     events: items,
//     pagination: {
//       total,
//       page,
//       limit,
//       pages: Math.ceil(total / limit)
//     }
//   };
// }

// export async function updateEvent(id, ownerId, data) {
//   const event = await repo.updateById(id, ownerId, data);

//   if (!event) {
//     throw new AppError(404, 'The event doesn\'t exist or you are not authorized to update it');
//   }

//   return event;
// }

// export async function deleteEvent(id, ownerId) {
//   const event = await repo.deleteById(id, ownerId);

//   if (!event) {
//     throw new AppError(404, 'The event doesn\'t exist or you are not authorized to delete it');
//   }

//   return event;
// }

// services/event.service.js
import { AppError } from "../middlewares/error.middleware.js";
import * as repo from "../repositories/event.repository.js";
import { EVENT_TYPES } from "../shared/eventTypes.shared.js";
import { NotificationService } from "./notification.service.js";

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
  if (!event.date < new Date()) {
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
  console.log(updatedEvent);

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

// // 🔹 כל האירועים – בלי פגינציה
// export async function getUserEvents(ownerId, query) {
//   const events = await repo.findAllByOwnerId(ownerId, query);
//   return { events };
// }

// 🔹 רק אירועים רלוונטיים (לפי date + פילטרים ב-query)
export async function getUserRelevantEvents(ownerId, query) {
  const events = await repo.findRelevantByOwnerId(ownerId, query);
  return { events };
}

/**
 * קבלת אירוע לפי ID
 */
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

/**
 * קבלת סוגי אירועים
 */
export function getEventTypes() {
  return EVENT_TYPES;
}

// 🔹 אם תרצי גם פגינציה
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
    // אם כבר מייננת ב-DEFAULT_SORT לפי date, אפשר לוותר
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

/**
 * עדכון אירוע
 */
export async function updateEvent(id, ownerId, data) {
  const event = await repo.updateById(id, ownerId, data);
  if (!event) {
    throw new AppError(404, "האירוע לא נמצא או אין לך הרשאה לעדכן את האירוע");
  }

  return event;
}

/**
 * מחיקת אירוע
 */
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
