import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import api from "../services/axios";
import { uploadFileToS3, getImageUrl } from "../services/uploadFile";
import { getErrorMessage } from "@/Utils/error";

interface SupplierProfileForm {
  baseBudget: string;
  description: string;
}

export default function SupplierEditProfile() {
  const navigate = useNavigate();
//   const dispatch: AppDispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState<SupplierProfileForm>({
    baseBudget: "",
    description: "",
  });

  const [priceListFile, setPriceListFile] = useState<File | null>(null);
  const [currentPriceFiles, setCurrentPriceFiles] = useState<Array<{key: string; originalName?: string; uploadedAt?: string}>>([]);
  const [priceFileUrls, setPriceFileUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load supplier profile on mount
  useEffect(() => {
    const loadSupplierProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current supplier data
        const response = await api.get("/suppliers/me");
        const supplier = response.data.supplier;

        if (supplier) {
          setFormData({
            baseBudget: supplier.baseBudget?.toString() || "",
            description: supplier.description || "",
          });

          // Load price files URLs if exist
          if (supplier.priceFiles && supplier.priceFiles.length > 0) {
            setCurrentPriceFiles(supplier.priceFiles);
            const urls: Record<string, string> = {};
            for (const file of supplier.priceFiles) {
              try {
                const url = await getImageUrl(file.key);
                urls[file.key] = url;
              } catch (e) {
                console.error(`Failed to load price file URL for ${file.key}`, e);
              }
            }
            setPriceFileUrls(urls);
          }
        }
      } catch (err) {
        setError(getErrorMessage(err, "שגיאה בטעינת פרופיל"));
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSupplierProfile();
    } else {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleInputChange = (field: keyof SupplierProfileForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const uploadData: {
        baseBudget?: number;
        description?: string;
        priceFiles?: Array<{ key: string; originalName?: string; contentType?: string }>;
      } = {};

      if (formData.baseBudget) {
        uploadData.baseBudget = Number(formData.baseBudget);
      }

      if (formData.description) {
        uploadData.description = formData.description;
      }

      // Upload price file if selected - append to existing files
      if (priceListFile) {
        const priceKey = await uploadFileToS3(priceListFile);
        // Add to existing files array
        uploadData.priceFiles = [
          ...currentPriceFiles,
          {
            key: priceKey,
            originalName: priceListFile.name,
            contentType: priceListFile.type,
          },
        ];
      }

      // Update supplier profile
      const response = await api.patch("/suppliers/add-images", uploadData);

      if (response.status === 201 || response.status === 200) {
        toast.success("הפרופיל עודכן בהצלחה");
        setPriceListFile(null);

        // Reload the current price files if updated
        if (uploadData.priceFiles) {
          setCurrentPriceFiles(uploadData.priceFiles);
          const urls: Record<string, string> = {};
          for (const file of uploadData.priceFiles) {
            try {
              const url = await getImageUrl(file.key);
              urls[file.key] = url;
            } catch (e) {
              console.error(`Failed to load price file URL for ${file.key}`, e);
            }
          }
          setPriceFileUrls(urls);
        }
      }
    } catch (err) {
      const errorMsg = getErrorMessage(err, "שגיאה בעדכון הפרופיל");
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">טוען פרופיל...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold">עריכת פרופיל</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>עדכון פרטי עסקי</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {error && (
              <div className="bg-red-50 p-4 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            {/* תקציב בסיסי */}
            <div>
              <label className="block text-sm font-medium mb-2">מחיר בסיסי (₪)</label>
              <Input
                type="number"
                placeholder="הזן מחיר בסיסי"
                value={formData.baseBudget}
                onChange={(e) => handleInputChange("baseBudget", e.target.value)}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground mt-1">
                זהו התקציב הבסיסי שלך — משמש לסינון בקטלוג הספקים
              </p>
            </div>

            {/* תיאור */}
            <div>
              <label className="block text-sm font-medium mb-2">תיאור השירותים</label>
              <textarea
                placeholder="תיאור קצר על השירותים שלך"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="w-full px-4 py-3 border rounded-2xl h-24 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* קבצי מחירון */}
            <div>
              <label className="block text-sm font-medium mb-2">קבצי מחירון (אופציונלי)</label>
              <div className="space-y-3">
                {currentPriceFiles && currentPriceFiles.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-blue-900">קבצים קיימים:</p>
                    {currentPriceFiles.map((file, idx) => (
                      <div key={file.key} className="flex items-center justify-between bg-white p-2 rounded">
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{file.originalName || `קובץ ${idx + 1}`}</p>
                          {file.uploadedAt && (
                            <p className="text-xs text-gray-500">
                              הועלה ב: {new Date(file.uploadedAt).toLocaleDateString("he-IL")}
                            </p>
                          )}
                        </div>
                        {priceFileUrls[file.key] && (
                          <a
                            href={priceFileUrls[file.key]}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline text-sm ml-2"
                          >
                            הצג
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentPriceFiles(currentPriceFiles.filter((_, i) => i !== idx));
                            const newUrls = { ...priceFileUrls };
                            delete newUrls[file.key];
                            setPriceFileUrls(newUrls);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm ml-2"
                        >
                          מחק
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition w-fit">
                    <span className="text-sm">הוסף קובץ חדש (PDF / Excel)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.xlsx,.xls,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setPriceListFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                  {priceListFile && (
                    <p className="text-sm text-gray-700 mt-2">
                      בחרת להוסיף: {priceListFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* כפתור שמירה */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full h-11 bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 ml-2" />
                  שומר...
                </>
              ) : (
                "שמור שינויים"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
