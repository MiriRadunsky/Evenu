import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Send, Phone, Mail, MapPin } from "lucide-react";
import type { Supplier } from "../../types/Supplier";
import { useEffect, useState } from "react";
import { getImageUrl } from "../../services/uploadFile";

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
  const [priceFileUrls, setPriceFileUrls] = useState<Array<{key: string; url: string; originalName?: string}>>([]);

  useEffect(() => {
    // Clear state when dialog closes
    if (!open) {
      setProfileUrl(undefined);
      setMediaUrls([]);
      setPriceFileUrls([]);
      return;
    }

    // Create abort controller to cancel requests if component unmounts or dialog closes
    const abortController = new AbortController();
    let isMounted = true;

    // Load images when dialog opens
    const loadImages = async () => {
      try {
        if (supplier.profileImage?.key) {
          const url = await getImageUrl(supplier.profileImage.key);
          if (isMounted && !abortController.signal.aborted) {
            setProfileUrl(url);
          }
        }

        if (supplier.media?.images?.length > 0) {
          const urls = await Promise.all(
            supplier.media.images.map(async (img) => {
              if (img.key) {
                const key = await getImageUrl(img.key);
                return { key, alt: img.title };
              }
              return { key: '', alt: img.title };
            })
          );
          if (isMounted && !abortController.signal.aborted) {
            setMediaUrls(urls);
          }
        }

        if (supplier.priceFiles && supplier.priceFiles.length > 0) {
          const urls = await Promise.all(
            supplier.priceFiles.map(async (file) => {
              const url = await getImageUrl(file.key);
              return { key: file.key, url, originalName: file.originalName };
            })
          );
          if (isMounted && !abortController.signal.aborted) {
            setPriceFileUrls(urls);
          }
        } else {
          if (isMounted && !abortController.signal.aborted) {
            setPriceFileUrls([]);
          }
        }
      } catch (e) {
        if (!abortController.signal.aborted) {
          console.error('Failed to load images or price files', e);
        }
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [supplier, open]);

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
                  <span>{supplier.regions}</span>
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

              {/* מחיר בסיסי */}
              {typeof supplier.baseBudget !== 'undefined' && (
                <div className="text-sm">
                  <strong>מחיר בסיסי: </strong>₪{supplier.baseBudget}
                </div>
              )}

              {/* קישורים לקבצי מחירון אם קיימים */}
              {priceFileUrls.length > 0 && (
                <div className="mt-2 space-y-1">
                  <strong>קבצי מחירון:</strong>
                  {priceFileUrls.map((file, idx) => (
                    <div key={file.key}>
                      <a href={file.url} target="_blank" rel="noreferrer" className="text-primary underline text-sm">
                        {file.originalName || `מחירון ${idx + 1}`}
                      </a>
                    </div>
                  ))}
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
