import React from "react";

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 rtl">
      <h1 className="text-3xl font-bold mb-6">מדיניות פרטיות – Evenu</h1>
      <p className="mb-4">
        המידע שתספק במערכת "Evenu" נשמר באופן מאובטח, בהתאם לחוקי הגנת הפרטיות.
      </p>
      <ol className="list-decimal list-inside space-y-2">
        <li>איסוף מידע אישי מוגבל לשם הפעלת המערכת בלבד.</li>
        <li>לא נשתף מידע אישי עם צדדים שלישיים ללא הסכמה מפורשת.</li>
        <li>כל הנתונים מוגנים באמצעות הצפנה ואמצעי אבטחה מודרניים.</li>
        <li>ניתן לבקש מחיקה או עדכון של הנתונים האישיים בכל עת.</li>
      </ol>
      <p className="mt-6 text-sm text-gray-500">
        גרסה 0.1 · MVP
      </p>
    </div>
  );
};
