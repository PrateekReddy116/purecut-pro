import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock, FileDown, Download } from "lucide-react";
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

export default function PDFSplit() {
  const [files, setFiles] = useState<File[]>([]);
  const [splitMode, setSplitMode] = useState<"pages" | "range">("pages");
  const [pageRange, setPageRange] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [isFetchingPages, setIsFetchingPages] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setError(null);
    setTotalPages(null);
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
    if (selectedFiles.length > 0) {
      const [file] = selectedFiles;
      setIsFetchingPages(true);
      (async () => {
        try {
          const formData = new FormData();
          formData.append("file", file);
          const response = await fetch(`${API_BASE_URL}/pdf/page-count`, {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error(`Page count failed with status ${response.status}`);
          }
          const data = await response.json();
          if (typeof data.pages === "number") {
            setTotalPages(data.pages);
          }
        } catch (err) {
          console.error(err);
          setError("Could not read page count for this PDF, but splitting will still work.");
        } finally {
          setIsFetchingPages(false);
        }
      })();
    }
  }, [downloadUrl]);

  const handleSplit = async () => {
    if (files.length === 0 || !files[0]) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("mode", splitMode);
      if (splitMode === "range") {
        formData.append("ranges", pageRange);
      }

      const response = await fetch(`${API_BASE_URL}/pdf/split`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Split failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError("Failed to split PDF. Please check the page range and try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolLayout title="PDF Tools" description="PDF processing" tools={pdfTools} categoryIcon={FileText}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Split PDF</h1>
          <p className="text-muted-foreground">Extract pages or split a PDF into multiple files</p>
        </div>

        <FileUpload
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          title="Upload a PDF to split"
          description="PDF files only"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* File info */}
            <div className="p-4 rounded-xl bg-secondary border border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{files[0].name}</p>
                  <p className="text-sm text-muted-foreground">
                    {isFetchingPages
                      ? "Detecting pages..."
                      : totalPages !== null
                      ? `${totalPages} pages`
                      : "Page count unavailable"}
                  </p>
                </div>
              </div>
            </div>

            {/* Split mode */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Split Mode</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSplitMode("pages")}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    splitMode === "pages" ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                  )}
                >
                  <span className="font-medium block">Split All Pages</span>
                  <span className="text-sm text-muted-foreground">Create one PDF per page</span>
                </button>
                <button
                  onClick={() => setSplitMode("range")}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    splitMode === "range" ? "border-foreground bg-secondary" : "border-border hover:border-muted-foreground"
                  )}
                >
                  <span className="font-medium block">Custom Range</span>
                  <span className="text-sm text-muted-foreground">Extract specific pages</span>
                </button>
              </div>
            </div>

            {/* Page range input */}
            {splitMode === "range" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Page Range</label>
                <input
                  type="text"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  placeholder="e.g., 1-3, 5, 7-10"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
                />
                <p className="text-xs text-muted-foreground">Separate ranges with commas. Example: 1-3, 5, 7-10</p>
              </div>
            )}

            {/* Page preview grid */}
            {totalPages !== null && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-muted-foreground">Pages</span>
                <div className="grid grid-cols-6 gap-3">
                  {Array.from({ length: Math.min(totalPages, 12) }).map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-lg bg-secondary border border-border flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleSplit}
                disabled={isProcessing}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Splitting..." : (
                  <>
                    <Split className="h-4 w-4" />
                    Split PDF
                  </>
                )}
              </button>
              {isComplete && downloadUrl && (
                <a
                  href={downloadUrl}
                  download="split.zip"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download ZIP
                </a>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
