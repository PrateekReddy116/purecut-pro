import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock, FileDown, Download, Check } from "lucide-react";
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

const compressionLevels = [
  { value: "low", label: "Low Compression", desc: "Best quality, larger file", reduction: "~20%" },
  { value: "medium", label: "Recommended", desc: "Balanced quality & size", reduction: "~50%" },
  { value: "high", label: "Maximum", desc: "Smallest file, lower quality", reduction: "~80%" },
];

export default function PDFCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [compression, setCompression] = useState("medium");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState({ original: 0, compressed: 0 });
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
    if (selectedFiles.length > 0) {
      setResult({ original: selectedFiles[0].size, compressed: 0 });
    }
  }, [downloadUrl]);

  const handleCompress = async () => {
    if (files.length === 0 || !files[0]) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("level", compression);

      const response = await fetch(`${API_BASE_URL}/pdf/compress`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Compression failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResult({ ...result, compressed: blob.size });
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to compress PDF. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <ToolLayout title="PDF Tools" description="PDF processing" tools={pdfTools} categoryIcon={FileText}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Compress PDF</h1>
          <p className="text-muted-foreground">Reduce PDF file size without losing quality</p>
        </div>

        <FileUpload
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          title="Upload a PDF to compress"
          description="PDF files only"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* File info */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{files[0].name}</p>
                    <p className="text-sm text-muted-foreground">Original: {formatSize(result.original)}</p>
                  </div>
                </div>
                {isComplete && (
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatSize(result.compressed)}</p>
                    <p className="text-sm text-muted-foreground">
                      {Math.round((1 - result.compressed / result.original) * 100)}% smaller
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Compression level */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Compression Level</span>
              <div className="space-y-2">
                {compressionLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setCompression(level.value)}
                    className={cn(
                      "w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                      compression === level.value ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <div>
                      <span className="font-medium block">{level.label}</span>
                      <span className="text-sm text-muted-foreground">{level.desc}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{level.reduction}</span>
                      {compression === level.value && <Check className="h-5 w-5" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCompress}
                disabled={isProcessing}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Compressing..." : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Compress PDF
                  </>
                )}
              </button>
              {isComplete && downloadUrl && (
                <a
                  href={downloadUrl}
                  download="compressed.pdf"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              )}
            </div>
          </motion.div>
        )}
        {error && (
          <p className="mt-4 text-sm text-destructive text-center">
            {error}
          </p>
        )}
      </div>
    </ToolLayout>
  );
}
