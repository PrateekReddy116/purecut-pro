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

const API_BASE_URL = "http://127.0.0.1:8000";

export default function ObjectRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [maskFiles, setMaskFiles] = useState<File[]>([]);
  const [resultPreview, setResultPreview] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setResultPreview(null);
    setError(null);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFiles[0]);
    } else {
      setPreview(null);
    }
  }, []);

  const handleMaskSelected = useCallback((selectedFiles: File[]) => {
    setMaskFiles(selectedFiles);
    setIsComplete(false);
    setError(null);
  }, []);

  const handleRemove = async () => {
    if (files.length === 0 || !files[0] || maskFiles.length === 0 || !maskFiles[0]) {
      setError("Please upload both an image and a mask (white = areas to remove).");
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("image", files[0]);
      formData.append("mask", maskFiles[0]);

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
    setIsComplete(false);
    setMaskFiles([]);
    setResultPreview(null);
    setError(null);
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
                Upload an object mask (white = areas to remove). Painting tools will be added later.
              </p>
            </div>

            {/* Original image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary border border-border">
              <img src={preview} alt="Preview" className="w-full h-full object-contain" />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
            </div>

            {/* Mask upload */}
            <FileUpload
              accept={{ "image/*": [".png", ".jpg", ".jpeg"] }}
              maxFiles={1}
              onFilesSelected={handleMaskSelected}
              title="Upload a mask image"
              description="White pixels mark objects to remove"
            />

            {/* Result preview */}
            {resultPreview && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-muted-foreground">Result</span>
                <div className="aspect-video rounded-2xl overflow-hidden bg-secondary border border-border">
                  <img src={resultPreview} alt="Result" className="w-full h-full object-contain" />
                </div>
              </div>
            )}

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

            {error && (
              <p className="text-sm text-destructive text-center">
                {error}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
