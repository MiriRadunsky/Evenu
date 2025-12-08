import { useState } from 'react';
import { Check, X, Mail, Phone, Eye, User } from 'lucide-react';
import { Button } from '../ui/button';

interface PendingSupplier {
  _id: string;
  name: string;
  email: string;
  phone: string;
  category: string;
  createdAt: string;
  profileImage?: { url: string; alt?: string } | null;
}

interface PendingSuppliersTableProps {
  suppliers: PendingSupplier[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
  onView?: (id: string) => void;
}

export function PendingSuppliersTable({ suppliers, onApprove, onReject, onView }: PendingSuppliersTableProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setLoading(id);
    try {
      if (action === 'approve') {
        await onApprove(id);
      } else {
        await onReject(id);
      }
    } finally {
      setLoading(null);
    }
  };

  if (suppliers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border-2 border-gray-100 p-8 text-center">
        <p className="text-gray-500 font-light">אין ספקים ממתינים לאישור</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-[#faf8f3] to-[#f5f3ed] px-4 md:px-6 py-4 border-b-2 border-[#d4a960]/30">
        <h2 className="text-lg md:text-xl font-semibold text-[#8b6f47]">
          ספקים ממתינים לאישור ({suppliers.length})
        </h2>
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden">
        {suppliers.map((supplier) => (
          <div
            key={supplier._id}
            className="p-4 transition-colors border-b-2 border-gray-200 hover:bg-gray-50 mb-2"
          >
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                {/* Profile Image */}
                <div className="flex-shrink-0 w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-[#d4a960] to-[#c89645] flex items-center justify-center">
                  {supplier.profileImage?.url ? (
                    <img src={supplier.profileImage.url} alt={supplier.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 text-lg mb-1">{supplier.name}</div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#faf8f3] text-[#8b6f47] border border-[#d4a960]/30">
                    {supplier.category}
                  </span>
                </div>
                
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    ממתין
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="font-light break-all">{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="font-light">{supplier.phone}</span>
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(supplier.createdAt).toLocaleDateString('he-IL')}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {onView && (
                  <Button
                    onClick={() => onView(supplier._id)}
                    className="flex-1 min-w-[100px] bg-gradient-to-r from-[#d4a960] to-[#c89645] hover:from-[#c89645] hover:to-[#b8935a] text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    צפה
                  </Button>
                )}
                <Button
                  onClick={() => handleAction(supplier._id, 'approve')}
                  disabled={loading === supplier._id}
                  className="flex-1 min-w-[100px] bg-gradient-to-r from-[#b8935a] to-[#a67c3d] hover:from-[#a67c3d] hover:to-[#947142] text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md text-sm"
                >
                  <Check className="w-4 h-4" />
                  אשר
                </Button>
                <Button
                  onClick={() => handleAction(supplier._id, 'reject')}
                  disabled={loading === supplier._id}
                  className="flex-1 min-w-[100px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md text-sm"
                >
                  <X className="w-4 h-4" />
                  דחה
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
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">אימייל</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">טלפון</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">קטגוריה</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">תאריך הגשה</th>
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
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-[#d4a960] to-[#c89645] flex items-center justify-center">
                      {supplier.profileImage?.url ? (
                        <img src={supplier.profileImage.url} alt={supplier.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="font-light">{supplier.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span className="font-light">{supplier.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#faf8f3] text-[#8b6f47] border border-[#d4a960]/30">
                    {supplier.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600 font-light">
                  {new Date(supplier.createdAt).toLocaleDateString('he-IL')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {onView && (
                      <Button
                        onClick={() => onView(supplier._id)}
                        className="bg-gradient-to-r from-[#d4a960] to-[#c89645] hover:from-[#c89645] hover:to-[#b8935a] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
                      >
                        <Eye className="w-4 h-4" />
                        צפה
                      </Button>
                    )}
                    <Button
                      onClick={() => handleAction(supplier._id, 'approve')}
                      disabled={loading === supplier._id}
                      className="bg-gradient-to-r from-[#b8935a] to-[#a67c3d] hover:from-[#a67c3d] hover:to-[#947142] text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                      <Check className="w-4 h-4" />
                      אשר
                    </Button>
                    <Button
                      onClick={() => handleAction(supplier._id, 'reject')}
                      disabled={loading === supplier._id}
                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
                    >
                      <X className="w-4 h-4" />
                      דחה
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
