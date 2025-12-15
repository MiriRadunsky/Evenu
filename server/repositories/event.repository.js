
import Event from '../models/event.model.js';

const EVENT_PROJECTION = '-__v';
const DEFAULT_SORT = { date: 1 };

function buildFilter(ownerId, { status, type } = {}) {
  const filter = { ownerId };
  // Only filter by DB status if status is a real DB value (not a virtual)
  if (status && status !== "מתוכנן" && status !== "הושלם" && status !== "בפעולה") {
    filter.status = status;
  }
  if (type) filter.type = type;
  return filter;
}

export async function create(data) {
  return Event.create(data);
}

export async function getEventById(id) {
  return Event.findById(id)
    .populate('ownerId', 'name email')
    .select(EVENT_PROJECTION);
}
export async function updateBudgetAllocated(eventId, amount, session) {
  return Event.findOneAndUpdate(
    {
      _id: eventId,
      $expr: {
        $and: [
          { $gte: [{ $add: ["$budgetAllocated", amount] }, 0] },
          { $lte: [{ $add: ["$budgetAllocated", amount] }, "$budget"] },
        ],
      },
    },
    { $inc: { budgetAllocated: amount } },
    { new: true, session }
  ).select(EVENT_PROJECTION);
}

export async function updateBudget(eventId, ownerId, newBudget, historyRecord) {
  return Event.findOneAndUpdate(
    { _id: eventId, ownerId },
    {
      budget: newBudget,
      $push: { budgetHistory: historyRecord },
    },
    { new: true }
  ).select(EVENT_PROJECTION);
}

export async function findRelevantByOwnerId(ownerId, query = {}) {
  const { type, from, to } = query;

  const filter = { ownerId };

  // סוג האירוע
  if (type) {
    filter.type = type;
  }

  // תנאי תאריכים
  filter.date = { $gte: new Date() }; // רק אירועים שלא עברו
  if (from) filter.date.$gte = new Date(from);
  if (to) filter.date.$lte = new Date(to);

  return Event.find(filter)
    .sort(DEFAULT_SORT)
    .select("_id name date type locationRegion estimatedGuests budget status") // כל השדות הדרושים
    .lean();
}


export async function findAllByOwnerId(ownerId, query = {}) {
  const filter = buildFilter(ownerId, query);
  return await Event.find(filter)
    .sort(DEFAULT_SORT)
    .select(EVENT_PROJECTION);
}

export async function findUpcomingEventsByOwnerId(ownerId) {
  const now = new Date();

  return await Event.find({
    ownerId,
    date: { $gte: now } 
  })
    .sort({ date: 1 })        
    .select(EVENT_PROJECTION);
}

 
export async function findByOwnerId(ownerId, query = {}) {
  const { page = 1, limit = 10, status, type } = query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  let filter = buildFilter(ownerId, { status, type });
  // If filtering by a virtual status (not DB field), fetch all for owner, filter in JS, then page
  if (status && (status === "מתוכנן" || status === "הושלם" || status === "בפעולה")) {
    // Fetch all events for owner/type
    let all = await Event.find(buildFilter(ownerId, { type }))
      .sort(DEFAULT_SORT)
      .select(EVENT_PROJECTION);
    // Filter by virtual status
    all = all.filter(e => {
      if (typeof e.autoStatus === 'function') return e.autoStatus() === status;
      return e.autoStatus === status;
    });
    const total = all.length;
    const items = all.slice(skip, skip + limitNumber);
    return {
      items,
      total,
      page: pageNumber,
      limit: limitNumber,
    };
  } else {
    // DB status filter
    const [items, total] = await Promise.all([
      Event.find(filter)
        .sort(DEFAULT_SORT)
        .skip(skip)
        .limit(limitNumber)
        .select(EVENT_PROJECTION),
      Event.countDocuments(filter),
    ]);
    return {
      items,
      total,
      page: pageNumber,
      limit: limitNumber,
    };
  }
}

export async function updateById(id, ownerId, data) {
  return Event.findOneAndUpdate(
    { _id: id, ownerId },
    data,
    { new: true, runValidators: true }
  ).select(EVENT_PROJECTION);
}

export async function deleteById(id, ownerId) {
  return Event.findOneAndDelete({ _id: id, ownerId });
}



