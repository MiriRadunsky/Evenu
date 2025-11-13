import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Search, Send } from "lucide-react";
import { toast } from "sonner";
// import { SendRequestDialog } from "../components/SendRequestDialog";
import { SupplierDetailsDialog } from "../components/SupplierDetailsDialog";
import type { Supplier } from "../types/Supplier";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  clearSelectedSupplier,
  fetchSupplierById,
  fetchSuppliers,
} from "../store/suppliersSlice";
import { SendRequestDialog } from "../components/SendRequestDialog";

export default function Suppliers() {
  const [selectedCategory, setSelectedCategory] = useState("הכל");
  const [searchTerm, setSearchTerm] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [viewingSupplier, setViewingSupplier] = useState<boolean>(false);
  const [sendReguest, setSendReguest] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const dispatch: AppDispatch = useDispatch();
  const { suppliersList, loadingList, loadingOne, error, selectedSupplier } =
    useSelector((state: RootState) => state.suppliers);
  useEffect(() => {
    const filters: Record<string, string> = {};
    if (selectedCategory !== "הכל") filters.category = selectedCategory;
    if (regionFilter) filters.region = regionFilter;
    if (searchTerm) filters.q = searchTerm;

    dispatch(fetchSuppliers(filters));
  }, [dispatch, selectedCategory, regionFilter, searchTerm]);

  const handleSelectSupplier = (id: string) => {
    console.log(id);

    dispatch(fetchSupplierById(id));
    setViewingSupplier(true);
  };
  // const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  // const [supplierList, setsupplierList] = useState<Supplier[] | null>(null);
  // const [loadingList, setLoadingList] = useState(false);
  // const [loadingOne, setLoadingOne] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const { data: events } = useEntityGetAll(EventsEntity, {
  //   clientEmail: user.email,
  // });

  // const { createFunction, isLoading: isSending } = useEntityCreate(
  //   SupplierRequestsEntity
  // );

  // const filteredSuppliers = useMemo(() => {
  //   if (!suppliers) return [];

  //   return suppliers.filter((supplier) => {
  //     const matchesCategory =
  //       selectedCategory === "הכל" || supplier.category === selectedCategory;
  //     const matchesSearch =
  //       !searchTerm ||
  //       supplier.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
  //     const matchesRegion =
  //       !regionFilter ||
  //       supplier.region?.toLowerCase().includes(regionFilter.toLowerCase());

  //     return matchesCategory && matchesSearch && matchesRegion;
  //   });
  // }, [suppliers, selectedCategory, searchTerm, regionFilter]);

  const handleSendRequest = () => {
    setIsSending(true);
    console.log("requesting send...");

    dispatch(clearSelectedSupplier());

    setIsSending(false);
    setSendReguest(false);
  };

  // const handleSendRequest = async (data: {
  //   eventId: string;
  //   requestMessage: string;
  // }) => {
  //   if (!selectedSupplier) return;

  //   try {
  //     await createFunction({
  //       data: {
  //         eventId: data.eventId,
  //         supplierId: selectedSupplier.id,
  //         clientEmail: user.email,
  //         requestMessage: data.requestMessage,
  //         status: "ממתין",
  //         requestDate: new Date().toISOString(),
  //       },
  //     });
  //     toast.success("הבקשה נשלחה בהצלחה");
  //     setSelectedSupplier(null);
  //   } catch (error) {
  //     toast.error("שגיאה בשליחת הבקשה");
  //   }
  // };

  return (
    <div className="space-y-6" style={{ direction: "rtl" }}>
      <div>
        <h1 className="text-3xl font-bold">קטלוג ספקים</h1>
      </div>

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
                  <SelectItem value="קייטרינג">צלם</SelectItem>
                  <SelectItem value="צילום">להקה</SelectItem>
                  <SelectItem value="מוזיקה">אולם</SelectItem>
                  <SelectItem value="פרחים">קייטרינג</SelectItem>
                  <SelectItem value="הסעות">עיצוב</SelectItem>
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
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

      {suppliersList ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliersList.map((supplier: Supplier) => (
            <Card
              key={supplier._id}
              className="hover:shadow-lg transition-all hover:border-primary cursor-pointer"
              onClick={() => handleSelectSupplier(supplier._id)}
            >
              <CardHeader>
                {supplier.profileImage && (
                  <div className="w-full h-40 rounded-lg overflow-hidden mb-4">
                    <img
                      src={supplier.profileImage.url}
                      alt={supplier.profileImage.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardTitle className="text-lg">{supplier.user.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {/* <Badge>{supplier.category.label}</Badge> */}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">אזור:</span>
                    {supplier.regions && supplier.regions.length > 0 && (
                      <>
                        <span>{supplier.regions.join(", ")}</span>
                      </>
                    )}
                  </div>
                  {/* {supplier.description && (
                    <p className="text-muted-foreground line-clamp-2">
                      {supplier.description}
                    </p>
                  )} */}
                </div>

                <Button
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSendReguest(true);
                  }}
                >
                  <Send className="ml-2 h-4 w-4" />
                  שלח בקשה
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

  {selectedSupplier && (
    sendReguest ? (
      <SendRequestDialog
        supplier={selectedSupplier}
        open={sendReguest}
        events={[]}
        onOpenChange={(open) => !open && setSendReguest(false)}
        onSubmit={handleSendRequest}
        isLoading={isSending}
      />
    ) : (
      
      <SupplierDetailsDialog
        supplier={selectedSupplier}
        open={viewingSupplier}
        onOpenChange={(open) => !open && setViewingSupplier(false)}
        onSendRequest={() => {
          setViewingSupplier(false)
          setSendReguest(true)
        }}
      />
    )
  )}
</div>

  );
}
