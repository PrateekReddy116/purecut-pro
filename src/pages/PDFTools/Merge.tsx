import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Combine, 
  Split, 
  ImageIcon, 
  FileImage,
  Lock,
  Unlock,
  GripVertical,
  Trash2,
  Loader2,
  Download
} from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

const pdfTools: ToolItem[] = [
  { name: "Merge PDFs", href: "/pdf-tools/merge", icon: Combine, description: "Combine multiple PDFs" },
  { name: "Split PDF", href: "/pdf-tools/split", icon: Split, description: "Split PDF into pages" },
  { name: "PDF to Images", href: "/pdf-tools/to-images", icon: ImageIcon, description: "Convert PDF to images" },
  { name: "Images to PDF", href: "/pdf-tools/from-images", icon: FileImage, description: "Create PDF from images" },
  { name: "Protect PDF", href: "/pdf-tools/protect", icon: Lock, description: "Add password protection" },
  { name: "Unlock PDF", href: "/pdf-tools/unlock", icon: Unlock, description: "Remove password protection" },
];

export default function PDFMerge() {
  const [files, setFiles] = useState<File[]>([]);
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
  }, [downloadUrl]);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    const newFiles = [...files];
    const [removed] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, removed);
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`${API_BASE_URL}/pdf/merge`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Merge failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to merge PDFs. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout
      title="PDF Tools"
      description="All-in-one PDF processing"
      tools={pdfTools}
      categoryIcon={FileText}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 flex items-center justify-center">
              <Combine className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Merge PDFs</h1>
              <p className="text-muted-foreground">Combine multiple PDF files into one document</p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="space-y-6">
          <FileUpload
            accept={{ "application/pdf": [".pdf"] }}
            maxFiles={20}
            onFilesSelected={handleFilesSelected}
            title="Drop PDF files here"
            description="or click to browse"
          />

          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Files to merge ({files.length})</h3>
                <p className="text-sm text-muted-foreground">Drag to reorder</p>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.name}-${index}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50"
                  >
                    <button className="cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical className="h-5 w-5" />
                    </button>
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground px-2 py-1 rounded-full bg-secondary">
                      #{index + 1}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={handleMerge}
                  disabled={files.length < 2 || isProcessing}
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
                      Merging...
                    </>
                  ) : (
                    <>
                      <Combine className="h-4 w-4" />
                      Merge PDFs
                    </>
                  )}
                </button>

                {isComplete && downloadUrl && (
                  <a
                    href={downloadUrl}
                    download="merged.pdf"
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                      "bg-accent text-accent-foreground",
                      "hover:opacity-90"
                    )}
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                )}
              </div>
            </motion.div>
          )}

          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {[
              { title: "Fast & Secure", desc: "All processing happens in your browser" },
              { title: "Keep Quality", desc: "Original PDF quality is preserved" },
              { title: "Unlimited Files", desc: "Merge as many PDFs as you need" },
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
        {error && (
          <p className="mt-4 text-sm text-destructive text-center">
            {error}
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
