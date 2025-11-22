import React, { useState, useEffect } from "react";
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
import { SetSelectedSupplierRequest, clearSelectedSupplierRequest } from "../../store/requestSlice";
import { createContract } from "../../store/contractsSlice";
import { uploadFileToS3 } from "../../services/uploadFile";

interface CreateContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateContractDialog = ({
  open,
  onOpenChange,
}: CreateContractDialogProps) => {
  const dispatch: AppDispatch = useDispatch();
  const requests = useSelector((state: RootState) => state.requests.requests);
  const selectedRequest = useSelector((state: RootState) => state.requests.selectedSupplierRequest);

  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [specialTerms, setSpecialTerms] = useState("");
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const approvedRequests = requests.filter((r) => r.status === "מאושר");

  // בחירה אוטומטית של בקשה ראשונה אם אין בחירה קיימת
  useEffect(() => {
    if (open && approvedRequests.length) {
      if (!selectedRequest) {
        const firstRequest = approvedRequests[0];
        setSelectedRequestId(firstRequest._id);
        dispatch(SetSelectedSupplierRequest({ id: firstRequest._id }));
      } else {
        setSelectedRequestId(selectedRequest._id);
      }
    }
  }, [open, approvedRequests, selectedRequest, dispatch]);

  const handleSelectChange = (id: string) => {
    setSelectedRequestId(id);
    dispatch(SetSelectedSupplierRequest({ id }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // if (!selectedRequest || !totalAmount) {
    if (!selectedRequest) {
      console.log(selectedRequest,"selectedRequest", totalAmount, "error");
      
      toast.error("נא למלא את כל השדות הנדרשים");
      return;
    }

    try {
      setIsUploading(true);
      let s3Key = "";
      if (contractFile) {
        s3Key = await uploadFileToS3(contractFile);
      }

      setIsCreating(true);
      await dispatch(createContract({
        eventId: selectedRequest.eventId._id,
        clientId: selectedRequest.clientId?._id,
        s3Key,
        paymentPlan: [],
        totalAmount: parseFloat(totalAmount),
        terms: specialTerms || serviceDescription,
      })).unwrap();

      alert("החוזה נוצר בהצלחה");
      // toast.success("החוזה נוצר בהצלחה");
      onOpenChange(false);
      setSelectedRequestId("");
      dispatch(clearSelectedSupplierRequest());
      setTotalAmount("");
      setServiceDescription("");
      setSpecialTerms("");
      setContractFile(null);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "שגיאה ביצירת החוזה");
    } finally {
      setIsCreating(false);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>יצירת חוזה חדש</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="request">בחר בקשה מאושרת</Label>
            <Select value={selectedRequestId} onValueChange={handleSelectChange}>
              <SelectTrigger>
                <SelectValue placeholder="בחר בקשה" />
              </SelectTrigger>
              <SelectContent>
                {approvedRequests.map((request) => (
                  <SelectItem key={request._id} value={request._id}>
                    {request.eventId.name} - {request.clientId?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          

          <div className="space-y-2">
            <Label htmlFor="description">תיאור השירותים</Label>
            <Textarea
              id="description"
              value={serviceDescription}
              onChange={(e) => setServiceDescription(e.target.value)}
              rows={3}
              required
              placeholder="תאר את השירותים שתספק"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms">תנאים מיוחדים (אופציונלי)</Label>
            <Textarea
              id="terms"
              value={specialTerms}
              onChange={(e) => setSpecialTerms(e.target.value)}
              rows={2}
              placeholder="תנאים נוספים אם יש"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">העלאת קובץ חוזה (PDF)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="file"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setContractFile(e.target.files?.[0] || null)}
              />
              {contractFile && <span className="text-sm text-muted-foreground">{contractFile.name}</span>}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ביטול</Button>
            <Button type="submit" disabled={isCreating || isUploading || !selectedRequestId}>
              {isCreating || isUploading ? "יוצר..." : "צור חוזה"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
