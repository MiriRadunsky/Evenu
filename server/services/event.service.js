import { AppError } from '../middlewares/error.middleware.js';
import * as repo from '../repositories/event.repository.js';

export async function createEvent(ownerId, data) {
  const event = await repo.create({ ...data, ownerId });
  return event;
}

export async function getEventById(id, ownerId) {
  const event = await repo.findById(id);
  
  if (!event) {
    throw new AppError(404, 'The event doesn\'t exist');
  }
  
  if (event.ownerId._id.toString() !== ownerId.toString()) {
    throw new AppError(403, 'You are not authorized to view this event');
  }
  
  return event;
}

export async function getUserEvents(ownerId, query) {
  const { items, total, page, limit } = await repo.findByOwnerId(ownerId, query);
  
  return {
    events: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
}

export async function updateEvent(id, ownerId, data) {
  const event = await repo.updateById(id, ownerId, data);
  
  if (!event) {
    throw new AppError(404, 'The event doesn\'t exist or you are not authorized to update it');
  }
  
  return event;
}

export async function deleteEvent(id, ownerId) {
  const event = await repo.deleteById(id, ownerId);
  
  if (!event) {
    throw new AppError(404, 'The event doesn\'t exist or you are not authorized to delete it');
  }
  
  return event;
}