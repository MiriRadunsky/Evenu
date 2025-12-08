import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { EventsTable } from '../../components/admin/EventsTable';
import { Button } from '../../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axios';

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

export function EventsPage() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'תכנון' | 'פעיל' | 'הושלם' | 'בוטל'>('all');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setError(null);
      const response = await api.get('/admin/events');
      setEvents(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('שגיאה בטעינת אירועים');
    } finally {
      setHasLoaded(true);
    }
  };

  const handleView = (id: string) => {
    console.log('View event:', id);
    // TODO: navigate to event details page when created
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(event => event.status === filter);

  if (!hasLoaded) {
    return <AdminLayout><div /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">אירועים</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">סה"כ {events.length} אירועים במערכת</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 border-r-4 border-red-500 rounded-lg bg-red-50">
            <p className="text-right text-red-800">{error}</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' 
              ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white hover:from-[#c89645] hover:to-[#b8935a]'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          >
            הכל ({events.length})
          </Button>
          <Button
            onClick={() => setFilter('תכנון')}
            variant={filter === 'תכנון' ? 'default' : 'outline'}
            className={filter === 'תכנון' 
              ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white hover:from-[#c89645] hover:to-[#b8935a]'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          >
            בתכנון ({events.filter(e => e.status === 'תכנון').length})
          </Button>
          <Button
            onClick={() => setFilter('פעיל')}
            variant={filter === 'פעיל' ? 'default' : 'outline'}
            className={filter === 'פעיל' 
              ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white hover:from-[#c89645] hover:to-[#b8935a]'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          >
            פעילים ({events.filter(e => e.status === 'פעיל').length})
          </Button>
          <Button
            onClick={() => setFilter('הושלם')}
            variant={filter === 'הושלם' ? 'default' : 'outline'}
            className={filter === 'הושלם' 
              ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white hover:from-[#c89645] hover:to-[#b8935a]'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          >
            הושלמו ({events.filter(e => e.status === 'הושלם').length})
          </Button>
          <Button
            onClick={() => setFilter('בוטל')}
            variant={filter === 'בוטל' ? 'default' : 'outline'}
            className={filter === 'בוטל' 
              ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white hover:from-[#c89645] hover:to-[#b8935a]'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }
          >
            בוטלו ({events.filter(e => e.status === 'בוטל').length})
          </Button>
        </div>

        {/* Events Table */}
        <EventsTable events={filteredEvents} onView={handleView} />
      </div>
    </AdminLayout>
  );
}
