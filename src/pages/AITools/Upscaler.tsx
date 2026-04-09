import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, ZoomIn, Eraser, Download, RotateCcw, ArrowRight } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const aiTools: ToolItem[] = [
  { name: "Background Remover", href: "/ai-tools/background-remover", icon: Wand2 },
  { name: "Image Enhancer", href: "/ai-tools/enhancer", icon: Sparkles },
  { name: "Object Remover", href: "/ai-tools/object-remover", icon: Eraser },
  { name: "Image Upscaler", href: "/ai-tools/upscaler", icon: ZoomIn },
];

import { API_BASE_URL } from "@/config/api";

const scaleOptions = [
  { value: 2, label: "2x", desc: "Double size" },
  { value: 3, label: "3x", desc: "Triple size" },
  { value: 4, label: "4x", desc: "Quadruple size" },
];

export default function ImageUpscaler() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [upscaledPreview, setUpscaledPreview] = useState<string | null>(null);
  const [scale, setScale] = useState(2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setUpscaledPreview(null);
    setError(null);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        const img = new Image();
        img.onload = () => {
          setOriginalDimensions({ width: img.width, height: img.height });
        };
        img.src = result;
      };
      reader.readAsDataURL(selectedFiles[0]);
    } else {
      setPreview(null);
    }
  }, []);

  const handleUpscale = async () => {
    if (files.length === 0 || !files[0]) return;

    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("image", files[0]);

      const response = await fetch(`${API_BASE_URL}/image-upscaler?scale=${scale}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setUpscaledPreview(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to upscale image. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreview(null);
    setIsComplete(false);
    setOriginalDimensions({ width: 0, height: 0 });
    setUpscaledPreview(null);
    setError(null);
  };

  return (
    <ToolLayout title="AI Tools" description="AI-powered processing" tools={aiTools} categoryIcon={Sparkles}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Image Upscaler</h1>
          <p className="text-muted-foreground">Enlarge images up to 4x without losing quality</p>
        </div>

        {!preview ? (
          <FileUpload
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            maxFiles={1}
            onFilesSelected={handleFilesSelected}
            title="Upload an image to upscale"
            description="PNG, JPG, or WebP"
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Preview with dimensions */}
            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="aspect-square w-32 rounded-xl overflow-hidden bg-secondary border border-border mb-2">
                  <img src={preview!} alt="Original" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-medium">Original</p>
                <p className="text-xs text-muted-foreground">{originalDimensions.width} × {originalDimensions.height}</p>
              </div>

              <ArrowRight className="h-6 w-6 text-muted-foreground" />

              <div className="text-center">
                <div className="aspect-square w-32 rounded-xl overflow-hidden bg-secondary border border-border mb-2 relative">
                  <img src={upscaledPreview ?? preview!} alt="Upscaled" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <span className="text-2xl font-bold">{scale}x</span>
                  </div>
                </div>
                <p className="text-sm font-medium">Upscaled</p>
                <p className="text-xs text-muted-foreground">
                  {originalDimensions.width * scale} × {originalDimensions.height * scale}
                </p>
              </div>
            </div>

            {/* Scale selection */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Upscale Factor</span>
              <div className="grid grid-cols-3 gap-3">
                {scaleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setScale(option.value)}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all",
                      scale === option.value
                        ? "border-foreground bg-secondary"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="text-2xl font-bold block">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Output info */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Output Resolution</span>
                <span className="font-medium">{originalDimensions.width * scale} × {originalDimensions.height * scale} px</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-border hover:bg-secondary transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                onClick={handleUpscale}
                disabled={isProcessing}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Upscaling..." : (
                  <>
                    <ZoomIn className="h-4 w-4" />
                    Upscale to {scale}x
                  </>
                )}
              </button>
              {isComplete && upscaledPreview && (
                <a
                  href={upscaledPreview}
                  download={`upscaled-${scale}x.jpg`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              )}
            </div>

            {error && (
              <p className="mt-2 text-sm text-destructive text-center">
                {error}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
