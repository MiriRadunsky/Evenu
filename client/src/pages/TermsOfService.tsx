import React from "react";

export const TermsOfService: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-8 rtl">
      <h1 className="text-3xl font-bold mb-6">תנאי שימוש – Evenu</h1>
      <p className="mb-4">
        ברוכים הבאים למערכת "Evenu". השימוש במערכת מותנה בהסכמתך לתנאי השימוש
        הבאים. נא לקרוא בקפידה.
      </p>
      <ol className="list-decimal list-inside space-y-2">
        <li>השימוש במערכת הוא למטרות אישיות בלבד.</li>
        <li>לא ניתן לפרסם תכנים פוגעניים או בלתי חוקיים.</li>
        <li>המערכת אינה אחראית על תשלומים חיצוניים או אירועים שלא נוהלו דרך המערכת.</li>
        <li>למערכת יש זכות לשנות את התנאים בכל עת.</li>
      </ol>
      <p className="mt-6 text-sm text-gray-500">
        גרסה 0.1 · MVP
      </p>
    </div>
  );
};
