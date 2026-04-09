import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ImageIcon, RefreshCcw, Shrink, Crop, RotateCw, Droplet, Download, Type, Image } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

const imageTools: ToolItem[] = [
  { name: "Format Converter", href: "/image-tools/convert", icon: RefreshCcw },
  { name: "Image Compressor", href: "/image-tools/compress", icon: Shrink },
  { name: "Image Resizer", href: "/image-tools/resize", icon: Crop },
  { name: "Rotate & Flip", href: "/image-tools/rotate", icon: RotateCw },
  { name: "Add Watermark", href: "/image-tools/watermark", icon: Droplet },
];

const positions = [
  { value: "top-left", label: "Top Left" },
  { value: "top-right", label: "Top Right" },
  { value: "center", label: "Center" },
  { value: "bottom-left", label: "Bottom Left" },
  { value: "bottom-right", label: "Bottom Right" },
];

type NaturalSize = { w: number; h: number };

function measureTextWatermarkSize(text: string, nw: number, nh: number): NaturalSize {
  const fontSize = Math.max(24, Math.floor(Math.min(nw, nh) / 20));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { w: 80, h: 40 };
  ctx.font = `${fontSize}px ui-sans-serif, system-ui, sans-serif`;
  const textW = ctx.measureText(text).width;
  const textH = fontSize * 1.25;
  const padding = 20;
  return { w: textW + padding * 2, h: textH + padding * 2 };
}

function thumbnailNaturalSize(iw: number, ih: number, nw: number, nh: number): NaturalSize {
  const maxW = nw * 0.2;
  const maxH = nh * 0.2;
  const scale = Math.min(maxW / iw, maxH / ih, 1);
  return { w: iw * scale, h: ih * scale };
}

function watermarkPasteRect(
  nw: number,
  nh: number,
  wmW: number,
  wmH: number,
  position: string,
  margin = 20
): { x: number; y: number } {
  if (position === "top-left") return { x: margin, y: margin };
  if (position === "top-right") return { x: nw - wmW - margin, y: margin };
  if (position === "center") return { x: (nw - wmW) / 2, y: (nh - wmH) / 2 };
  if (position === "bottom-left") return { x: margin, y: nh - wmH - margin };
  return { x: nw - wmW - margin, y: nh - wmH - margin };
}

