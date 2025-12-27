import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ImageIcon, RefreshCcw, Shrink, Crop, RotateCw, Droplet, Download, Link2, Link2Off } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const API_BASE_URL = "http://127.0.0.1:8000";

const imageTools: ToolItem[] = [
  { name: "Format Converter", href: "/image-tools/convert", icon: RefreshCcw },
  { name: "Image Compressor", href: "/image-tools/compress", icon: Shrink },
  { name: "Image Resizer", href: "/image-tools/resize", icon: Crop },
  { name: "Rotate & Flip", href: "/image-tools/rotate", icon: RotateCw },
  { name: "Add Watermark", href: "/image-tools/watermark", icon: Droplet },
];

const presets = [
  { label: "Instagram Post", width: 1080, height: 1080 },
  { label: "Instagram Story", width: 1080, height: 1920 },
  { label: "Twitter Header", width: 1500, height: 500 },
  { label: "YouTube Thumbnail", width: 1280, height: 720 },
];

export default function ImageResize() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
          setWidth(img.width);
          setHeight(img.height);
        };
        img.src = result;
      };
      reader.readAsDataURL(selectedFiles[0]);
    }
  }, []);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockAspectRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockAspectRatio && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const applyPreset = (preset: typeof presets[0]) => {
    setWidth(preset.width);
    setHeight(preset.height);
    setLockAspectRatio(false);
  };

  const handleResize = async () => {
    if (files.length === 0 || !files[0] || width <= 0 || height <= 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("image", files[0]);
      formData.append("width", width.toString());
      formData.append("height", height.toString());
      formData.append("maintain_aspect", lockAspectRatio.toString());
      
      const response = await fetch(`${API_BASE_URL}/image/resize`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Resize failed with status ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to resize image. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout title="Image Tools" description="Image processing" tools={imageTools} categoryIcon={ImageIcon}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Image Resizer</h1>
          <p className="text-muted-foreground">Resize images to exact dimensions</p>
        </div>

        {!preview ? (
          <FileUpload
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            maxFiles={1}
            onFilesSelected={handleFilesSelected}
            title="Upload an image to resize"
            description="PNG, JPG, or WebP"
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-muted-foreground">Preview</span>
                <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
                  <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Original: {originalDimensions.width} × {originalDimensions.height}
                </p>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Dimensions */}
                <div className="space-y-4">
                  <span className="text-sm font-medium text-muted-foreground">New Dimensions</span>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-muted-foreground">Width (px)</label>
                      <input
                        type="number"
                        value={width}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                    <button
                      onClick={() => setLockAspectRatio(!lockAspectRatio)}
                      className={cn(
                        "p-2 rounded-lg border transition-colors mt-6",
                        lockAspectRatio ? "border-foreground bg-secondary" : "border-border"
                      )}
                    >
                      {lockAspectRatio ? <Link2 className="h-4 w-4" /> : <Link2Off className="h-4 w-4" />}
                    </button>
                    <div className="flex-1 space-y-2">
                      <label className="text-xs text-muted-foreground">Height (px)</label>
                      <input
                        type="number"
                        value={height}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Presets</span>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() => applyPreset(preset)}
                        className="p-3 rounded-xl border border-border hover:border-muted-foreground text-left transition-all"
                      >
                        <span className="text-sm font-medium block">{preset.label}</span>
                        <span className="text-xs text-muted-foreground">{preset.width} × {preset.height}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleResize}
                    disabled={isProcessing}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                      "bg-foreground text-background hover:opacity-90",
                      "disabled:opacity-50"
                    )}
                  >
                    {isProcessing ? "Resizing..." : (
                      <>
                        <Crop className="h-4 w-4" />
                        Resize to {width} × {height}
                      </>
                    )}
                  </button>
                </div>
                {isComplete && downloadUrl && (
                  <a
                    href={downloadUrl}
                    download="resized.jpg"
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
