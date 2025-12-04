import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input"; 
import { Card, CardContent } from "../../components/ui/card";

export default function Register() {
  const [userType, setUserType] = useState<"user" | "supplier">("user");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6 shadow-md">
        <CardContent className="flex flex-col gap-4">

          {/* כותרת */}
          <h1 className="text-xl font-bold text-center">הרשמה</h1>

          {/* בחירת סוג משתמש */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={userType === "user" ? "default" : "outline"}
              onClick={() => setUserType("user")}
            >
              משתמש רגיל
            </Button>

            <Button
              variant={userType === "supplier" ? "default" : "outline"}
              onClick={() => setUserType("supplier")}
            >
              ספק
            </Button>
          </div>

          {/* שאר השדות */}
          <Input placeholder="שם מלא" />
          <Input placeholder="אימייל" />
          <Input placeholder="סיסמה" type="password" />

          {/* כפתור שליחה */}
          <Button className="w-full mt-4">הירשם</Button>
        </CardContent>
      </Card>
    </div>
  );
}
