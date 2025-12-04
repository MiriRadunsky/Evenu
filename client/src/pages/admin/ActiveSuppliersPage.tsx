import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { ActiveSuppliersTable } from '../../components/admin/ActiveSuppliersTable';
import { Button } from '../../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getActiveSuppliers,
  blockSupplier,
  unblockSupplier,
  type ActiveSupplier
} from '../../services/admin';

export function ActiveSuppliersPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<ActiveSupplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setError(null);
      const data = await getActiveSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching active suppliers:', error);
      setError('שגיאה בטעינת רשימת הספקים הפעילים');
    } finally {
      setHasLoaded(true);
    }
  };

  const handleBlock = async (id: string) => {
    try {
      const supplier = suppliers.find(s => s._id === id);
      if (!supplier) return;

      if (supplier.status === 'blocked') {
        await unblockSupplier(id);
      } else {
        await blockSupplier(id);
      }

      // Refresh the list
      await fetchSuppliers();
    } catch (error) {
      console.error('Error blocking/unblocking supplier:', error);
      setError('שגיאה בשינוי סטטוס ספק');
    }
  };

  const handleView = (id: string) => {
    navigate(`/admin/suppliers/${id}`);
  };

  // Don't render until we have data from server
  if (!hasLoaded) {
    return <AdminLayout><div /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            חזרה
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ספקים פעילים</h1>
            <p className="text-sm sm:text-base text-gray-500 mt-1">נהל את הספקים הפעילים במערכת</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-lg">
            <p className="text-red-800 text-right">{error}</p>
          </div>
        )}

        {/* Suppliers Table */}
        <ActiveSuppliersTable
          suppliers={suppliers}
          onBlock={handleBlock}
          onView={handleView}
        />
      </div>
    </AdminLayout>
  );
}