export default function AddWatermark() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [baseNatural, setBaseNatural] = useState<NaturalSize | null>(null);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [watermarkText, setWatermarkText] = useState("© Your Name");
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(50);
  const [watermarkImageFile, setWatermarkImageFile] = useState<File | null>(null);
  const [wmImageNatural, setWmImageNatural] = useState<NaturalSize | null>(null);
  const [wmImageObjectUrl, setWmImageObjectUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previewWrapRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    if (!watermarkImageFile) {
      setWmImageNatural(null);
      setWmImageObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(watermarkImageFile);
    setWmImageObjectUrl(url);
    const img = new window.Image();
    img.onload = () => {
      setWmImageNatural({ w: img.naturalWidth, h: img.naturalHeight });
    };
    img.src = url;
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [watermarkImageFile]);

  useEffect(() => {
    const el = previewWrapRef.current;
    if (!el || !baseNatural) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      if (w > 0 && baseNatural.w > 0) setPreviewScale(w / baseNatural.w);
    });
    ro.observe(el);
    const w = el.clientWidth;
    if (w > 0) setPreviewScale(w / baseNatural.w);
    return () => ro.disconnect();
  }, [baseNatural, preview]);

  const overlayStyle = useMemo(() => {
    if (!baseNatural) return null;
    const { w: nw, h: nh } = baseNatural;
    let wmW: number;
    let wmH: number;
    if (watermarkType === "text" && watermarkText.trim()) {
      const s = measureTextWatermarkSize(watermarkText, nw, nh);
      wmW = s.w;
      wmH = s.h;
    } else if (watermarkType === "image" && wmImageNatural) {
      const s = thumbnailNaturalSize(wmImageNatural.w, wmImageNatural.h, nw, nh);
      wmW = s.w;
      wmH = s.h;
    } else {
      return null;
    }
    const { x, y } = watermarkPasteRect(nw, nh, wmW, wmH, position);
    return {
      left: `${(x / nw) * 100}%`,
      top: `${(y / nh) * 100}%`,
      width: `${(wmW / nw) * 100}%`,
      height: `${(wmH / nh) * 100}%`,
    };
  }, [baseNatural, watermarkType, watermarkText, wmImageNatural, position]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setBaseNatural(null);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFiles[0]);
    } else {
      setPreview(null);
    }
  }, []);

  const handleApply = async () => {
    if (files.length === 0 || !files[0]) return;
    if (watermarkType === "text" && !watermarkText.trim()) return;
    if (watermarkType === "image" && !watermarkImageFile) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("image", files[0]);
      formData.append("watermark_type", watermarkType);
      formData.append("position", position);
      formData.append("opacity", opacity.toString());
      
      if (watermarkType === "text") {
        formData.append("watermark_text", watermarkText);
      } else {
        formData.append("watermark_image", watermarkImageFile!);
      }
      
      const response = await fetch(`${API_BASE_URL}/image/watermark`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Watermark failed with status ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to add watermark. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout title="Image Tools" description="Image processing" tools={imageTools} categoryIcon={ImageIcon}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Add Watermark</h1>
          <p className="text-muted-foreground">Protect your images with a custom watermark</p>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-muted-foreground">Preview</span>
                <p className="text-xs text-muted-foreground">
                  Matches server placement (same margins, 20% max image watermark, text size ~min(side)/20).
                </p>
                <div
                  ref={previewWrapRef}
                  className="relative w-full max-h-[min(70vh,560px)] rounded-2xl overflow-hidden bg-secondary border border-border flex justify-center items-start"
                  style={
                    baseNatural
                      ? { aspectRatio: `${baseNatural.w} / ${baseNatural.h}` }
                      : { minHeight: "200px" }
                  }
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                    onLoad={(e) => {
                      const el = e.currentTarget;
                      setBaseNatural({ w: el.naturalWidth, h: el.naturalHeight });
                    }}
                  />
                  {overlayStyle && watermarkType === "text" && watermarkText.trim() && baseNatural && (
                    <div
                      className="absolute pointer-events-none flex items-center justify-center overflow-hidden"
                      style={{ ...overlayStyle, opacity: opacity / 100 }}
                    >
                      <span
                        className="text-white font-medium text-center px-2"
                        style={{
                          fontSize: `${Math.max(24, Math.floor(Math.min(baseNatural.w, baseNatural.h) / 20)) * previewScale}px`,
                        }}
                      >
                        {watermarkText}
                      </span>
                    </div>
                  )}
                  {overlayStyle && watermarkType === "image" && wmImageObjectUrl && wmImageNatural && (
                    <div
                      className="absolute pointer-events-none flex items-center justify-center"
                      style={{ ...overlayStyle, opacity: opacity / 100 }}
                    >
                      <img
                        src={wmImageObjectUrl}
                        alt=""
                        className="max-w-full max-h-full w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Type selection */}
                <div className="space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Watermark Type</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setWatermarkType("text")}
                      className={cn(
                        "p-4 rounded-xl border flex items-center gap-3 transition-all",
                        watermarkType === "text" ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <Type className="h-5 w-5" />
                      <span className="font-medium">Text</span>
                    </button>
                    <button
                      onClick={() => setWatermarkType("image")}
                      className={cn(
                        "p-4 rounded-xl border flex items-center gap-3 transition-all",
                        watermarkType === "image" ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                      )}
                    >
                      <Image className="h-5 w-5" />
                      <span className="font-medium">Image</span>
                    </button>
                  </div>
                </div>

                {/* Text input */}
                {watermarkType === "text" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="Enter watermark text"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
                    />
                  </div>
                )}
                
                {/* Image watermark upload */}
                {watermarkType === "image" && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Watermark Image</label>
                    <FileUpload
                      accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
                      maxFiles={1}
                      onFilesSelected={(selectedFiles) => {
                        if (selectedFiles.length > 0) {
                          setWatermarkImageFile(selectedFiles[0]);
                        }
                      }}
                      title="Upload watermark image"
                      description="PNG with transparency recommended"
                    />
                  </div>
                )}

                {/* Position */}
                <div className="space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Position</span>
                  <div className="grid grid-cols-3 gap-2">
                    {positions.map((pos) => (
                      <button
                        key={pos.value}
                        onClick={() => setPosition(pos.value)}
                        className={cn(
                          "p-2 rounded-lg border text-xs transition-all",
                          position === pos.value ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                        )}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Opacity */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Opacity</span>
                    <span className="text-sm font-medium">{opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={opacity}
                    onChange={(e) => setOpacity(Number(e.target.value))}
                    className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-foreground"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleApply}
                    disabled={isProcessing}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                      "bg-foreground text-background hover:opacity-90",
                      "disabled:opacity-50"
                    )}
                  >
                    {isProcessing ? "Applying..." : (
                      <>
                        <Droplet className="h-4 w-4" />
                        Add Watermark
                      </>
                    )}
                  </button>
                </div>
                {isComplete && downloadUrl && (
                  <a
                    href={downloadUrl}
                    download="watermarked.png"
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                )}
                {error && (
                  <p className="text-sm text-destructive text-center mt-2">{error}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
