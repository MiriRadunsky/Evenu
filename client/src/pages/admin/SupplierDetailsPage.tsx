import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { 
  ArrowRight, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  Ban,
  AlertCircle,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { 
  getSupplierDetails, 
  blockSupplier, 
  unblockSupplier, 
  approveSupplier, 
  rejectSupplier, 
  type SupplierDetails 
} from '../../services/admin';

export function SupplierDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<SupplierDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ⭐ useEffect ללא אזהרות ESLint, ללא לולאה מתמשכת
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setError(null);
        const data = await getSupplierDetails(id);
        setSupplier(data);
      } catch (error) {
        console.error('Error fetching supplier details:', error);
        setError('שגיאה בטעינת פרטי הספק');
      }
    };

    load();
  }, [id]);

  const handleApprove = async () => {
    if (!supplier) return;
    try {
      setActionLoading(true);
      await approveSupplier(supplier._id);
      const updated = await getSupplierDetails(supplier._id);
      setSupplier(updated);
    } catch (error) {
      console.error('Error approving supplier:', error);
      setError('שגיאה באישור ספק');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!supplier) return;
    try {
      setActionLoading(true);
      await rejectSupplier(supplier._id);
      navigate('/admin/pending-suppliers');
    } catch (error) {
      console.error('Error rejecting supplier:', error);
      setError('שגיאה בדחיית ספק');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!supplier) return;
    try {
      setActionLoading(true);
      if (supplier.status === 'נחסם') {
        await unblockSupplier(supplier._id);
      } else {
        await blockSupplier(supplier._id);
      }
      const updated = await getSupplierDetails(supplier._id);
      setSupplier(updated);
    } catch (error) {
      console.error('Error blocking/unblocking supplier:', error);
      setError('שגיאה בשינוי סטטוס ספק');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'בהמתנה':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white font-medium">
            <Clock className="w-5 h-5" />
            ממתין לאישור
          </span>
        );
      case 'מאושר':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#b8935a] to-[#a67c3d] text-white font-medium">
            <CheckCircle className="w-5 h-5" />
            מאושר ופעיל
          </span>
        );
      case 'נחסם':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white rounded-lg bg-gradient-to-r from-red-500 to-red-600">
            <Ban className="w-5 h-5" />
            חסום
          </span>
        );
      case 'נפסל':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 font-medium text-white bg-gray-500 rounded-lg">
            <AlertCircle className="w-5 h-5" />
            נדחה
          </span>
        );
      default:
        return null;
    }
  };

  // ✨ מצב טעינה / שגיאה
  if (!supplier) {
    if (error) {
      return (
        <AdminLayout>
          <div className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold">שגיאה</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <Button onClick={() => navigate('/admin/active-suppliers')}>
              חזרה לרשימת ספקים
            </Button>
          </div>
        </AdminLayout>
      );
    }
    return <AdminLayout><div /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה
            </Button>

            <div>
              <h1 className="text-3xl font-bold">{supplier.name}</h1>
              <p className="text-gray-500">{supplier.category}</p>
            </div>
          </div>

          {getStatusBadge(supplier.status)}
        </div>

        {error && (
          <div className="p-4 border-r-4 border-red-500 rounded-lg bg-red-50">
            <p className="text-right text-red-800">{error}</p>
          </div>
        )}

        {/* ACTIONS */}
        <Card className="p-6 bg-gradient-to-br from-white to-[#faf8f3]">
          <h3 className="mb-4 text-lg font-semibold">פעולות</h3>

          <div className="flex flex-wrap gap-3">
            {supplier.status === 'בהמתנה' && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-[#b8935a] to-[#a67c3d] text-white"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  אשר ספק
                </Button>

                <Button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="text-white bg-gradient-to-r from-red-500 to-red-600"
                >
                  <AlertCircle className="w-4 h-4 ml-2" />
                  דחה ספק
                </Button>
              </>
            )}

            {(supplier.status === 'מאושר' || supplier.status === 'נחסם') && (
              <Button
                onClick={handleBlock}
                disabled={actionLoading}
                className={
                  supplier.status === 'נחסם'
                    ? "bg-gradient-to-r from-[#b8935a] to-[#a67c3d] text-white"
                    : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                }
              >
                <Ban className="w-4 h-4 ml-2" />
                {supplier.status === 'נחסם' ? 'בטל חסימה' : 'חסום ספק'}
              </Button>
            )}
          </div>
        </Card>

        {/* CONTACT + STATS */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          <Card className="p-6">
            <h3 className="mb-4 text-xl font-semibold">פרטי יצירת קשר</h3>
            <div className="space-y-4">

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#d4a960]" />
                <div>
                  <p className="text-sm text-gray-500">אימייל</p>
                  <p className="font-medium">{supplier.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#d4a960]" />
                <div>
                  <p className="text-sm text-gray-500">טלפון</p>
                  <p className="font-medium">{supplier.phone}</p>
                </div>
              </div>

            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-xl font-semibold">סטטיסטיקות</h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#b8935a]" />
                <div>
                  <p className="text-sm text-gray-500">אירועים פעילים</p>
                  <p className="text-2xl font-bold">{supplier.eventsCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#b8935a]" />
                <div>
                  <p className="text-sm text-gray-500">תאריך הצטרפות</p>
                  <p className="font-medium">
                    {new Date(supplier.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* PROFILE IMAGE */}
        {supplier.profileImage && (
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold">
              <ImageIcon className="w-5 h-5 text-[#d4a960]" />
              תמונת פרופיל
            </h3>

            <div className="overflow-hidden border rounded-lg aspect-video">
              <img
                src={supplier.profileImage.url}
                alt={supplier.profileImage.alt || supplier.name}
                className="object-cover w-full h-full"
              />
            </div>
          </Card>
        )}

        {/* DESCRIPTION */}
        {supplier.description && (
          <Card className="p-6">
            <h3 className="mb-4 text-xl font-semibold">תיאור</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{supplier.description}</p>
          </Card>
        )}

        {/* REGIONS */}
        {supplier.regions && (
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold">
              <MapPin className="w-5 h-5 text-[#d4a960]" />
              אזורי שירות
            </h3>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#faf8f3] border rounded-full text-sm">
                {supplier.regions}
              </span>
            </div>
          </Card>
        )}

        {/* PORTFOLIO */}
        {supplier.portfolio && supplier.portfolio.length > 0 && (
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold">
              <ImageIcon className="w-5 h-5 text-[#d4a960]" />
              גלריה ({supplier.portfolio.length})
            </h3>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {supplier.portfolio.map((item, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-lg overflow-hidden border hover:border-[#d4a960]"
                >
                  <img
                    src={item.url}
                    alt={item.alt || `תמונה ${index + 1}`}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />

                  {item.alt && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-sm font-medium text-white">{item.alt}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

      </div>
    </AdminLayout>
  );
}
