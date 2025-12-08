import cron from 'node-cron';
import Thread from '../models/threads.model.js';
import Message from '../models/message.model.js';

export function startCleanupJob() {

  cron.schedule('0 3 * * *', async () => {
    console.log('cleanup job started');

    const now = new Date();

    const expiredThreads = await Thread.find({
      deleteAt: { $lte: now }
    });

    for (const t of expiredThreads) {
      await Message.deleteMany({ threadId: t._id });
      await t.deleteOne();
    }

    console.log('cleanup job completed');
  });

}
