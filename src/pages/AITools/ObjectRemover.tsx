import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, ZoomIn, Eraser, Download, RotateCcw, MousePointer2 } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const aiTools: ToolItem[] = [
  { name: "Background Remover", href: "/ai-tools/background-remover", icon: Wand2 },
  { name: "Image Enhancer", href: "/ai-tools/enhancer", icon: Sparkles },
  { name: "Object Remover", href: "/ai-tools/object-remover", icon: Eraser },
  { name: "Image Upscaler", href: "/ai-tools/upscaler", icon: ZoomIn },
];

export default function ObjectRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFiles[0]);
    } else {
      setPreview(null);
    }
  }, []);

  const handleRemove = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  const handleReset = () => {
    setFiles([]);
    setPreview(null);
    setIsComplete(false);
  };

  return (
    <ToolLayout title="AI Tools" description="AI-powered processing" tools={aiTools} categoryIcon={Sparkles}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Object Remover</h1>
          <p className="text-muted-foreground">Paint over objects to remove them from your image</p>
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
            {/* Instructions */}
            <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border">
              <MousePointer2 className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Paint over the objects you want to remove. The AI will fill in the area naturally.
              </p>
            </div>

            {/* Canvas area */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary border border-border">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full cursor-crosshair"
              />
            </div>

            {/* Brush controls */}
            <div className="flex items-center gap-6 p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Brush Size</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="flex-1 h-1 bg-border rounded-full appearance-none cursor-pointer accent-foreground"
                />
                <span className="text-sm font-medium w-8">{brushSize}</span>
              </div>
              <div
                className="rounded-full border-2 border-foreground/50"
                style={{ width: Math.min(brushSize, 50), height: Math.min(brushSize, 50) }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-border hover:bg-secondary transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Start Over
              </button>
              <button
                onClick={handleRemove}
                disabled={isProcessing}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Removing..." : (
                  <>
                    <Eraser className="h-4 w-4" />
                    Remove Objects
                  </>
                )}
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
