import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wand2, 
  Sparkles, 
  Eraser, 
  ZoomIn,
  Download,
  Loader2,
  RotateCcw,
  Image as ImageIcon
} from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const aiTools: ToolItem[] = [
  { name: "Background Remover", href: "/ai-tools/background-remover", icon: Wand2, description: "Remove backgrounds from images" },
  { name: "Image Enhancer", href: "/ai-tools/enhancer", icon: Sparkles, description: "Enhance image quality" },
  { name: "Object Remover", href: "/ai-tools/object-remover", icon: Eraser, description: "Remove unwanted objects" },
  { name: "Image Upscaler", href: "/ai-tools/upscaler", icon: ZoomIn, description: "Upscale images with AI" },
];

export default function BackgroundRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    if (selectedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFiles[0]);
    } else {
      setOriginalPreview(null);
      setProcessedImage(null);
    }
  }, []);

  const handleProcess = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setProgress(0);

    // Simulate processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate API call - in real implementation, call the actual API
    await new Promise((resolve) => setTimeout(resolve, 2500));
    
    setIsProcessing(false);
    setProgress(100);
    // For demo, use original as processed (in real app, this would be the result)
    setProcessedImage(originalPreview);
  };

  const handleReset = () => {
    setFiles([]);
    setOriginalPreview(null);
    setProcessedImage(null);
    setProgress(0);
  };

  return (
    <ToolLayout
      title="AI Tools"
      description="AI-powered image processing"
      tools={aiTools}
      categoryIcon={Sparkles}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Wand2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Background Remover</h1>
              <p className="text-muted-foreground">Remove backgrounds from images instantly with AI</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          {!originalPreview ? (
            <FileUpload
              accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
              maxFiles={1}
              onFilesSelected={handleFilesSelected}
              title="Upload an image"
              description="PNG, JPG, JPEG, or WebP up to 20MB"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Image comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Original</span>
                    <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary">
                      {files[0]?.name}
                    </span>
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary/30 border border-border">
                    <img
                      src={originalPreview}
                      alt="Original"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Processed */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Result</span>
                    {processedImage && (
                      <span className="text-xs text-primary px-2 py-1 rounded-full bg-primary/10">
                        Ready to download
                      </span>
                    )}
                  </div>
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-[url('/placeholder.svg')] bg-repeat bg-[length:20px_20px] border border-border">
                    <AnimatePresence>
                      {isProcessing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
                        >
                          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                          <span className="text-sm font-medium">Processing... {progress}%</span>
                          <div className="w-48 h-2 rounded-full bg-secondary mt-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-primary rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {processedImage && !isProcessing && (
                      <motion.img
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={processedImage}
                        alt="Processed"
                        className="w-full h-full object-contain"
                      />
                    )}

                    {!processedImage && !isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            Click "Remove Background" to process
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors font-medium"
                >
                  <RotateCcw className="h-4 w-4" />
                  Upload New
                </button>

                <button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all",
                    "bg-primary text-primary-foreground",
                    "shadow-[0_0_20px_hsl(var(--primary)/0.4)]",
                    "hover:shadow-[0_0_30px_hsl(var(--primary)/0.6)]",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Remove Background
                    </>
                  )}
                </button>

                {processedImage && (
                  <button
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                      "bg-accent text-accent-foreground",
                      "hover:opacity-90"
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Download PNG
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Info cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { title: "AI-Powered", desc: "Advanced AI models for precise cutouts" },
              { title: "100% Private", desc: "Processing happens in your browser" },
              { title: "Instant Results", desc: "Get results in seconds, not minutes" },
            ].map((item, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-secondary/30 border border-border/50"
              >
                <h3 className="font-medium mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
