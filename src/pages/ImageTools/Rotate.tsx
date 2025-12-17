import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ImageIcon, RefreshCcw, Shrink, Crop, RotateCw, Droplet, Download, RotateCcw, FlipHorizontal, FlipVertical } from "lucide-react";
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

export default function ImageRotate() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFiles[0]);
    }
  }, []);

  const rotateLeft = () => setRotation((r) => (r - 90) % 360);
  const rotateRight = () => setRotation((r) => (r + 90) % 360);

  const handleApply = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    setIsComplete(true);
  };

  const transformStyle = {
    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
  };

  return (
    <ToolLayout title="Image Tools" description="Image processing" tools={imageTools} categoryIcon={ImageIcon}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Rotate & Flip</h1>
          <p className="text-muted-foreground">Rotate or flip your images</p>
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
            {/* Preview */}
            <div className="flex justify-center">
              <div className="aspect-square w-full max-w-md rounded-2xl overflow-hidden bg-secondary border border-border flex items-center justify-center">
                <motion.img
                  src={preview}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain"
                  animate={transformStyle}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={rotateLeft}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-secondary transition-colors"
              >
                <RotateCcw className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Rotate Left</span>
              </button>
              <button
                onClick={rotateRight}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-secondary transition-colors"
              >
                <RotateCw className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Rotate Right</span>
              </button>
              <button
                onClick={() => setFlipH(!flipH)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors",
                  flipH ? "border-foreground bg-secondary" : "border-border hover:bg-secondary"
                )}
              >
                <FlipHorizontal className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Flip H</span>
              </button>
              <button
                onClick={() => setFlipV(!flipV)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border transition-colors",
                  flipV ? "border-foreground bg-secondary" : "border-border hover:bg-secondary"
                )}
              >
                <FlipVertical className="h-6 w-6" />
                <span className="text-xs text-muted-foreground">Flip V</span>
              </button>
            </div>

            {/* Info */}
            <div className="text-center text-sm text-muted-foreground">
              Rotation: {rotation}° | Flip H: {flipH ? "Yes" : "No"} | Flip V: {flipV ? "Yes" : "No"}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setRotation(0);
                  setFlipH(false);
                  setFlipV(false);
                }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-border hover:bg-secondary transition-colors"
              >
                Reset
              </button>
              <button
                onClick={handleApply}
                disabled={isProcessing}
                className={cn(
                  "flex items-center justify-center gap-2 px-8 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Applying..." : "Apply Changes"}
              </button>
              {isComplete && (
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
