
import Event from '../models/event.model.js';

const EVENT_PROJECTION = '-__v';
const DEFAULT_SORT = { date: 1 };

function buildFilter(ownerId, { status, type } = {}) {
  const filter = { ownerId };
  if (status) filter.status = status;
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
          // לא לרדת מתחת ל־0
          { $gte: [{ $add: ["$budgetAllocated", amount] }, 0] },
          // לא לעבור את התקציב
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

// 🔹 רק אירועים רלוונטיים (כל האירועים של המשתמש)
export async function findRelevantByOwnerId(ownerId, query = {}) {
  const { type, from, to } = query;

  const filter = { ownerId };
  
  // סינון לפי סוג אירוע
  if (type) {
    filter.type = type;
  }

  // סינון לפי תאריכים אם צריך
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);
  }

  return Event.find(filter)
    .sort(DEFAULT_SORT)
    .select("_id name date type")
    .lean()
}

// 🔹 כל האירועים של משתמש (בלי פגינציה)
export async function findAllByOwnerId(ownerId, query = {}) {
  const filter = buildFilter(ownerId, query);
  return await Event.find(filter)
    .sort(DEFAULT_SORT)
    .select(EVENT_PROJECTION);
}
// export async function findRelevantByOwnerId(ownerId, query = {}) {
//   const { type } = query;

//   // בונים פילטר בסיסי
//   const filter = buildFilter(ownerId, { type });

//   // מחזירים רק אירועים פעילים
//   filter.status = "פעיל";

//   return Event.find(filter)
//     .sort(DEFAULT_SORT)
//     .select("_id name date"); // רק השדות שרצית
// }



// 🔹 אירועים רלוונטיים (פעילים בלבד)
export async function findUpcomingEventsByOwnerId(ownerId) {
  const now = new Date();

  return await Event.find({
    ownerId,
    date: { $gte: now } // רק אירועים מהיום והלאה
  })
    .sort({ date: 1 })        // מיון לפי תאריך עולה
    .select(EVENT_PROJECTION);
}

 
export async function findByOwnerId(ownerId, query = {}) {
  const { page = 1, limit = 10, status, type } = query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const filter = buildFilter(ownerId, { status, type });

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



