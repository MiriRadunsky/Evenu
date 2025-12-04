import { useState } from 'react';
import { Ban, Eye, Calendar, CheckCircle, User } from 'lucide-react';
import { Button } from '../ui/button';

interface ActiveSupplier {
  _id: string;
  name: string;
  email: string;
  category: string;
  status: 'active' | 'blocked';
  eventsCount: number;
  joinedAt: string;
  profileImage?: { url: string; alt?: string } | null;
}

interface ActiveSuppliersTableProps {
  suppliers: ActiveSupplier[];
  onBlock: (id: string) => Promise<void>;
  onView: (id: string) => void;
}

export function ActiveSuppliersTable({ suppliers, onBlock, onView }: ActiveSuppliersTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleBlock = async (id: string) => {
    setLoading(id);
    try {
      await onBlock(id);
    } finally {
      setLoading(null);
    }
  };

  if (suppliers.length === 0) {
    return (
      <div className="p-8 text-center bg-white border-2 border-gray-100 rounded-2xl">
        <p className="font-light text-gray-500">אין ספקים פעילים</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white border-2 border-gray-100 rounded-2xl">
      <div className="bg-gradient-to-r from-[#f5f3ed] to-[#f8f6f0] px-4 md:px-6 py-4 border-b-2 border-[#b8935a]/30">
        <h2 className="text-lg md:text-xl font-semibold text-[#8b6f47]">
          ספקים פעילים ({suppliers.length})
        </h2>
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden">
        {suppliers.map((supplier) => (
          <div
            key={supplier._id}
            className="p-4 transition-colors border-b border-gray-100 hover:bg-gray-50"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {/* Profile Image */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#b8935a] to-[#a67c3d] flex items-center justify-center">
                  {supplier.profileImage?.url ? (
                    <img src={supplier.profileImage.url} alt={supplier.name} className="object-cover w-full h-full" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="mb-1 text-lg font-semibold text-gray-900">{supplier.name}</div>
                  <div className="text-sm text-gray-500">{supplier.email}</div>
                </div>
                
                <div className="flex-shrink-0">
                  {supplier.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#b8935a] to-[#a67c3d] text-white shadow-sm">
                      <CheckCircle className="w-3.5 h-3.5" />
                      פעיל
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">
                      <Ban className="w-3.5 h-3.5" />
                      חסום
                    </span>
                  )}
                </div>
              </div>
              
              <div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#faf8f3] text-[#8b6f47] border border-[#d4a960]/30">
                  {supplier.category}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-[#d4a960]">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">{supplier.eventsCount} אירועים</span>
                </div>
                <div className="text-xs text-gray-500">
                  הצטרף: {new Date(supplier.joinedAt).toLocaleDateString('he-IL')}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => onView(supplier._id)}
                  className="flex-1 bg-gradient-to-r from-[#d4a960] to-[#c89645] hover:from-[#c89645] hover:to-[#b8935a] text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                >
                  <Eye className="w-4 h-4" />
                  צפה
                </Button>
                <Button
                  onClick={() => handleBlock(supplier._id)}
                  disabled={loading === supplier._id || supplier.status === 'blocked'}
                  className="flex items-center justify-center flex-1 gap-2 px-3 py-2 text-sm text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Ban className="w-4 h-4" />
                  חסום
                </Button>
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
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">שם הספק</th>
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">קטגוריה</th>
              <th className="px-6 py-4 text-sm font-semibold text-center text-gray-700">סטטוס</th>
              <th className="px-6 py-4 text-sm font-semibold text-center text-gray-700">אירועים פעילים</th>
              <th className="px-6 py-4 text-sm font-semibold text-right text-gray-700">תאריך הצטרפות</th>
              <th className="px-6 py-4 text-sm font-semibold text-center text-gray-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr
                key={supplier._id}
                className="transition-colors border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#b8935a] to-[#a67c3d] flex items-center justify-center">
                      {supplier.profileImage?.url ? (
                        <img src={supplier.profileImage.url} alt={supplier.name} className="object-cover w-full h-full" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{supplier.name}</div>
                      <div className="text-sm font-light text-gray-500">{supplier.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#faf8f3] text-[#8b6f47] border border-[#d4a960]/30">
                    {supplier.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {supplier.status === 'active' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-[#f5f3ed] text-[#b8935a] border border-[#b8935a]/30">
                      <CheckCircle className="w-4 h-4" />
                      פעיל
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">
                      <Ban className="w-4 h-4" />
                      חסום
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-[#d4a960]" />
                    <span className="font-semibold text-[#d4a960]">{supplier.eventsCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-light text-gray-600">
                  {new Date(supplier.joinedAt).toLocaleDateString('he-IL')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      onClick={() => onView(supplier._id)}
                      className="bg-gradient-to-r from-[#d4a960] to-[#c89645] hover:from-[#c89645] hover:to-[#b8935a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      צפה
                    </Button>
                    <Button
                      onClick={() => handleBlock(supplier._id)}
                      disabled={loading === supplier._id || supplier.status === 'blocked'}
                      className="flex items-center gap-2 px-4 py-2 text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                    >
                      <Ban className="w-4 h-4" />
                      חסום
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
