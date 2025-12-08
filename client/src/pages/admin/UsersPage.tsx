import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { ArrowRight, Mail, Phone, Calendar, Shield, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/axios';

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
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">משתמשים</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">כל המשתמשים במערכת</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 border-r-4 border-red-500 rounded-lg bg-red-50">
            <p className="text-right text-red-800">{error}</p>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button
            onClick={() => setFilter('all')}
            variant={filter === 'all' ? 'default' : 'outline'}
            className={`text-sm ${filter === 'all' ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' : ''}`}
          >
            הכל ({users.length})
          </Button>
          <Button
            onClick={() => setFilter('user')}
            variant={filter === 'user' ? 'default' : 'outline'}
            className={`text-sm ${filter === 'user' ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' : ''}`}
          >
            משתמשים ({users.filter(u => u.role === 'user').length})
          </Button>
          <Button
            onClick={() => setFilter('supplier')}
            variant={filter === 'supplier' ? 'default' : 'outline'}
            className={`text-sm ${filter === 'supplier' ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' : ''}`}
          >
            ספקים ({users.filter(u => u.role === 'supplier').length})
          </Button>
          <Button
            onClick={() => setFilter('admin')}
            variant={filter === 'admin' ? 'default' : 'outline'}
            className={`text-sm ${filter === 'admin' ? 'bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white' : ''}`}
          >
            מנהלים ({users.filter(u => u.role === 'admin').length})
          </Button>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[#faf8f3] to-[#f5f3ed] px-4 md:px-6 py-4 border-b-2 border-[#d4a960]/30">
            <h2 className="text-lg md:text-xl font-semibold text-[#8b6f47]">
              רשימת משתמשים ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="font-light text-gray-500">אין משתמשים להצגה</p>
            </div>
          ) : (
            <>
              {/* Mobile View - Cards */}
              <div className="block md:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="p-5 transition-colors border-b-2 border-gray-200 hover:bg-gray-50 mb-2"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="mb-2 text-lg font-semibold text-gray-900">{user.name}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {getRoleBadge(user.role)}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="flex-shrink-0 w-4 h-4" />
                          <span className="font-light break-all">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="flex-shrink-0 w-4 h-4" />
                          <span className="font-light">{user.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="flex-shrink-0 w-4 h-4" />
                          <span>הצטרף: {new Date(user.createdAt).toLocaleDateString('he-IL')}</span>
                        </div>
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
                      <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">שם</th>
                      <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">אימייל</th>
                      <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">טלפון</th>
                      <th className="px-6 py-4 text-sm font-semibold text-center text-gray-700">תפקיד</th>
                      <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">תאריך הצטרפות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="transition-colors border-b border-gray-100 hover:bg-gray-50"
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
            </>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
}
