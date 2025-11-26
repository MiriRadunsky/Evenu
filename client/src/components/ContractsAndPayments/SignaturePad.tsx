import { useRef, forwardRef, useImperativeHandle } from "react";
import { Button } from "../ui/button";
import { RotateCcw } from "lucide-react";

interface SignaturePadRef {
  getSignatureDataUrl: () => string | null;
  clear: () => void;
}

interface SignaturePadProps {
  onSignatureChange?: (dataUrl: string | null) => void;
}

const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSignatureChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawingRef = useRef(false);

    useImperativeHandle(ref, () => ({
      getSignatureDataUrl: () => {
        if (!canvasRef.current) return null;
        return canvasRef.current.toDataURL("image/png");
      },
      clear: () => {
        if (!canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          onSignatureChange?.(null);
        }
      },
    }));

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
      isDrawingRef.current = true;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawingRef.current) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();
    };

    const handleMouseUp = () => {
      isDrawingRef.current = false;
      if (canvasRef.current && onSignatureChange) {
        onSignatureChange(canvasRef.current.toDataURL("image/png"));
      }
    };

    const handleMouseLeave = () => {
      isDrawingRef.current = false;
    };

    const handleClear = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          onSignatureChange?.(null);
        }
      }
    };

    return (
      <div className="space-y-3">
        <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
          <canvas
            ref={canvasRef}
            width={400}
            height={200}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="w-full cursor-crosshair bg-white"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 ml-2" />
          נקה חתימה
        </Button>
      </div>
    );
  }
);

SignaturePad.displayName = "SignaturePad";

export default SignaturePad;
