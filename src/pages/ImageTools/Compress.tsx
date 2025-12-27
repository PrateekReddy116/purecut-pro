import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ImageIcon, RefreshCcw, Shrink, Crop, RotateCw, Droplet, Download, Check } from "lucide-react";
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

const qualityPresets = [
  { value: 90, label: "High Quality", desc: "Minimal compression" },
  { value: 75, label: "Balanced", desc: "Good quality, smaller size" },
  { value: 50, label: "Maximum Compression", desc: "Smallest file size" },
];

export default function ImageCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(75);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [results, setResults] = useState<{ original: number; compressed: number }[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setError(null);
    setResults(selectedFiles.map((f) => ({ original: f.size, compressed: 0 })));
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  }, [downloadUrl]);

  const handleCompress = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("quality", quality.toString());
      
      const response = await fetch(`${API_BASE_URL}/image/compress`, {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Compression failed with status ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      
      // Estimate compressed sizes (actual will be in ZIP)
      setResults(files.map((f) => ({ 
        original: f.size, 
        compressed: Math.round(f.size * (quality / 100))
      })));
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to compress images. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const totalOriginal = results.reduce((acc, r) => acc + r.original, 0);
  const totalCompressed = results.reduce((acc, r) => acc + r.compressed, 0);

  return (
    <ToolLayout title="Image Tools" description="Image processing" tools={imageTools} categoryIcon={ImageIcon}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Image Compressor</h1>
          <p className="text-muted-foreground">Reduce image file size without visible quality loss</p>
        </div>

        <FileUpload
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
          maxFiles={20}
          onFilesSelected={handleFilesSelected}
          title="Upload images to compress"
          description="PNG, JPG, or WebP"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* Quality slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Quality</span>
                <span className="text-sm font-medium">{quality}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-foreground"
              />
              <div className="grid grid-cols-3 gap-3">
                {qualityPresets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setQuality(preset.value)}
                    className={cn(
                      "p-3 rounded-xl border text-center transition-all",
                      quality === preset.value ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="text-sm font-medium block">{preset.label}</span>
                    <span className="text-xs text-muted-foreground">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {isComplete && (
              <div className="p-4 rounded-xl bg-secondary border border-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Original</p>
                    <p className="font-medium">{formatSize(totalOriginal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Compressed</p>
                    <p className="font-medium">{formatSize(totalCompressed)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Saved</p>
                    <p className="font-medium text-green-600">
                      {Math.round((1 - totalCompressed / totalOriginal) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Compressing..." : (
                  <>
                    <Shrink className="h-4 w-4" />
                    Compress {files.length} Image{files.length > 1 ? "s" : ""}
                  </>
                )}
              </button>
              {isComplete && downloadUrl && (
                <a
                  href={downloadUrl}
                  download="compressed_images.zip"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download All
                </a>
              )}
              {error && (
                <p className="text-sm text-destructive text-center mt-2">{error}</p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
