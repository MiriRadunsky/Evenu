import  Event  from '../models/event.model.js';

export async function create(data) {
  return await Event.create(data);
}

export async function findById(id) {
  return await Event.findById(id)
    .populate('ownerId', 'firstName lastName email')
    .select('-__v'); // ⬅️ הוספה - מסתיר את __v
}

export async function findByOwnerId(ownerId, query = {}) {
  const { page = 1, limit = 10, status, type } = query;
  const filter = { ownerId };
  
  if (status) filter.status = status;
  if (type) filter.type = type;

  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    Event.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 })
      .select('-__v'), // ⬅️ הוספה - מסתיר את __v
    Event.countDocuments(filter)
  ]);

  return { items, total, page: Number(page), limit: Number(limit) };
}

export async function updateById(id, ownerId, data) {
  return await Event.findOneAndUpdate(
    { _id: id, ownerId },
    data,
    { new: true, runValidators: true }
  ).select('-__v'); // ⬅️ הוספה - מסתיר את __v
}

export async function deleteById(id, ownerId) {
  return await Event.findOneAndDelete({ _id: id, ownerId });
}