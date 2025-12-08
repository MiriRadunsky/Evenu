import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { PendingSuppliersTable } from '../../components/admin/PendingSuppliersTable';
import { Button } from '../../components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getPendingSuppliers,
  approveSupplier,
  rejectSupplier,
  type PendingSupplier
} from '../../services/admin';

export function PendingSuppliersPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<PendingSupplier[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setError(null);
      const data = await getPendingSuppliers();
      setSuppliers(data);
    } catch (error) {
      console.error('Error fetching pending suppliers:', error);
      setError('שגיאה בטעינת רשימת הספקים הממתינים');
    } finally {
      setHasLoaded(true);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveSupplier(id);
      setSuppliers(prev => prev.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error approving supplier:', error);
      setError('שגיאה באישור ספק');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectSupplier(id);
      setSuppliers(prev => prev.filter(s => s._id !== id));
    } catch (error) {
      console.error('Error rejecting supplier:', error);
      setError('שגיאה בדחיית ספק');
    }
  };

  const handleView = (id: string) => {
    navigate(`/admin/suppliers/${id}`);
  };

  if (!hasLoaded) {
    return <AdminLayout><div /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
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
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">ספקים ממתינים לאישור</h1>
            <p className="mt-1 text-sm text-gray-500 sm:text-base">בדוק ואשר ספקים חדשים</p>
          </div>
        </div>

        {error && (
          <div className="p-4 border-r-4 border-red-500 rounded-lg bg-red-50">
            <p className="text-right text-red-800">{error}</p>
          </div>
        )}

        <PendingSuppliersTable
          suppliers={suppliers}
          onApprove={handleApprove}
          onReject={handleReject}
          onView={handleView}
        />
      </div>
    </AdminLayout>
  );
}
