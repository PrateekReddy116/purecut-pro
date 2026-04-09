import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, ZoomIn, Eraser, Download, RotateCcw } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

const aiTools: ToolItem[] = [
  { name: "Background Remover", href: "/ai-tools/background-remover", icon: Wand2 },
  { name: "Image Enhancer", href: "/ai-tools/enhancer", icon: Sparkles },
  { name: "Object Remover", href: "/ai-tools/object-remover", icon: Eraser },
  { name: "Image Upscaler", href: "/ai-tools/upscaler", icon: ZoomIn },
];

function buildMaskPngFromBrushCanvas(
  brushCanvas: HTMLCanvasElement,
  naturalW: number,
  naturalH: number
): Promise<Blob> {
  const out = document.createElement("canvas");
  out.width = naturalW;
  out.height = naturalH;
  const octx = out.getContext("2d");
  if (!octx) return Promise.reject(new Error("No context"));
  octx.imageSmoothingEnabled = false;
  octx.drawImage(
    brushCanvas,
    0,
    0,
    brushCanvas.width,
    brushCanvas.height,
    0,
    0,
    naturalW,
    naturalH
  );
  const id = octx.getImageData(0, 0, naturalW, naturalH);
  const d = id.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
    const v = lum > 35 ? 255 : 0;
    d[i] = v;
    d[i + 1] = v;
    d[i + 2] = v;
    d[i + 3] = 255;
  }
  octx.putImageData(id, 0, 0);
  return new Promise((resolve, reject) => {
    out.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png");
  });
}

export default function ObjectRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [brushSize, setBrushSize] = useState(28);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);

  const clearMaskLayer = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  const syncCanvasToImage = useCallback(() => {
    const img = imgRef.current;
    const c = canvasRef.current;
    if (!img || !c) return;
    const w = Math.max(1, Math.floor(img.clientWidth));
    const h = Math.max(1, Math.floor(img.clientHeight));
    if (c.width === w && c.height === h) return;

    const prev = document.createElement("canvas");
    prev.width = c.width;
    prev.height = c.height;
    if (c.width > 0 && c.height > 0) {
      prev.getContext("2d")!.drawImage(c, 0, 0);
    }

    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);
    if (prev.width > 0 && prev.height > 0) {
      ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, w, h);
    }
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !preview) return;
    const ro = new ResizeObserver(() => {
      requestAnimationFrame(() => syncCanvasToImage());
    });
    ro.observe(img);
    return () => ro.disconnect();
  }, [preview, natural.w, natural.h, syncCanvasToImage]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setResultPreview(null);
    setError(null);
    setNatural({ w: 0, h: 0 });
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFiles[0]);
    } else {
      setPreview(null);
    }
  }, []);

  const clientToCanvas = (clientX: number, clientY: number) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const lineTo = (x: number, y: number) => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = 1;
    const last = lastPt.current;
    if (last) {
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
    }
    lastPt.current = { x, y };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    lastPt.current = null;
    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    lineTo(x, y);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    const { x, y } = clientToCanvas(e.clientX, e.clientY);
    lineTo(x, y);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    e.preventDefault();
    drawing.current = false;
    lastPt.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handleRemove = async () => {
    if (files.length === 0 || !files[0] || !canvasRef.current || natural.w < 1 || natural.h < 1) {
      setError("Upload an image and paint over what you want removed.");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const maskBlob = await buildMaskPngFromBrushCanvas(canvasRef.current, natural.w, natural.h);
      const formData = new FormData();
      formData.append("image", files[0]);
      formData.append("mask", maskBlob, "mask.png");

      const response = await fetch(`${API_BASE_URL}/object-remover`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setResultPreview(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to remove objects. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreview(null);
    setNatural({ w: 0, h: 0 });
    setIsComplete(false);
    setResultPreview(null);
    setError(null);
  };

  return (
    <ToolLayout title="AI Tools" description="AI-powered processing" tools={aiTools} categoryIcon={Sparkles}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Object Remover</h1>
          <p className="text-muted-foreground">Paint over areas to remove (white mask). Uses fast inpainting on the server.</p>
        </div>

        {!preview ? (
          <FileUpload
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            maxFiles={1}
            onFilesSelected={handleFilesSelected}
            title="Upload an image"
            description="PNG, JPG, or WebP"
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Brush size</label>
              <input
                type="range"
                min={8}
                max={80}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full max-w-xs h-1 bg-border rounded-full appearance-none cursor-pointer accent-foreground"
              />
            </div>

            <div className="relative w-full max-h-[min(72vh,620px)] rounded-2xl overflow-hidden bg-secondary border border-border flex justify-center">
              <div
                className="relative inline-block max-w-full max-h-[min(72vh,620px)]"
                style={natural.w && natural.h ? { aspectRatio: `${natural.w} / ${natural.h}` } : undefined}
              >
                <img
                  ref={imgRef}
                  src={preview}
                  alt="Source"
                  className="block w-full h-full max-h-[min(72vh,620px)] object-contain select-none"
                  draggable={false}
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    setNatural({ w: el.naturalWidth, h: el.naturalHeight });
                    requestAnimationFrame(() => syncCanvasToImage());
                  }}
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
                  style={{ opacity: 0.45 }}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerLeave={(e) => onPointerUp(e)}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: paint fully over the object. Larger areas may look soft with the current engine (OpenCV Telea).
            </p>

            {resultPreview && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-muted-foreground">Result</span>
                <div className="rounded-2xl overflow-hidden bg-secondary border border-border max-h-[min(72vh,620px)] flex justify-center">
                  <img src={resultPreview} alt="Result" className="max-w-full max-h-[min(72vh,620px)] object-contain" />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-border hover:bg-secondary transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </button>
              <button
                type="button"
                onClick={clearMaskLayer}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-border hover:bg-secondary transition-colors"
              >
                Clear strokes
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={isProcessing}
                className={cn(
                  "flex-1 min-w-[200px] flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Removing..." : (
                  <>
                    <Eraser className="h-4 w-4" />
                    Remove painted region
                  </>
                )}
              </button>
              {isComplete && resultPreview && (
                <a
                  href={resultPreview}
                  download="object-removed.jpg"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              )}
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
