import { Calendar, User, MapPin, Clock } from 'lucide-react';

interface EventData {
  _id: string;
  name: string;
  type: string;
  date: string;
  locationRegion: string;
  status: string;
  ownerId: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface EventsTableProps {
  events: EventData[];
  onView?: (id: string) => void;
}

export function EventsTable({ events, onView }: EventsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      'תכנון': { bg: 'bg-[#f5f3ed]', text: 'text-[#b8935a]', label: 'בתכנון' },
      'פעיל': { bg: 'bg-gradient-to-r from-[#d4a960] to-[#c89645]', text: 'text-white', label: 'פעיל' },
      'הושלם': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'הושלם' },
      'בוטל': { bg: 'bg-red-50', text: 'text-red-700', label: 'בוטל' }
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-700', label: status };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (events.length === 0) {
    return (
      <div className="p-8 text-center bg-white border-2 border-gray-100 rounded-2xl">
        <Calendar className="w-16 h-16 mx-auto mb-4 text-[#d4a960] opacity-50" />
        <p className="font-light text-gray-500">אין אירועים להצגה</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-2xl">
      <div className="bg-gradient-to-r from-[#f5f3ed] to-[#f8f6f0] px-4 md:px-6 py-4 border-b-2 border-[#b8935a]/30">
        <h2 className="text-lg md:text-xl font-semibold text-[#8b6f47]">
          אירועים ({events.length})
        </h2>
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden">
        {events.map((event) => (
          <div
            key={event._id}
            className="p-4 transition-colors border-b-2 border-gray-200 hover:bg-gray-50 cursor-pointer mb-2"
            onClick={() => onView?.(event._id)}
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#d4a960] to-[#c89645] flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="mb-1 text-base font-semibold text-gray-900">{event.name}</div>
                  <div className="text-sm text-gray-500">{event.type}</div>
                </div>
                
                <div className="flex-shrink-0">
                  {getStatusBadge(event.status)}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-[#d4a960]" />
                  <span className="truncate">{event.ownerId?.name || 'לא ידוע'}</span>
                </div>
                <div className="text-xs text-gray-500">{formatDate(event.date)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-50">
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">שם האירוע</th>
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">סוג</th>
              <th className="px-6 py-4 text-sm font-semibold text-center text-gray-700">סטטוס</th>
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">בעל האירוע</th>
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">תאריך האירוע</th>
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">מיקום</th>
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">תאריך יצירה</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr
                key={event._id}
                className="transition-colors border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                onClick={() => onView?.(event._id)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#d4a960] to-[#c89645] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{event.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#faf8f3] text-[#8b6f47] border border-[#d4a960]/30">
                    {event.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {getStatusBadge(event.status)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <User className="w-4 h-4 text-[#d4a960]" />
                    {event.ownerId?.name || 'לא ידוע'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Clock className="w-4 h-4 text-[#d4a960]" />
                    {formatDate(event.date)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-[#d4a960]" />
                    {event.locationRegion || 'לא צוין'}
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {formatDate(event.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
