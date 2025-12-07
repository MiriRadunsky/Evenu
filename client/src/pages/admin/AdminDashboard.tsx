import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, Calendar, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import AdminLayout from './AdminLayout';
import {
  getAdminStats,
  type AdminStats
} from '../../services/admin';

export function AdminDashboard() {
  const navigate = useNavigate();

  // הסרנו activeSuppliers
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalSuppliers: 0,
    pendingSuppliers: 0,
    totalEvents: 0,
    activeContracts: 0,
    totalRevenue: 0
  });

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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('שגיאה בטעינת נתוני הדשבורד');
    } finally {
      setHasLoaded(true);
    }
  };

  const statsCards = [
    {
      title: 'ספקים ממתינים',
      value: stats.pendingSuppliers,
      icon: UserCheck,
      color: 'from-[#d4a960] to-[#c89645]',
      bgLight: 'bg-[#faf8f3]',
      link: '/admin/pending-suppliers'
    },
    {
      title: 'סה"כ ספקים',
      value: stats.totalSuppliers,
      icon: Users,
      color: 'from-[#b8935a] to-[#a67c3d]',
      bgLight: 'bg-[#f5f3ed]',
      link: '/admin/active-suppliers'
    },
    {
      title: 'סה"כ משתמשים',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-[#c9a55f] to-[#b88e48]',
      bgLight: 'bg-[#f8f6f0]',
      link: '/admin/users'
    },
    {
      title: 'סה"כ אירועים',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'from-[#dbb76d] to-[#ca9f52]',
      bgLight: 'bg-[#fcfaf6]',
      link: '/admin/events'
    }
  ];

  if (!hasLoaded) {
    return (
      <AdminLayout>
        <div />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">לוח בקרה</h1>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">מבט כללי על המערכת</p>
        </div>

        {error && (
          <div className="p-4 border-r-4 border-red-500 rounded-lg bg-red-50">
            <p className="text-right text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card
              key={index}
              className={`relative overflow-hidden cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1 border-2 hover:border-[#d4a960]/40 ${stat.bgLight}`}
              onClick={() => navigate(stat.link)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color} shadow-md`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-[#d4a960] to-[#c89645] bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                </div>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* כרטיס ספקים ממתינים */}
        <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
          <Card className="p-6 border-2 border-[#d4a960]/20 hover:border-[#d4a960]/40 transition-all hover:shadow-xl bg-gradient-to-br from-white to-[#faf8f3]">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-[#d4a960] to-[#c89645] shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">ספקים ממתינים לאישור</h3>
                <p className="text-sm text-gray-600">יש {stats.pendingSuppliers} ספקים הממתינים לבדיקה</p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/admin/pending-suppliers')}
              className="w-full bg-gradient-to-r from-[#d4a960] to-[#c89645] hover:from-[#c89645] hover:to-[#b8935a] text-white shadow-md hover:shadow-lg transition-all"
            >
              עבור לעמוד אישורים
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </Card>

          {/* הסרתי את כל כרטיס "ספקים פעילים" כי אין activeSuppliers */}
        </div>
      </div>
    </AdminLayout>
  );
}
