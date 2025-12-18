import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, ZoomIn, Eraser, Download, RotateCcw, SlidersHorizontal } from "lucide-react";
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

const enhancementOptions = [
  { id: "auto", label: "Auto Enhance", desc: "AI-powered automatic enhancement" },
  { id: "sharpen", label: "Sharpen", desc: "Increase image clarity" },
  { id: "denoise", label: "Denoise", desc: "Remove image noise" },
  { id: "color", label: "Color Correct", desc: "Fix color balance" },
];

export default function ImageEnhancer() {
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null);
  const [enhancement, setEnhancement] = useState("auto");
  const [intensity, setIntensity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setEnhancedPreview(null);
    setError(null);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFiles[0]);
    } else {
      setPreview(null);
    }
  }, []);

  const handleEnhance = async () => {
    if (files.length === 0 || !files[0]) return;

    setError(null);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("image", files[0]);

      // Map UI "intensity" (0–100) to modest adjustment factors
      const factor = 1 + (intensity - 50) / 100 * 0.5; // ~0.75–1.25
      const params = new URLSearchParams({
        sharpness: factor.toFixed(2),
        contrast: factor.toFixed(2),
        brightness: (1 + (intensity - 50) / 100 * 0.2).toFixed(2),
      });

      const response = await fetch(`${API_BASE_URL}/image-enhancer?${params.toString()}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setEnhancedPreview(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to enhance image. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setPreview(null);
    setIsComplete(false);
    setEnhancedPreview(null);
    setError(null);
  };

  return (
    <ToolLayout title="AI Tools" description="AI-powered processing" tools={aiTools} categoryIcon={Sparkles}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Image Enhancer</h1>
          <p className="text-muted-foreground">Enhance your images with AI-powered adjustments</p>
        </div>

        {!preview ? (
          <FileUpload
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
            maxFiles={1}
            onFilesSelected={handleFilesSelected}
            title="Upload an image to enhance"
            description="PNG, JPG, or WebP"
          />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Preview */}
              <div className="space-y-3">
                <span className="text-sm font-medium text-muted-foreground">Preview</span>
                <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border">
                  <img src={enhancedPreview ?? preview!} alt="Preview" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <span className="text-sm font-medium text-muted-foreground">Enhancement Type</span>
                  <div className="grid grid-cols-2 gap-3">
                    {enhancementOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setEnhancement(option.id)}
                        className={cn(
                          "p-4 rounded-xl border text-left transition-all",
                          enhancement === option.id
                            ? "border-foreground bg-secondary"
                            : "border-border hover:border-muted-foreground"
                        )}
                      >
                        <span className="font-medium block">{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Intensity</span>
                    <span className="text-sm font-medium">{intensity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-1 bg-border rounded-full appearance-none cursor-pointer accent-foreground"
                  />
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    onClick={handleEnhance}
                    disabled={isProcessing}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                      "bg-foreground text-background hover:opacity-90",
                      "disabled:opacity-50"
                    )}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                          <SlidersHorizontal className="h-4 w-4" />
                        </motion.div>
                        Enhancing...
                      </span>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Enhance Image
                      </>
                    )}
                  </button>

                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-border hover:bg-secondary transition-colors"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </button>
                    {isComplete && enhancedPreview && (
                      <a
                        href={enhancedPreview}
                        download="enhanced-image.jpg"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
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
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
