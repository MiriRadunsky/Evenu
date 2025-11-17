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
import { useEffect, useState } from "react";
import { getImageUrl } from "../services/uploadFile";

interface SupplierDetailsDialogProps {
  supplier: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendRequest: () => void;
  isSending: boolean;
}

export const SupplierDetailsDialog = ({
  supplier,
  open,
  onOpenChange,
  onSendRequest,
  isSending,
}: SupplierDetailsDialogProps) => {
  const [profileUrl, setProfileUrl] = useState<string | undefined>();
  const [mediaUrls, setMediaUrls] = useState<{key: string; alt?: string}[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      if (supplier.profileImage?.key) {
        const url = await getImageUrl(supplier.profileImage.key);
        setProfileUrl(url);
      }

      if (supplier.media?.images?.length > 0) {
        const urls = await Promise.all(
          supplier.media.images.map(async (img) => {
            if (img.key) {
              const key = await getImageUrl(img.key);
              return { key, alt: img.alt };
            }
            return { key: '', alt: img.alt };
          })
        );
        setMediaUrls(urls);
      }
    };

    loadImages();
  }, [supplier]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl" style={{ direction: "rtl" }}>
        <DialogHeader>
          <DialogTitle>{supplier.user.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* תמונת פרופיל */}
          {profileUrl ? (
            <div className="w-full h-64 rounded-lg overflow-hidden">
              <img
                src={profileUrl}
                alt={supplier.profileImage?.alt || ""}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded flex items-center justify-center">
              אין תמונה
            </div>
          )}

          {/* קטגוריה */}
          {supplier.category && (
            <Badge className="text-sm">{supplier.category.label}</Badge>
          )}

          <Card>
            <CardContent className="space-y-2">
              {/* אזורים */}
              {supplier.regions && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.regions.join(", ")}</span>
                </div>
              )}

              {/* סטטוס */}
              {supplier.status && (
                <div className="text-sm">
                  <strong>סטטוס: </strong>{supplier.status}
                </div>
              )}

              {/* כשרות */}
              {supplier.kashrut && (
                <div className="text-sm">
                  <strong>כשרות: </strong>{supplier.kashrut}
                </div>
              )}

              {/* פרטי קשר */}
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

              {/* תיאור */}
              {supplier.description && (
                <div className="text-sm">
                  <strong>תיאור: </strong>{supplier.description}
                </div>
              )}

              {/* תאריך יצירה */}
              {supplier.createdAt && (
                <div className="text-sm text-muted-foreground">
                  <strong>נוצר בתאריך: </strong>{new Date(supplier.createdAt).toLocaleDateString()}
                </div>
              )}
            </CardContent>
          </Card>

          {/* גלריית מדיה */}
          {mediaUrls.length > 0 && (
            <Card>
              <CardContent className="space-y-2">
                <h3 className="font-medium mb-2">גלריית תמונות</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mediaUrls.map((img, idx) => (
                    <div key={idx} className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                      {img.key ? (
                        <img src={img.key} alt={img.alt} className="w-full h-full object-cover"/>
                      ) : (
                        <span className="text-xs text-center block mt-10">אין תמונה</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={onSendRequest} className="w-full">
            <Send className="ml-2 h-4 w-4" />
      {isSending ? "שולח..." : "  שלח בקשה"} 
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
