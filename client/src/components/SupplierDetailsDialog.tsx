import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import type { Supplier } from "../types/Supplier";

interface SupplierDetailsDialogProps {
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendRequest: () => void;
}

export const SupplierDetailsDialog = ({
  supplier,
  open,
  onOpenChange,
  onSendRequest,
}: SupplierDetailsDialogProps) => {
  console.log(supplier);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>{supplier.user.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {supplier.profileImage && (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={supplier.profileImage.url}
                alt={supplier.profileImage.alt || ""}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* <Badge>{supplier.category.label}</Badge> */}
          </div>

          <Card>
            <CardContent className="pt-6 space-y-3">
              {supplier.regions && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.regions.join(", ")}</span>
                </div>
              )}
              {supplier.user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.user.phone}</span>
                </div>
              )}
              {supplier.user.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.user.email}</span>
                </div>
              )}
              {/* {supplier. && (
                <div className="text-sm">
                  <span className="text-muted-foreground">איש קשר: </span>
                  <span>{supplier.contactName}</span>
                </div>
              )} */}
            </CardContent>
          </Card>

          {supplier.description && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">תיאור</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {supplier.description}
                </p>
              </CardContent>
            </Card>
          )}

          <Button onClick={onSendRequest} className="w-full">
            <Send className="ml-2 h-4 w-4" />
            שלח בקשה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};