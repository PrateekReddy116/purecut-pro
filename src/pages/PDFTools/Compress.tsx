import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock, FileDown, Download, Check } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload, ProcessingStatus } from "@/components/FileUpload";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

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
  { value: "safe", label: "Safe (lossless)", desc: "Keeps quality; often small savings", reduction: "PyMuPDF" },
  { value: "fast", label: "Fast (lossless)", desc: "Quick cleanup/deflate; best-effort", reduction: "qpdf" },
  { value: "small", label: "Smaller file", desc: "Aggressive; may reduce quality", reduction: "Ghostscript" },
];

export default function PDFCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [compression, setCompression] = useState("safe");
  const [gsPreset, setGsPreset] = useState<"screen" | "ebook" | "printer" | "prepress">("ebook");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState({ original: 0, compressed: 0 });
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const LARGE_FILE_BYTES = 50 * 1024 * 1024;

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setError(null);
    setProgress(0);
    setStatus(undefined);
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
    setIsComplete(false);
    setProgress(0);
    setStatus("Uploading...");

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      // Back-compat: keep sending level, but we now choose an engine.
      formData.append("level", "medium");
      if (compression === "safe") {
        formData.append("engine", "pymupdf");
      } else if (compression === "fast") {
        formData.append("engine", "qpdf");
      } else {
        formData.append("engine", "ghostscript");
        formData.append("preset", gsPreset);
      }

      const blob: Blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_BASE_URL}/pdf/compress`);
        xhr.responseType = "blob";

        xhr.upload.onprogress = (evt) => {
          if (!evt.lengthComputable) return;
          const pct = Math.min(85, Math.max(0, Math.round((evt.loaded / evt.total) * 85)));
          setProgress(pct);
          setStatus("Uploading...");
        };

        xhr.onloadstart = () => {
          setProgress(0);
          setStatus("Uploading...");
        };

        xhr.upload.onloadend = () => {
          setProgress((p) => Math.max(p, 85));
          setStatus("Compressing on server...");
        };

        xhr.onprogress = (evt) => {
          // Download progress (may be unknown if server doesn't send Content-Length).
          if (!evt.lengthComputable) {
            setProgress((p) => Math.max(p, 90));
            return;
          }
          const pct = 90 + Math.round((evt.loaded / evt.total) * 10);
          setProgress(Math.min(99, Math.max(90, pct)));
        };

        xhr.onerror = () => reject(new Error("Network error"));
        xhr.ontimeout = () => reject(new Error("Request timed out"));
        xhr.onload = () => {
          if (xhr.status < 200 || xhr.status >= 300) {
            reject(new Error(`Compression failed with status ${xhr.status}`));
            return;
          }
          resolve(xhr.response);
        };

        xhr.send(formData);
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setResult({ ...result, compressed: blob.size });
      setIsComplete(true);
      setProgress(100);
      setStatus("Done");
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
          maxSize={Infinity}
          onFilesSelected={handleFilesSelected}
          title="Upload a PDF to compress"
          description="PDF files only"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            <ProcessingStatus isProcessing={isProcessing} progress={progress} status={status} />

            {/* File info */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{files[0].name}</p>
                    <p className="text-sm text-muted-foreground">Original: {formatSize(result.original)}</p>
                    {files[0].size > LARGE_FILE_BYTES && (
                      <p className="text-xs text-amber-600 mt-1">
                        Compression may take longer due to larger file size.
                      </p>
                    )}
                  </div>
                </div>
                {isComplete && (
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatSize(result.compressed)}</p>
                    <p className="text-sm text-muted-foreground">
                      {(() => {
                        if (result.original <= 0) return "";
                        const pct = Math.round((1 - result.compressed / result.original) * 100);
                        if (pct <= 0) return "Already compact — no further reduction";
                        return `${pct}% smaller`;
                      })()}
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
              {compression === "small" && (
                <div className="mt-3 p-3 rounded-xl border border-amber-300/40 bg-amber-500/10">
                  <p className="text-xs text-muted-foreground">
                    “Smaller file” uses Ghostscript and may reduce quality (especially scanned PDFs).
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["screen", "ebook", "printer", "prepress"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setGsPreset(p)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs border transition-colors",
                          gsPreset === p ? "bg-foreground text-background border-foreground" : "bg-secondary border-border hover:bg-muted"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
