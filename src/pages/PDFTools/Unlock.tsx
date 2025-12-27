import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock, FileDown, Download, Eye, EyeOff, AlertCircle } from "lucide-react";
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

export default function PDFUnlock() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setError("");
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  }, [downloadUrl]);

  const handleUnlock = async () => {
    if (files.length === 0 || !files[0] || !password) return;

    setIsProcessing(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("password", password);

      const response = await fetch(`${API_BASE_URL}/pdf/unlock`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Incorrect password. Please try again.");
          return;
        }
        throw new Error(`Unlock failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      if (!error) {
        setError("Failed to unlock PDF. Please try again.");
      }
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout title="PDF Tools" description="PDF processing" tools={pdfTools} categoryIcon={FileText}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Unlock PDF</h1>
          <p className="text-muted-foreground">Remove password protection from a PDF</p>
        </div>

        <FileUpload
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          title="Upload a protected PDF"
          description="PDF files only"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* File info */}
            <div className="p-4 rounded-xl bg-secondary border border-border flex items-center gap-3">
              <Lock className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{files[0].name}</p>
                <p className="text-sm text-muted-foreground">Password protected</p>
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Enter PDF Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter the PDF password"
                  className={cn(
                    "w-full px-4 py-3 pr-12 rounded-xl border bg-background focus:outline-none transition-colors",
                    error ? "border-red-500" : "border-border focus:border-foreground"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>

            {/* Notice */}
            <div className="p-4 rounded-xl bg-secondary border border-border">
              <p className="text-sm text-muted-foreground">
                You must know the password to unlock the PDF. This tool cannot bypass password protection without the correct password.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleUnlock}
                disabled={isProcessing || !password}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Unlocking..." : (
                  <>
                    <Unlock className="h-4 w-4" />
                    Unlock PDF
                  </>
                )}
              </button>
              {isComplete && downloadUrl && (
                <a
                  href={downloadUrl}
                  download="unlocked.pdf"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
