import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowRight, Mail, Phone, Calendar, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'user' | 'supplier' | 'admin'>('all');
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setError(null);
      const response = await api.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('שגיאה בטעינת משתמשים');
    } finally {
      setHasLoaded(true);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white">
            <Shield className="w-4 h-4" />
            מנהל
          </span>
        );
      case 'supplier':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#f5f3ed] text-[#b8935a] border border-[#b8935a]/30">
            <User className="w-4 h-4" />
            ספק
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#faf8f3] text-[#8b6f47] border border-[#d4a960]/30">
            <User className="w-4 h-4" />
            משתמש
          </span>
        );
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(user => user.role === filter);

  // Don't render until we have data from server
  if (!hasLoaded) {
    return <AdminLayout><div /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">משתמשים</h1>
            <p className="text-gray-500 mt-1">כל המשתמשים במערכת</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-800 text-right">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={filter === 'all' ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' : ''}
          >
            הכל ({users.length})
          </Button>
          <Button
            onClick={() => setFilter('user')}
            variant={filter === 'user' ? 'default' : 'outline'}
            className={filter === 'user' ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' : ''}
          >
            משתמשים ({users.filter(u => u.role === 'user').length})
          </Button>
          <Button
            onClick={() => setFilter('supplier')}
            variant={filter === 'supplier' ? 'default' : 'outline'}
            className={filter === 'supplier' ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' : ''}
          >
            ספקים ({users.filter(u => u.role === 'supplier').length})
          </Button>
          <Button
            onClick={() => setFilter('admin')}
            variant={filter === 'admin' ? 'default' : 'outline'}
            className={filter === 'admin' ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' : ''}
          >
            מנהלים ({users.filter(u => u.role === 'admin').length})
          </Button>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[#faf8f3] to-[#f5f3ed] px-6 py-4 border-b-2 border-[#d4a960]/30">
            <h2 className="text-xl font-semibold text-[#8b6f47]">
              רשימת משתמשים ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 font-light">אין משתמשים להצגה</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">שם</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">אימייל</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">טלפון</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">תפקיד</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">תאריך הצטרפות</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="font-light">{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="font-light">{user.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="font-light">
                            {new Date(user.createdAt).toLocaleDateString('he-IL')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
