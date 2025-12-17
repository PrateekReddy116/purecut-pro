import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock, FileDown, Download, Check } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const pdfTools: ToolItem[] = [
  { name: "Merge PDFs", href: "/pdf-tools/merge", icon: Combine },
  { name: "Split PDF", href: "/pdf-tools/split", icon: Split },
  { name: "PDF to Images", href: "/pdf-tools/to-images", icon: ImageIcon },
  { name: "Images to PDF", href: "/pdf-tools/from-images", icon: FileImage },
  { name: "Compress PDF", href: "/pdf-tools/compress", icon: FileDown },
  { name: "Protect PDF", href: "/pdf-tools/protect", icon: Lock },
  { name: "Unlock PDF", href: "/pdf-tools/unlock", icon: Unlock },
];

const formatOptions = [
  { value: "png", label: "PNG", desc: "Lossless quality" },
  { value: "jpg", label: "JPG", desc: "Smaller file size" },
];

const qualityOptions = [
  { value: "high", label: "High", dpi: "300 DPI" },
  { value: "medium", label: "Medium", dpi: "150 DPI" },
  { value: "low", label: "Low", dpi: "72 DPI" },
];

export default function PDFToImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState("png");
  const [quality, setQuality] = useState("high");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
  }, []);

  const handleConvert = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsProcessing(false);
    setIsComplete(true);
  };

  return (
    <ToolLayout title="PDF Tools" description="PDF processing" tools={pdfTools} categoryIcon={FileText}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">PDF to Images</h1>
          <p className="text-muted-foreground">Convert PDF pages to high-quality images</p>
        </div>

        <FileUpload
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          title="Upload a PDF"
          description="PDF files only"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* Format selection */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Output Format</span>
              <div className="grid grid-cols-2 gap-3">
                {formatOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFormat(option.value)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                      format === option.value ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div>
                      <span className="font-medium block">{option.label}</span>
                      <span className="text-sm text-muted-foreground">{option.desc}</span>
                    </div>
                    {format === option.value && <Check className="h-5 w-5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality selection */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Image Quality</span>
              <div className="grid grid-cols-3 gap-3">
                {qualityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setQuality(option.value)}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all",
                      quality === option.value ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="font-medium block">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.dpi}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleConvert}
                disabled={isProcessing}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Converting..." : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    Convert to {format.toUpperCase()}
                  </>
                )}
              </button>
              {isComplete && (
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors">
                  <Download className="h-4 w-4" />
                  Download ZIP
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
