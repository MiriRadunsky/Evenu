import {
  useState,
  useEffect,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
  useMemo,
} from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import {
  SetSelectedSupplierRequest,
  clearSelectedSupplierRequest,
} from "../../store/requestSlice";
import { createContract } from "../../store/contractsSlice";
import { uploadFileToS3 } from "../../services/uploadFile";
import PaymentsContract from "./PaymentsContract";
import type { Request } from "@/types/Request";

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
}

export const CreateContractDialog = ({
  open,
  onOpenChange,
}: CreateContractDialogProps) => {
  const dispatch: AppDispatch = useDispatch();

  const requests = useSelector(
    (state: RootState) => state.requests.data?.items
  );
  const selectedRequestFromStore = useSelector(
    (state: RootState) => state.requests.selectedSupplierRequest
  );

  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [specialTerms, setSpecialTerms] = useState("");
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [payments, setPayments] = useState<
    { amount: string; dueDate: string; note: string }[]
  >([]);
  const approvedRequests = useMemo(() => {
    return requests?.filter((r) => r.status === "מאושר") ?? [];
  }, [requests]);

  // נאתר את הבקשה לפי ה-ID שבקומפוננטה
  const selectedRequest =
    approvedRequests.find((r:Request) => r._id === selectedRequestId) ||
    selectedRequestFromStore ||
    null;

  // סכום כולל מחושב מהתשלומים
  const totalAmount = payments.reduce((sum, p) => {
    const num = Number(p.amount);
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // סינכרון בחירה אוטומטית כשנפתח הדיאלוג
  useEffect(() => {
    if (!open) return;
    if (!approvedRequests.length) {
      setSelectedRequestId("");
      return;
    }

    // אם כבר יש בחירה בגלובל – לסנכרן
    if (selectedRequestFromStore?._id) {
      setSelectedRequestId(selectedRequestFromStore._id);
      return;
    }

    // אחרת – לבחור את הראשונה
    const firstId = approvedRequests[0]._id;
    setSelectedRequestId(firstId);
    dispatch(SetSelectedSupplierRequest({ id: firstId }));
  }, [open, approvedRequests, selectedRequestFromStore?._id, dispatch]);

  const resetForm = () => {
    setSelectedRequestId("");
    setServiceDescription("");
    setSpecialTerms("");
    setContractFile(null);
    setPayments([]);
    dispatch(clearSelectedSupplierRequest());
  };

  const handleSelectChange = (id: string) => {
    setSelectedRequestId(id);
    dispatch(SetSelectedSupplierRequest({ id }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedRequest) {
      toast.error("נא לבחור בקשה מאושרת");
      return;
    }

    if (!serviceDescription.trim()) {
      toast.error("נא למלא תיאור שירות");
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // תחילת היום

    for (let i = 0; i < payments.length; i++) {
      const p = payments[i];
      const label = `תשלום ${i + 1}`;

      // סכום > 0
      const amountNum = Number(p.amount);
      if (!p.amount || isNaN(amountNum)) {
        toast.error(`${label}: סכום אינו תקין`);
        return;
      }
      if (amountNum <= 0) {
        toast.error(`${label}: סכום חייב להיות גדול מ-0`);
        return;
      }

      // תאריך קיים ותקין
      if (!p.dueDate) {
        toast.error(`${label}: יש לבחור תאריך לתשלום`);
        return;
      }
      const due = new Date(p.dueDate);
      if (isNaN(due.getTime())) {
        toast.error(`${label}: תאריך התשלום אינו תקין`);
        return;
      }
      if (due < today) {
        toast.error(`${label}: לא ניתן לבחור תאריך תשלום בעבר`);
        return;
      }

      // note עד 1000 תווים
      if (p.note && p.note.length > 1000) {
        toast.error(`${label}: ההערה ארוכה מדי (מעל 1000 תווים)`);
        return;
      }
    }
    if (!payments.length || totalAmount <= 0) {
      toast.error("נא להוסיף לפחות תשלום אחד עם סכום חיובי");
      return;
    }

    try {
      setIsUploading(true);
      let s3Key = "";

      if (contractFile) {
        s3Key = await uploadFileToS3(contractFile);
      }

      setIsCreating(true);

      await dispatch(
        createContract({
          eventId: selectedRequest.eventId._id,
          clientId: selectedRequest.clientId?._id,
          s3Key,
          terms: specialTerms || serviceDescription,
          paymentPlan: payments.map((p) => ({
            amount: Number(p.amount),
            dueDate: p.dueDate,
            note: p.note,
          })),
        })
      ).unwrap();

      toast.success("החוזה נוצר בהצלחה");
      resetForm();
      onOpenChange(false);
    } catch (err:string | unknown) {
     const errorText = String(err);
      toast.error(errorText);
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  const isBusy = isCreating || isUploading;

  return (
    <Dialog
      open={open}
      onOpenChange={(openState) => {
        if (!openState) {
          resetForm();
        }
        onOpenChange(openState);
      }}
    >
      <DialogContent
        className="max-w-3xl max-h-[80vh] overflow-y-auto"
        style={{ direction: "rtl" }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            יצירת חוזה חדש
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* בחירת בקשה + כרטיס סיכום */}
          <div className="grid gap-4 md:grid-cols-[1.4fr,1.6fr]">
            <div className="space-y-2">
              <Label htmlFor="request">בחר בקשה מאושרת</Label>
              <Select
                value={selectedRequestId}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר בקשה" />
                </SelectTrigger>
                <SelectContent>
                  {approvedRequests.length ? (
                    approvedRequests.map((request) => (
                      <SelectItem key={request._id} value={request._id}>
                        {request.eventId.name} ·{" "}
                        {request.clientId?.name ?? "ללא שם לקוח"}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      אין בקשות מאושרות ליצירת חוזה
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* כרטיס מידע על הבקשה הנבחרת */}
            {selectedRequest && (
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">
                    {selectedRequest.eventId.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {selectedRequest.eventId.date
                      ? new Date(
                          selectedRequest.eventId.date
                        ).toLocaleDateString("he-IL")
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>לקוחה: {selectedRequest.clientId?.name}</span>
                  <span>סטטוס בקשה: {selectedRequest.status}</span>
                </div>
                {totalAmount > 0 && (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span>סה״כ תשלומים בחוזה:</span>
                    <span className="font-bold">
                      {totalAmount.toLocaleString()} ₪
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* תיאור שירותים */}
          <div className="space-y-2">
            <Label htmlFor="description">תיאור השירותים</Label>
            <Textarea
              id="description"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              rows={3}
              required
              placeholder="תאר/י את השירותים במסגרת החוזה"
            />
          </div>

          {/* תשלומים */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>תשלומים</Label>
              {totalAmount > 0 && (
                <span className="text-xs text-muted-foreground">
                  סך הכול:{" "}
                  <span className="font-semibold">
                    {totalAmount.toLocaleString()} ₪
                  </span>
                </span>
              )}
            </div>
            <PaymentsContract payments={payments} setPayments={setPayments} />
          </div>

          {/* תנאים מיוחדים */}
          <div className="space-y-2">
            <Label htmlFor="terms">תנאים מיוחדים (אופציונלי)</Label>
            <Textarea
              id="terms"
              value={specialTerms}
              onChange={(e) => setSpecialTerms(e.target.value)}
              rows={2}
              placeholder="תנאים נוספים במידת הצורך"
            />
          </div>

          {/* העלאת קובץ */}
          <div className="space-y-2">
            <Label htmlFor="file">העלאת קובץ חוזה (PDF / DOC)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setContractFile(e.target.files?.[0] || null)}
              />
              {contractFile && (
                <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                  {contractFile.name}
                </span>
              )}
            </div>
          </div>

          {/* כפתורים */}
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isBusy}
            >
              ביטול
            </Button>
            <Button type="submit" disabled={isBusy || !selectedRequestId}>
              {isBusy ? "שומר..." : "יצירת חוזה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
