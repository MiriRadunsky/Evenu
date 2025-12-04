import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { confirmPaymentPaid, rejectPayment } from "../../store/paymentsSlice";
import { uploadFileToS3 } from "../../services/uploadFile";

interface SupplierActionsProps {
  paymentId: string;
  defaultAmount?: number;
  onSuccess?: () => void;
}

export function SupplierPaymentActions({
  paymentId,
  defaultAmount,
  onSuccess,
}: SupplierActionsProps) {
  return (
    <div className="flex flex-col gap-1">
      <SupplierConfirmDialog
        paymentId={paymentId}
        defaultAmount={defaultAmount}
        onSuccess={onSuccess}
      />
      <SupplierRejectDialog paymentId={paymentId} onSuccess={onSuccess} />
    </div>
  );
}

// ----- אישור תשלום -----
interface SupplierConfirmProps {
  paymentId: string;
  defaultAmount?: number;
  onSuccess?: () => void;
}

function SupplierConfirmDialog({
  paymentId,
  defaultAmount,
  onSuccess,
}: SupplierConfirmProps) {
  const dispatch: AppDispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("מזומן");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      let documentKey: string | undefined;

      if (file) {
        documentKey = await uploadFileToS3(file);
      }

      await dispatch(
        confirmPaymentPaid({
          paymentId,
          method,
          note,
          documentKey,
        })
      ).unwrap();

      toast.success("התשלום אושר כסופי");
      setOpen(false);
      setNote("");
      setFile(null);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        typeof err === "string" ? err : "שגיאה באישור התשלום / העלאת קבלה"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          אשר תשלום
        </Button>
      </DialogTrigger>
      <DialogContent style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>אישור תשלום</DialogTitle>
        </DialogHeader>

        {defaultAmount !== undefined && (
          <div className="space-y-1">
            <Label>סכום</Label>
            <Input value={defaultAmount} disabled />
          </div>
        )}

        <div className="space-y-1">
          <Label>אופן התשלום</Label>
          <select
            className="border rounded-md px-3 py-2 text-sm w-full bg-background"
            value={method}
            onChange={(e) => setMethod(e.target.value)}
          >
            <option value="מזומן">מזומן</option>
            <option value="העברה בנקאית">העברה בנקאית</option>
            <option value="אשראי חיצוני">אשראי חיצוני</option>
            <option value="צק">צ׳ק</option>
            <option value="other">אחר</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label>הערה (לא חובה)</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="למשל: שולם בהעברה בנקאית, תואם עם הלקוח..."
          />
        </div>

        <div className="space-y-1">
          <Label>העלאת קבלה / מסמך לספרים (לא חובה)</Label>
          <Input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setFile(f);
            }}
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            ביטול
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? "מאשר..." : "אשר"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----- דחיית תשלום -----
interface SupplierRejectProps {
  paymentId: string;
  onSuccess?: () => void;
}

function SupplierRejectDialog({ paymentId, onSuccess }: SupplierRejectProps) {
  const dispatch: AppDispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      return toast.error("יש למלא סיבת דחייה");
    }

    try {
      setLoading(true);
      await dispatch(
        rejectPayment({
          paymentId,
          reason,
        })
      ).unwrap();

      toast.success("התשלום נדחה והלקוח עודכן");
      setOpen(false);
      setReason("");
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        typeof err === "string" ? err : "שגיאה בדחיית התשלום"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          דחה תשלום
        </Button>
      </DialogTrigger>
      <DialogContent style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>דחיית תשלום</DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <Label>סיבת דחייה</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="למשל: לא התקבלה העברה / אין התאמה לסכום..."
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            ביטול
          </Button>
          <Button onClick={handleReject} disabled={loading} variant="destructive">
            {loading ? "שולח..." : "דחה תשלום"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
