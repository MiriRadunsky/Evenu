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
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import { reportPaymentPaid } from "../../store/paymentsSlice";
import { uploadFileToS3 } from "../../services/uploadFile";

interface Props {
  paymentId: string;
  defaultAmount?: number;
  onSuccess?: () => void;
}

export function ClientReportPaymentDialog({
  paymentId,
  defaultAmount,
  onSuccess,
}: Props) {
  const dispatch: AppDispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState("מזומן");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      let documentKey: string | undefined;
      if (file) {
        documentKey = await uploadFileToS3(file);
      }

      await dispatch(
        reportPaymentPaid({
          paymentId,
          method,
          note,
          documentKey,
        })
      ).unwrap();

      toast.success("הדיווח נשלח לספק" + (documentKey ? " והקבלה נשמרה" : ""));
      setOpen(false);
      setNote("");
      setFile(null);
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      toast.error(
        typeof err === "string"
          ? err
          : "שגיאה בדיווח על תשלום / העלאת קבלה"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          דיווח תשלום
        </Button>
      </DialogTrigger>
      <DialogContent style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>דיווח תשלום לספק</DialogTitle>
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
            placeholder="למשל: שולם בביט, שולם במזומן באירוע..."
          />
        </div>

        <div className="space-y-1">
          <Label>העלאת קבלה / אסמכתא (לא חובה)</Label>
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
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "שולח..." : "שלח לספק"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
