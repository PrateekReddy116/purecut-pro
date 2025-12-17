import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ImageIcon, RefreshCcw, Shrink, Crop, RotateCw, Droplet, Download, Type, Image } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

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

export default function AddWatermark() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<"text" | "image">("text");
  const [watermarkText, setWatermarkText] = useState("© Your Name");
  const [position, setPosition] = useState("bottom-right");
  const [opacity, setOpacity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFiles[0]);
    }
  }, []);

  const handleApply = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-left": return "top-4 left-4";
      case "top-right": return "top-4 right-4";
      case "center": return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
      case "bottom-left": return "bottom-4 left-4";
      case "bottom-right": return "bottom-4 right-4";
      default: return "bottom-4 right-4";
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
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                  {watermarkType === "text" && watermarkText && (
                    <div
                      className={cn("absolute text-foreground font-medium pointer-events-none", getPositionClasses())}
                      style={{ opacity: opacity / 100 }}
                    >
                      {watermarkText}
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
                {isComplete && (
                  <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors">
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
