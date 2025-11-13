// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import type { AppDispatch, RootState } from "../store";
// import { formatEventDate } from "../Utils/DataUtils";
// import type { Notification } from "../types/type";
// import { markNotificationAsRead } from "../store/notificationsSlice";

// export default function NotificationsList() {
//   const notifications : Notification[] = useSelector((state: RootState) => state.notifications.notifications);
//   const dispatch:AppDispatch = useDispatch();

//   if (!notifications || notifications.length === 0) return null;
//   console.log("notifications:", notifications);

//   return (
//     <div className="fixed top-4 right-4 w-80 bg-white shadow-lg rounded-lg overflow-hidden z-50">
//       {notifications&&notifications.map((n: Notification) => (
//         <div
//           key={n.id}
//           className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-100 ${
//             n.readAt ? "opacity-50" : "opacity-100"
//           }`}
//           onClick={() => dispatch(markNotificationAsRead(n.id))}
//         >
//           <p className="text-sm">{n.payload.title}</p>
//           <p className="text-sm text-muted-foreground">
//             {/* {formatEventDate(n.sentAt.toString())} */}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// }
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { formatEventDate } from "../Utils/DataUtils";
import type { Notification } from "../types/type";
import { markNotificationAsRead } from "../store/notificationsSlice";

export default function NotificationsList() {
  const notifications: Notification[] = useSelector(
    (state: RootState) => state.notifications.notifications
  );
  const dispatch: AppDispatch = useDispatch();

  if (!notifications || notifications.length === 0) return null;

  return (
<div className="fixed top-10 right-4 w-80 max-h-[70vh] overflow-y-auto bg-white shadow-xl rounded-xl border border-gray-200 z-50">
      {notifications.map((n: Notification) => (
        <div
          key={n.id}
          onClick={() => dispatch(markNotificationAsRead(n.id))}
          className={`flex flex-col p-4 border-b last:border-b-0 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
            n.readAt ? "opacity-60" : "opacity-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-800">{n.payload.title}</p>
            {!n.readAt && (
              <span className="w-2 h-2 rounded-full bg-yellow-400 ml-2"></span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatEventDate(n.payload.time.toString())}
          </p>
        </div>
      ))}
    </div>
  );
}
