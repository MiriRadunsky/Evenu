import cron from 'node-cron';
import Thread from '../models/threads.model.js';
import Message from '../models/message.model.js';
import connection from '../queues/scheduler.js';
export function startCleanupJob() {

  cron.schedule('0 3 * * *', async () => {
    console.log('cleanup job started');

    const now = new Date();

    const expiredThreads = await Thread.find({
      deleteAt: { $lte: now }
    });
    for (const t of expiredThreads) {
      await connection.del(`messages:${t._id}`);
      await connection.del(`unread:${t._id}`);
      const keys = await connection.keys(`thread:${t._id}:*`);
      if (keys.length) await connection.del(keys);
      await Message.deleteMany({ threadId: t._id });
      await t.deleteOne();
    }

    console.log('cleanup job completed');
  });

}
