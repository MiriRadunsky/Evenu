import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, ArrowLeft, TrendingUp, TrendingDown, Store } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import AdminLayout from './AdminLayout';
import {
  getAdminStats,
  type AdminStats
} from '../../services/admin';
import api from '../../services/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

interface MonthlyEvents {
  month: string;
  events: number;
}

interface CategorySuppliers {
  category: string;
  value: number;
  [key: string]: string | number;
}

interface RecentSupplier {
  name: string;
  category: string;
  date: string;
}

interface RecentEvent {
  name: string;
  date: string;
}

const COLORS = ['#d4a960', '#8b6f47', '#e8c170', '#a67c3d', '#f4d799', '#6b563d'];

export function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSuppliers: 0,
    pendingSuppliers: 0,
    totalEvents: 0,
    activeContracts: 0,
    totalRevenue: 0,
    activeSuppliers: 0
  });

  const [monthlyEvents, setMonthlyEvents] = useState<MonthlyEvents[]>([]);
  const [categorySuppliers, setCategorySuppliers] = useState<CategorySuppliers[]>([]);
  const [recentSuppliers, setRecentSuppliers] = useState<RecentSupplier[]>([]);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const statsData = await getAdminStats();
      setStats(statsData);

      // Fetch additional stats from /dashboard/stats
      try {
        const response = await api.get('/dashboard/stats');
        const additionalStats = response.data;
        
        setMonthlyEvents(additionalStats.monthlyEvents || []);
        setCategorySuppliers(additionalStats.categorySuppliers || []);
        setRecentSuppliers(additionalStats.recentSuppliers || []);
        setRecentEvents(additionalStats.recentEvents || []);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('שגיאה בטעינת סטטיסטיקות הדשבורד');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('שגיאה בטעינת נתוני הדשבורד');
    } finally {
      setHasLoaded(true);
    }
  };

  const statsCards = [
    {
      title: 'סה"כ משתמשים',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-[#d4a960] to-[#c89645]',
      bgLight: 'bg-[#faf8f3]',
      trend: '+12%',
      trendUp: true,
      link: '/admin/users'
    },
    {
      title: 'סה"כ ספקים',
      value: stats.totalSuppliers,
      icon: Store,
      color: 'from-[#b8935a] to-[#a67c3d]',
      bgLight: 'bg-[#f5f3ed]',
      trend: '+8%',
      trendUp: true,
      link: '/admin/active-suppliers'
    },
    {
      title: 'ספקים ממתינים',
      value: stats.pendingSuppliers,
      icon: UserCheck,
      color: 'from-[#c9a55f] to-[#b88e48]',
      bgLight: 'bg-[#f8f6f0]',
      trend: '+5%',
      trendUp: true,
      link: '/admin/pending-suppliers'
    },
    {
      title: 'סה"כ אירועים',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'from-[#dbb76d] to-[#ca9f52]',
      bgLight: 'bg-[#fcfaf6]',
      trend: '+15%',
      trendUp: true,
      link: '/admin/events'
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (!hasLoaded) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#d4a960] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">טוען נתונים...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8" dir="rtl">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">לוח בקרה</h1>
          <p className="mt-2 text-base text-gray-600">מבט כללי על המערכת</p>
        </div>

        {error && (
          <div className="p-4 border-r-4 border-red-500 rounded-lg bg-red-50">
            <p className="text-right text-red-800">{error}</p>
          </div>
        )}

        {/* KPI Cards Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 hover:border-[#d4a960]/40 ${stat.bgLight}`}
              onClick={() => navigate(stat.link)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="mb-2 text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-[#d4a960] to-[#c89645] bg-clip-text text-transparent mb-3">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-1">
                      {stat.trendUp ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend}
                      </span>
                      <span className="text-xs text-gray-500">לעומת חודש קודם</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Bar Chart - Events by Month */}
          <Card className="p-4 md:p-6 border-2 border-[#d4a960]/20 hover:border-[#d4a960]/40 transition-all bg-gradient-to-br from-white to-[#faf8f3]">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">אירועים לפי חודש</h3>
            {monthlyEvents.length > 0 ? (
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyEvents}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  reversed={true}
                />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #d4a960',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="events" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                  name="אירועים"
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#d4a960" />
                    <stop offset="100%" stopColor="#c89645" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            </div>
            ) : (
              <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-gray-500">
                <p>אין נתונים להצגה</p>
              </div>
            )}
          </Card>

          {/* Pie Chart - Suppliers by Category */}
          <Card className="p-4 md:p-6 border-2 border-[#d4a960]/20 hover:border-[#d4a960]/40 transition-all bg-gradient-to-br from-white to-[#faf8f3]">
            <h3 className="mb-4 md:mb-6 text-lg md:text-xl font-semibold text-gray-900">חלוקת ספקים לפי קטגוריה</h3>
            {categorySuppliers.length > 0 ? (
            <div className="h-[280px] sm:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categorySuppliers}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={false}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="category"
                >
                  {categorySuppliers.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '2px solid #d4a960',
                    borderRadius: '8px',
                    direction: 'rtl',
                    padding: '10px',
                    fontWeight: 'bold'
                  }}
                  formatter={(value: number, name: string) => [`${value} ספקים`, name]}
                />
                <Legend 
                  wrapperStyle={{ 
                    direction: 'rtl', 
                    paddingTop: '20px',
                    fontSize: '12px'
                  }}
                  formatter={(value) => (
                    <span style={{ 
                      color: '#374151', 
                      fontWeight: '500',
                      marginLeft: '8px'
                    }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
            </div>
            ) : (
              <div className="h-[280px] sm:h-[350px] flex items-center justify-center text-gray-500">
                <p>אין נתונים להצגה</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Items Section */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Suppliers */}
          <Card className="p-4 md:p-6 border-2 border-[#d4a960]/20 hover:border-[#d4a960]/40 transition-all bg-gradient-to-br from-white to-[#faf8f3]">
            <h3 className="flex items-center gap-2 mb-4 text-lg md:text-xl font-semibold text-gray-900">
              <Store className="w-5 h-5 text-[#d4a960]" />
              ספקים חדשים במערכת
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#d4a960]/20">
                    <th className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-right text-gray-700">שם הספק</th>
                    <th className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-right text-gray-700">קטגוריה</th>
                    <th className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-right text-gray-700">תאריך הצטרפות</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSuppliers.map((supplier, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-[#faf8f3] transition-colors">
                      <td className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{supplier.name}</td>
                      <td className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm text-gray-600">{supplier.category}</td>
                      <td className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">{formatDate(supplier.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Recent Events */}
          <Card className="p-4 md:p-6 border-2 border-[#d4a960]/20 hover:border-[#d4a960]/40 transition-all bg-gradient-to-br from-white to-[#faf8f3]">
            <h3 className="flex items-center gap-2 mb-4 text-lg md:text-xl font-semibold text-gray-900">
              <Calendar className="w-5 h-5 text-[#d4a960]" />
              אירועים חדשים במערכת
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-[#d4a960]/20">
                    <th className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-right text-gray-700">שם האירוע</th>
                    <th className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm font-semibold text-right text-gray-700">תאריך יצירה</th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map((event, index) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-[#faf8f3] transition-colors">
                      <td className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm text-gray-900">{event.name}</td>
                      <td className="px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm text-gray-500">{formatDate(event.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Pending Suppliers Action Card */}
        {stats.pendingSuppliers > 0 && (
          <Card className="p-4 md:p-6 border-2 border-[#d4a960]/20 hover:border-[#d4a960]/40 transition-all hover:shadow-xl bg-gradient-to-br from-white to-[#faf8f3]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-[#d4a960] to-[#c89645] shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900">ספקים ממתינים לאישור</h3>
                <p className="text-xs md:text-sm text-gray-600">יש {stats.pendingSuppliers} ספקים הממתינים לבדיקה ואישור</p>
              </div>
              <Button
                onClick={() => navigate('/admin/pending-suppliers')}
                className="bg-gradient-to-r from-[#d4a960] to-[#c89645] hover:from-[#c89645] hover:to-[#b8935a] text-white shadow-md hover:shadow-lg transition-all text-sm md:text-base w-full sm:w-auto"
              >
                עבור לעמוד אישורים
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
