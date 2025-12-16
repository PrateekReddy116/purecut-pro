import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ImageIcon, 
  RefreshCcw, 
  Shrink, 
  Crop, 
  RotateCw,
  Droplet,
  Loader2,
  Download,
  Check
} from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const imageTools: ToolItem[] = [
  { name: "Format Converter", href: "/image-tools/convert", icon: RefreshCcw, description: "Convert image formats" },
  { name: "Image Compressor", href: "/image-tools/compress", icon: Shrink, description: "Reduce file size" },
  { name: "Image Resizer", href: "/image-tools/resize", icon: Crop, description: "Change dimensions" },
  { name: "Rotate & Flip", href: "/image-tools/rotate", icon: RotateCw, description: "Rotate images" },
  { name: "Add Watermark", href: "/image-tools/watermark", icon: Droplet, description: "Add text or image watermarks" },
];

const outputFormats = [
  { value: "png", label: "PNG", desc: "Best for transparency" },
  { value: "jpg", label: "JPG", desc: "Best for photos" },
  { value: "webp", label: "WebP", desc: "Best for web" },
  { value: "gif", label: "GIF", desc: "For animations" },
];

export default function ImageConvert() {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState("png");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    
    // Generate previews
    const newPreviews: string[] = [];
    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === selectedFiles.length) {
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    // Simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  return (
    <ToolLayout
      title="Image Tools"
      description="Process and convert images"
      tools={imageTools}
      categoryIcon={ImageIcon}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
              <RefreshCcw className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Format Converter</h1>
              <p className="text-muted-foreground">Convert images between different formats</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <FileUpload
            accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"] }}
            maxFiles={20}
            onFilesSelected={handleFilesSelected}
            title="Drop images here"
            description="PNG, JPG, WebP, GIF, BMP up to 20MB each"
          />

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Format selection */}
              <div className="space-y-3">
                <h3 className="font-medium">Output Format</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {outputFormats.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setOutputFormat(format.value)}
                      className={cn(
                        "p-4 rounded-xl border transition-all text-left",
                        outputFormat === format.value
                          ? "border-primary bg-primary/10"
                          : "border-border/50 hover:border-primary/50 hover:bg-secondary/50"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{format.label}</span>
                        {outputFormat === format.value && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{format.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-medium">Preview ({files.length} images)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previews.slice(0, 8).map((preview, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-xl overflow-hidden bg-secondary/30 border border-border/50"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {files.length > 8 && (
                      <div className="aspect-square rounded-xl bg-secondary/50 border border-border/50 flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground">
                          +{files.length - 8}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleConvert}
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
                      Converting...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4" />
                      Convert to {outputFormat.toUpperCase()}
                    </>
                  )}
                </button>

                {isComplete && (
                  <button
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                      "bg-accent text-accent-foreground",
                      "hover:opacity-90"
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Download All
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { title: "Batch Convert", desc: "Convert multiple images at once" },
              { title: "Quality Preserved", desc: "No quality loss during conversion" },
              { title: "Fast Processing", desc: "Instant conversion in your browser" },
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
