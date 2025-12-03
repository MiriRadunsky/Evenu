import Event from '../models/event.model.js';

const EVENT_PROJECTION = '-__v';
const DEFAULT_SORT = { date: 1 };

function buildFilter(ownerId, { status, type } = {}) {
  const filter = { ownerId };
  if (status) filter.status = status;
  if (type) filter.type = type;
  return filter;
}

// 🔹 יצירה
export async function create(data) {
  return await Event.create(data);
}

// 🔹 מציאת אירוע לפי ID
export async function findById(id) {
  return await Event.findById(id)
    .populate('ownerId', 'firstName lastName email name')
    .select(EVENT_PROJECTION);
}

// 🔹 עדכון אירוע לפי ID
export async function updateById(id, ownerId, data) {
  return await Event.findOneAndUpdate(
    { _id: id, ownerId },
    data,
    { new: true, runValidators: true }
  ).select(EVENT_PROJECTION);
}

// 🔹 מחיקה של אירוע
export async function deleteById(id, ownerId) {
  return await Event.findOneAndDelete({ _id: id, ownerId });
}

// 🔹 עדכון תקציב עם הגבלות
export async function updateBudgetAllocated(eventId, amount, session) {
  return await Event.findOneAndUpdate(
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

// 🔹 עדכון תקציב והוספת היסטוריה
export async function updateBudget(eventId, ownerId, newBudget, historyRecord) {
  return await Event.findOneAndUpdate(
    { _id: eventId, ownerId },
    {
      budget: newBudget,
      $push: { budgetHistory: historyRecord },
    },
    { new: true }
  ).select(EVENT_PROJECTION);
}

// 🔹 כל האירועים של משתמש (בלי פגינציה)
export async function findAllByOwnerId(ownerId, query = {}) {
  const filter = buildFilter(ownerId, query);
  return await Event.find(filter)
    .sort(DEFAULT_SORT)
    .select(EVENT_PROJECTION);
}

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


// 🔹 אירועים עם פגינציה
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

// 🔹 מציאת אירוע לפי ID (לצורך populate נוסף אם צריך)
export async function getEventById(id) {
  return await Event.findById(id)
    .populate('ownerId', 'name email')
    .select(EVENT_PROJECTION);
}
