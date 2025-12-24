# מערכת ניהול אירועים לציבור החרדי – README

> גרסה: 0.1 · סטטוס: MVP בבנייה · רישיון: MIT
> שם קוד: **"מתאם"** (שם זמני; ניתן לשינוי בעמוד השער)

https://events-0cne.onrender.com/
## 1) תקציר

פלטפורמת WEB לניהול אירועים עבור המגזר החרדי: פתיחת אירוע, חיפוש ספקים לפי קטגוריות, תקשורת בזמן אמת, חוזים דיגיטליים, ותיעוד תשלומים (התשלום בפועל **מחוץ** למערכת). המערכת מותאמת RTL, שפה מכבדת, וסינון לפי מאפיינים תרבותיים (למשל אירוע בהפרדה).

**יכולות ליבה (MVP):**

* יצירת אירוע והזנת פרטים בסיסיים.
* קטלוג ספקים (צלמים, תזמורות, אולמות, קייטרינג...).
* פנייה לספק + אישור/דחייה.
* צ'אט בזמן אמת (Socket.IO) עם שמירה קצרת-טווח (TTL).
* חוזים: העלאה, חתימה דיגיטלית, אחסון בענן.
* תשלומים: תיעוד תוכנית תשלומים, קבלות ותזכורות.
* התראות In‑App/Email.
* דשבורד לבעל האירוע.

---

## 2) סטאק

* **Backend:** Node.js (NestJS/Express)
* **DB:** MongoDB (Mongoose)
* **Realtime:** Socket.IO (WS) · RabbitMQ (אופציונלי, לשכבת אינטגרציה)
* **Queues/Scheduler:** BullMQ (Redis) או Agenda (Mongo)
* **Frontend:** React + Tailwind
* **Auth:** JWT (+ Google/Facebook – אופציונלי)
* **Storage:** AWS S3 או Azure Blob (Pre‑Signed URLs)
* **Hosting:** Docker + Azure App Service

---

## 3) ארכיטקטורה בקצרה

מונורפו עם שלוש אפליקציות:

```
/apps
  api/      ← REST + WS (Socket.IO)
  worker/   ← Jobs/Queues (BullMQ/Agenda)
  web/      ← React + Tailwind
/packages
  shared-types/   ← Types/DTOs משותפים
  config/         ← טעינת ENV ולוגים
```

**עקרונות:** SRP לכל שירות; DTOs משותפים; תורים לג'ובים כבדים; נתונים קריטיים נשמרים קבוע, הודעות צ'אט ב-TTL; RBAC: admin|client|supplier.

---

## 4) API (סקירה)

### Events

* `POST /events` – יצירת אירוע
* `GET /events` – רשימת אירועים
* `GET /events/:id` – פרטי אירוע
* `PATCH /events/:id` – עדכון אירוע
* `POST /events/:eventId/requests` – יצירת פנייה לספק עבור אירוע

### Requests (פעולות עסקיות)

* `POST /requests/:id/approve` – אישור פנייה ע"י ספק
* `POST /requests/:id/decline` – דחיית פנייה

### Suppliers

* `GET /suppliers?category=&region=` – חיפוש ספקים
* `GET /suppliers/:id` – פרטי ספק

### Messaging

* **WS** `wss://.../threads/:threadId` – שידור/קבלת הודעות בזמן אמת
* **REST** `GET /threads/:id/messages` – היסטוריית הודעות (שמור לטווח קצר)

### Contracts & Payments

* `POST /contracts` · `GET /contracts/:id` · `POST /contracts/:id/sign`
* `POST /contracts/:id/payments` · `PATCH /payments/:id`

> תשלומים **מתועדים בלבד**; ביצוע התשלום מחוץ למערכת.

### Notifications

* `GET /notifications` · `POST /notifications/test`

אימות: `Authorization: Bearer <JWT>` בכל נתיב מוגן.

---

## 5) סביבת פיתוח – הפעלה מהירה

### דרישות מקדימות

* Node.js 18+
* MongoDB 6+
* Redis (אם עובדים עם BullMQ)
* Docker (אופציונלי)

### משתני סביבה (`.env` לדוגמה)

```
# API
PORT=3000
NODE_ENV=development
JWT_SECRET=dev_secret
JWT_EXPIRES_IN=1d

# DB
MONGO_URI=mongodb://localhost:27017/events_app

# REDIS (BullMQ)
REDIS_HOST=localhost
REDIS_PORT=6379

# STORAGE
S3_BUCKET=events-app
S3_REGION=eu-central-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...

# EMAIL
SMTP_HOST=smtp.example.com
SMTP_USER=...
SMTP_PASS=...
```

### התקנה והרצה (נא לשנות לפי פרויקט בפועל)

```bash
# התקנת תלויות
npm install

# הרצת API (dev)
npm run dev:api

# הרצת Worker (תזמונים/תורים)
npm run dev:worker

# הרצת Frontend
npm run dev:web
```

### Docker Compose (אופציונלי)

קובץ `docker-compose.yml` לדוגמה ירים Mongo, Redis, API ו-Worker.

---

## 6) אבטחה ופרטיות

* JWT + Refresh Tokens
* Rate Limiting + Helmet
* RBAC לפי תפקיד + הרשאות פר‑Event
* קבצים דרך Pre‑Signed URLs
* Audit Trail לחוזים/תשלומים
* TTL להודעות צ'אט (14–30 יום, ניתן לשינוי)

---

## 7) בדיקות

* **Unit:** Jest לשירותים (Auth/Requests/Contracts)
* **Integration:** בדיקות API מול Mongo (Test DB)
* **E2E:** Cypress/Playwright לזרימות מרכזיות
* **Load:** k6/Artillery ל-API ותורים

---

## 8) תרומה וקונבנציות קוד

* Style: TypeScript + ESLint + Prettier
* Commits: Conventional Commits
* PRs: בדיקות ירוצו ב-CI; נדרש Code Review

---

## 9) Roadmap (MVP → V1)

* MVP: Events, Suppliers, Requests, WS Chat, Contracts, Payments (log), Notifications
* V1: פילטרים מתקדמים, Dashboard מורחב, דו"חות לאדמין, אינטגרציות Calendar/SMS

---

## 10) רישוי

MIT 

ADMIN:
{
"email":"admin@admin.com",
"password":"Admin1234"
}
USERS:
// {
//   "name": "Eli Sheva",
//   "email": "elisheva@example.com",
//   "phone": "+972501234567",
//   "password": "StrongPass123"
// }

// {
//   "name": "Yael Cohen",
//   "email": "yael.cohen@example.com",
//   "phone": "+972521234567",
//   "password": "SecurePass456"
// }
