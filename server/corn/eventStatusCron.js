import cron from 'node-cron';
import Event from '../models/event.model.js';

cron.schedule('43 8 * * *', async () => {
  // רץ כל יום ב-03:00 לפנות בוקר
  
  try {
    const now = new Date();
    console.log("CRON Job started at: ", now.toISOString());
    // גבולות יום נוכחי
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // עדכון לאירועים שהסתיימו
    await Event.updateMany(
      { date: { $lt: start }, status: { $nin: ['בוטל', 'הושלם'] } },
      { status: 'הושלם' }
    );

    // עדכון לאירועים של היום
    await Event.updateMany(
      { date: { $gte: start, $lte: end }, status: { $nin: ['בוטל'] } },
      { status: 'בפעולה' }
    );

    // עדכון לאירועים עתידיים
    await Event.updateMany(
      { date: { $gt: end }, status: { $nin: ['בוטל'] } },
      { status: 'פעיל' }
    );

    console.log('Event statuses updated automatically');
  } catch (error) {
    console.error('CRON Error updating events:', error);
  }
});
