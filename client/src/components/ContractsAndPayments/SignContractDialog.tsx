import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import SignaturePad from "./SignaturePad";

interface SignContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSign: (signatureData: string) => void;
  isLoading?: boolean;
  contractName?: string;
}
interface SignaturePadRef {
  getSignatureDataUrl: () => string | null;
  clear: () => void;
}

export function SignContractDialog({
  open,
  onOpenChange,
  onSign,
  isLoading = false,
  contractName = "החוזה",
}: SignContractDialogProps) {
  const signaturePadRef = useRef<SignaturePadRef| null>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const handleSignatureChange = (dataUrl: string | null) => {
    setHasSignature(!!dataUrl);
  };

  const handleSign = () => {
    const signatureData = signaturePadRef.current?.getSignatureDataUrl();
    if (signatureData) {
      onSign(signatureData);
      setHasSignature(false);
      signaturePadRef.current?.clear();
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setHasSignature(false);
    signaturePadRef.current?.clear();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>חתום על {contractName}</DialogTitle>
          <DialogDescription>
            אנא חתום בשדה למטה. משכו את העכבר כדי לצייר את החתימה שלכם.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <SignaturePad
            ref={signaturePadRef}
            onSignatureChange={handleSignatureChange}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button
            onClick={handleSign}
            disabled={!hasSignature || isLoading}
          >
            {isLoading ? "שולח..." : "חתום"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
