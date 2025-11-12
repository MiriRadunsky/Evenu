import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { formatEventDate } from "../Utils/DataUtils";
import type { Notification } from "../types/type";
import { markNotificationAsRead } from "../store/notificationsSlice";

export default function NotificationsList() {
  const notifications : Notification[] = useSelector((state: RootState) => state.notifications.notifications);
  const dispatch:AppDispatch = useDispatch();

  if (!notifications || notifications.length === 0) return null;
  console.log("notifications:", notifications);

  return (
    <div className="fixed top-16 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
      {notifications&&notifications.map((n: Notification) => (
        <div
          key={n.id}
          className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 ${
            n.readAt ? "opacity-50" : "opacity-100"
          }`}
          onClick={() => dispatch(markNotificationAsRead(n.id))}
        >
          <p className="text-sm">{n.payload.title}</p>
          <p className="text-sm text-muted-foreground">
            {/* {formatEventDate(n.sentAt.toString())} */}
          </p>
        </div>
      ))}
    </div>
  );
}
