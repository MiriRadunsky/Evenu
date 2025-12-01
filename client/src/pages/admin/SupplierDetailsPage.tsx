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
import { getSupplierDetails, blockSupplier, unblockSupplier, approveSupplier, rejectSupplier, type SupplierDetails } from '../../services/admin';

export function SupplierDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<SupplierDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSupplierDetails = async () => {
    try {
      setError(null);
      const data = await getSupplierDetails(id!);
      setSupplier(data);
    } catch (error) {
      console.error('Error fetching supplier details:', error);
      setError('שגיאה בטעינת פרטי הספק');
    }
  };

  useEffect(() => {
    if (id) {
      fetchSupplierDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleApprove = async () => {
    if (!supplier) return;
    try {
      setActionLoading(true);
      await approveSupplier(supplier._id);
      await fetchSupplierDetails();
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
      await fetchSupplierDetails();
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
          <span className="inline-flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 rounded-md sm:rounded-lg bg-gradient-to-r from-[#d4a960] to-[#c89645] text-white font-medium text-xs sm:text-base">
            <Clock className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            ממתין לאישור
          </span>
        );
      case 'מאושר':
        return (
          <span className="inline-flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-4 sm:py-2 rounded-md sm:rounded-lg bg-gradient-to-r from-[#b8935a] to-[#a67c3d] text-white font-medium text-xs sm:text-base">
            <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            מאושר ופעיל
          </span>
        );
      case 'נחסם':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-md sm:gap-2 sm:px-4 sm:py-2 sm:rounded-lg bg-gradient-to-r from-red-500 to-red-600 sm:text-base">
            <Ban className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            חסום
          </span>
        );
      case 'נפסל':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-gray-500 rounded-md sm:gap-2 sm:px-4 sm:py-2 sm:rounded-lg sm:text-base">
            <AlertCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            נדחה
          </span>
        );
      default:
        return null;
    }
  };

  // Don't show error page while loading - wait for data
  if (!supplier) {
    // If we have an error AND no supplier, show error page
    if (error) {
      return (
        <AdminLayout>
          <div className="py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold text-gray-900">שגיאה</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <Button onClick={() => navigate('/admin/active-suppliers')}>
              חזרה לרשימת ספקים
            </Button>
          </div>
        </AdminLayout>
      );
    }
    // Still loading, show empty layout
    return <AdminLayout><div /></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
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
              <h1 className="text-3xl font-bold text-gray-900">{supplier.name}</h1>
              <p className="mt-1 text-gray-500">{supplier.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(supplier.status)}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 border-r-4 border-red-500 rounded-lg bg-red-50">
            <p className="text-right text-red-800">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <Card className="p-6 bg-gradient-to-br from-white to-[#faf8f3]">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">פעולות</h3>
          <div className="flex flex-wrap gap-3">
            {supplier.status === 'בהמתנה' && (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="bg-gradient-to-r from-[#b8935a] to-[#a67c3d] hover:from-[#a67c3d] hover:to-[#947142] text-white shadow-md hover:shadow-lg"
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  אשר ספק
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="text-white shadow-md bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg"
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
                className={supplier.status === 'נחסם' 
                  ? "bg-gradient-to-r from-[#b8935a] to-[#a67c3d] hover:from-[#a67c3d] hover:to-[#947142] text-white shadow-md hover:shadow-lg"
                  : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg"
                }
              >
                <Ban className="w-4 h-4 ml-2" />
                {supplier.status === 'נחסם' ? 'בטל חסימה' : 'חסום ספק'}
              </Button>
            )}
          </div>
        </Card>

        {/* Main Info Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Contact Info */}
          <Card className="p-6 border-2 border-[#d4a960]/20 hover:border-[#d4a960]/40 transition-all">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">פרטי יצירת קשר</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#faf8f3]">
                  <Mail className="w-5 h-5 text-[#d4a960]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">אימייל</p>
                  <p className="font-medium text-gray-900">{supplier.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#faf8f3]">
                  <Phone className="w-5 h-5 text-[#d4a960]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">טלפון</p>
                  <p className="font-medium text-gray-900">{supplier.phone}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card className="p-6 border-2 border-[#b8935a]/20 hover:border-[#b8935a]/40 transition-all">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">סטטיסטיקות</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#f5f3ed]">
                  <Calendar className="w-5 h-5 text-[#b8935a]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">אירועים פעילים</p>
                  <p className="font-bold text-2xl text-[#b8935a]">{supplier.eventsCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#f5f3ed]">
                  <Calendar className="w-5 h-5 text-[#b8935a]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">תאריך הצטרפות</p>
                  <p className="font-medium text-gray-900">
                    {new Date(supplier.createdAt).toLocaleDateString('he-IL')}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Profile Image */}
        {supplier.profileImage && (
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
              <ImageIcon className="w-5 h-5 text-[#d4a960]" />
              תמונת פרופיל
            </h3>
            <div className="aspect-video rounded-lg overflow-hidden border-2 border-[#d4a960]/20 hover:border-[#d4a960]/60 transition-all max-w-md">
              <img
                src={supplier.profileImage.url}
                alt={supplier.profileImage.alt || supplier.name}
                className="object-cover w-full h-full"
              />
            </div>
          </Card>
        )}

        {/* Description */}
        {supplier.description && (
          <Card className="p-6">
            <h3 className="mb-4 text-xl font-semibold text-gray-900">תיאור</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{supplier.description}</p>
          </Card>
        )}

        {/* Regions */}
        {supplier.regions && supplier.regions.length > 0 && (
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
              <MapPin className="w-5 h-5 text-[#d4a960]" />
              אזורי שירות
            </h3>
            <div className="flex flex-wrap gap-2">
              {supplier.regions.map((region, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#faf8f3] text-[#8b6f47] rounded-full text-sm font-medium border border-[#d4a960]/30"
                >
                  {region}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Kashrut - only if exists */}
        {supplier.kashrut && (
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
              <CheckCircle className="w-5 h-5 text-[#d4a960]" />
              כשרות
            </h3>
            <p className="text-xl font-medium text-gray-900">{supplier.kashrut}</p>
          </Card>
        )}

        {/* Portfolio */}
        {supplier.portfolio && supplier.portfolio.length > 0 && (
          <Card className="p-6">
            <h3 className="flex items-center gap-2 mb-4 text-xl font-semibold text-gray-900">
              <ImageIcon className="w-5 h-5 text-[#d4a960]" />
              גלריה ({supplier.portfolio.length})
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {supplier.portfolio.map((item, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded-lg overflow-hidden border-2 border-[#d4a960]/20 hover:border-[#d4a960]/60 transition-all"
                >
                  <img
                    src={item.url}
                    alt={item.title || `תמונה ${index + 1}`}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                  />
                  {item.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                      <p className="text-sm font-medium text-white">{item.title}</p>
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
