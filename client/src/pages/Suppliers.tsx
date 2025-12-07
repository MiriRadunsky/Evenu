import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import {
  fetchSuppliers,
  fetchSupplierById,
  clearSelectedSupplier,
} from "../store/suppliersSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { MapPin, Search, Send } from "lucide-react";
import { SupplierDetailsDialog } from "../components/supplier/SupplierDetailsDialog";
import type { Supplier } from "../types/Supplier";
import { getImageUrl } from "../services/uploadFile";
import { createSupplierRequest } from "../store/supplierRequestsSlice";
import { Badge } from "../components/ui/badge";
import { SendRequestDialog } from "../components/Request/SendRequestDialog";
import { toast } from "sonner";

export default function Suppliers() {
  const dispatch: AppDispatch = useDispatch();
  const { suppliersList, selectedSupplier } = useSelector(
    (state: RootState) => state.suppliers
  );
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [regionFilter, setRegionFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewingSupplier, setViewingSupplier] = useState(false);
  const [sendRequest, setSendRequest] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [suppliersWithUrls, setSuppliersWithUrls] = useState<Supplier[]>([]);

  // דיבאונס לחיפוש
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // טוען ספקים עם פילטרים
  useEffect(() => {
    const filters: Record<string, string> = {};
    if (selectedCategory !== "הכל") filters.category = selectedCategory;
    if (regionFilter) filters.region = regionFilter;
    if (debouncedSearch) filters.q = debouncedSearch;
    console.log("🔍 Fetching suppliers with filters:", filters);
    dispatch(fetchSuppliers(filters));
  }, [dispatch, selectedCategory, regionFilter, debouncedSearch]);

  useEffect(() => {
    const loadUrls = async () => {
      if (!suppliersList) return;
      console.log(
        "📦 Suppliers from Redux:",
        suppliersList.length,
        "suppliers"
      );
      const updated = await Promise.all(
        suppliersList.map(async (s) => {
          if (s.profileImage?.key) {
            const key = await getImageUrl(s.profileImage.key);
            return { ...s, profileImage: { ...s.profileImage, key } };
          }
          return s;
        })
      );
      setSuppliersWithUrls(updated);
      console.log("✅ Suppliers with URLs ready:", updated.length);
    };
    loadUrls();
  }, [suppliersList]);

  const handleSelectSupplier = (id: string) => {
    dispatch(fetchSupplierById(id));
  };

  const handleSendRequest = async ({
    eventId,
    requestMessage,
    supplierId,
  }: {
    eventId: string;
    requestMessage: string;
    supplierId: string;
  }) => {
    try {
      setIsSending(true);
      setIsSending(false);
      setSendRequest(false);
      dispatch(clearSelectedSupplier());
      await dispatch(
        createSupplierRequest({
          eventId,
          notesFromClient: requestMessage,
          supplierId: supplierId,
        })
      ).unwrap();
      toast.success("הבקשה נשלחה בהצלחה");
     } catch (err:string | unknown) {
          const errorText = String(err);
           toast.error(errorText);
     }
  };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <h1 className="text-3xl font-bold">קטלוג ספקים</h1>

      {/* פילטרים */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">קטגוריה</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="הכל">הכל</SelectItem>
                  <SelectItem value="צלם">צלם</SelectItem>
                  <SelectItem value="להקה">להקה</SelectItem>
                  <SelectItem value="אולם">אולם</SelectItem>
                  <SelectItem value="קייטרינג">קייטרינג</SelectItem>
                  <SelectItem value="עיצוב">עיצוב</SelectItem>
                  <SelectItem value="אחר">אחר</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">אזור</label>
              <Input
                placeholder="חפש לפי אזור..."
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">חיפוש</label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="חפש ספק..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* רשימת ספקים */}
      {suppliersWithUrls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliersWithUrls.map((s) => (
            <Card
              key={s._id}
              className="hover:shadow-lg transition-all cursor-pointer"
              onClick={() => {
                handleSelectSupplier(s._id);
                setViewingSupplier(true);
              }}
            >
              <CardHeader>
                {s.profileImage?.key ? (
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
                    <img
                      src={s.profileImage.key}
                      alt={s.profileImage.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center">
                    אין תמונה
                  </div>
                )}
                <CardTitle className="text-lg">{s.user?.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {s.category && (
                  <Badge className="text-sm">{s.category.label}</Badge>
                )}

                {/* אזורים */}
                {s.regions && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{s.regions.join(", ")}</span>
                  </div>
                )}

                {/* סטטוס */}
                {s.status && (
                  <div className="text-sm">
                    <strong>סטטוס: </strong>
                    {s.status}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSendRequest(true);
                    handleSelectSupplier(s._id);
                  }}
                >
                  <Send className="ml-2 h-4 w-4" /> שלח בקשה
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              לא נמצאו ספקים התואמים את החיפוש
            </p>
          </CardContent>
        </Card>
      )}

      {/* דיאלוגים */}
      {selectedSupplier &&
        (sendRequest ? (
          <SendRequestDialog
            supplier={selectedSupplier}
            open={sendRequest}
            onOpenChange={(open) => !open && setSendRequest(false)}
            onSubmit={handleSendRequest}
            isLoading={false}
            isSending={isSending}
          />
        ) : (
          <SupplierDetailsDialog
            supplier={selectedSupplier}
            open={viewingSupplier}
            onOpenChange={(open) => !open && setViewingSupplier(false)}
            onSendRequest={() => {
              setViewingSupplier(false);
              setSendRequest(true);
            }}
            isSending={isSending}
          />
        ))}
    </div>
  );
}
