import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock, FileDown, Download, GripVertical, Trash2 } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const API_BASE_URL = "http://127.0.0.1:8000";

const pdfTools: ToolItem[] = [
  { name: "Merge PDFs", href: "/pdf-tools/merge", icon: Combine },
  { name: "Split PDF", href: "/pdf-tools/split", icon: Split },
  { name: "PDF to Images", href: "/pdf-tools/to-images", icon: ImageIcon },
  { name: "Images to PDF", href: "/pdf-tools/from-images", icon: FileImage },
  { name: "Compress PDF", href: "/pdf-tools/compress", icon: FileDown },
  { name: "Protect PDF", href: "/pdf-tools/protect", icon: Lock },
  { name: "Unlock PDF", href: "/pdf-tools/unlock", icon: Unlock },
];

const pageSizes = [
  { value: "a4", label: "A4", dim: "210 × 297 mm" },
  { value: "letter", label: "Letter", dim: "8.5 × 11 in" },
  { value: "fit", label: "Fit to Image", dim: "Auto" },
];

export default function ImagesToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState("a4");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setError(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }

    const newPreviews: string[] = [];
    selectedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews[index] = e.target?.result as string;
        if (newPreviews.filter(Boolean).length === selectedFiles.length) {
          setPreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("page_size", pageSize);

      const response = await fetch(`${API_BASE_URL}/pdf/from-images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Conversion failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to create PDF from images. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout title="PDF Tools" description="PDF processing" tools={pdfTools} categoryIcon={FileText}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Images to PDF</h1>
          <p className="text-muted-foreground">Create a PDF from multiple images</p>
        </div>

        <FileUpload
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }}
          maxFiles={50}
          onFilesSelected={handleFilesSelected}
          title="Upload images"
          description="PNG, JPG, or WebP"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* Image list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Images ({files.length})</span>
                <span className="text-xs text-muted-foreground">Drag to reorder</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-[3/4] rounded-lg overflow-hidden bg-secondary border border-border">
                      <img src={preview} alt={`Page ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute top-1 left-1 w-5 h-5 rounded bg-foreground text-background text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-5 h-5 rounded bg-background/80 text-foreground opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Page size */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Page Size</span>
              <div className="grid grid-cols-3 gap-3">
                {pageSizes.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setPageSize(size.value)}
                    className={cn(
                      "p-4 rounded-xl border text-center transition-all",
                      pageSize === size.value ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <span className="font-medium block">{size.label}</span>
                    <span className="text-xs text-muted-foreground">{size.dim}</span>
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
                {isProcessing ? "Creating PDF..." : (
                  <>
                    <FileImage className="h-4 w-4" />
                    Create PDF
                  </>
                )}
              </button>
              {isComplete && downloadUrl && (
                <a
                  href={downloadUrl}
                  download="images.pdf"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
