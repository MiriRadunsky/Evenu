import { useState } from 'react';
import { Ban, Eye, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface ActiveSupplier {
  _id: string;
  name: string;
  email: string;
  category: string;
  status: 'active' | 'blocked';
  eventsCount: number;
  joinedAt: string;
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
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-center">
        <p className="text-gray-500 font-light">אין ספקים פעילים</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
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
            className="border-b border-gray-100 p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-lg mb-1">{supplier.name}</div>
                  <div className="text-sm text-gray-500">{supplier.email}</div>
                </div>
                <div>
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
                <div className="text-gray-500 text-xs">
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
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm"
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
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">שם הספק</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">קטגוריה</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">סטטוס</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">אירועים פעילים</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">תאריך הצטרפות</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier) => (
              <tr
                key={supplier._id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{supplier.name}</div>
                  <div className="text-sm text-gray-500 font-light">{supplier.email}</div>
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
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
                <td className="px-6 py-4 text-gray-600 font-light">
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
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
