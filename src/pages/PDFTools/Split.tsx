import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock, FileDown, Download } from "lucide-react";
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

export default function PDFSplit() {
  const [files, setFiles] = useState<File[]>([]);
  const [splitMode, setSplitMode] = useState<"pages" | "range">("pages");
  const [pageRange, setPageRange] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const totalPages = 12; // Simulated

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
  }, []);

  const handleSplit = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
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
                  <p className="text-sm text-muted-foreground">{totalPages} pages</p>
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
