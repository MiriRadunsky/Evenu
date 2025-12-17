import 'dotenv/config';
import { connectMongo } from './db/connect.db.js';
import User from './models/user.model.js';

async function cleanup() {
  try {
    await connectMongo();
    
    // מוחק את המשתמש הבעייתי (החלף את האימייל)
    const email = 'elisheva77@example.com';
    const result = await User.findOneAndDelete({ email });
    
    if (result) {
      console.log(`✅ נמחק משתמש: ${email}`);
    } else {
      console.log(`❌ לא נמצא משתמש עם האימייל: ${email}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ שגיאה:', error.message);
    process.exit(1);
  }
}

cleanup();
