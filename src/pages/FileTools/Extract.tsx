import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FolderArchive, FileArchive, FolderOpen, Download, File, Folder } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const fileTools: ToolItem[] = [
  { name: "Create Archive", href: "/file-tools/compress", icon: FileArchive },
  { name: "Extract Files", href: "/file-tools/extract", icon: FolderOpen },
];

// Simulated archive contents
const mockContents = [
  { name: "documents", type: "folder", size: 0 },
  { name: "images", type: "folder", size: 0 },
  { name: "report.pdf", type: "file", size: 2456789 },
  { name: "data.xlsx", type: "file", size: 1234567 },
  { name: "readme.txt", type: "file", size: 4567 },
  { name: "photo.jpg", type: "file", size: 3456789 },
];

export default function ExtractFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showContents, setShowContents] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
    setShowContents(false);
  }, []);

  const handlePreview = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsProcessing(false);
    setShowContents(true);
  };

  const handleExtract = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "-";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <ToolLayout title="File Tools" description="File operations" tools={fileTools} categoryIcon={FolderArchive}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Extract Files</h1>
          <p className="text-muted-foreground">Extract files from ZIP, RAR, 7Z, and other archives</p>
        </div>

        <FileUpload
          accept={{ "application/zip": [".zip"], "application/x-rar-compressed": [".rar"], "application/x-7z-compressed": [".7z"] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          title="Upload an archive"
          description="ZIP, RAR, 7Z files"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* Archive info */}
            <div className="p-4 rounded-xl bg-secondary border border-border flex items-center gap-3">
              <FileArchive className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{files[0].name}</p>
                <p className="text-sm text-muted-foreground">{formatSize(files[0].size)}</p>
              </div>
            </div>

            {/* Preview button */}
            {!showContents && (
              <button
                onClick={handlePreview}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-border hover:bg-secondary transition-colors"
              >
                {isProcessing ? "Loading..." : "Preview Contents"}
              </button>
            )}

            {/* Archive contents */}
            {showContents && (
              <div className="space-y-3">
                <span className="text-sm font-medium text-muted-foreground">Archive Contents</span>
                <div className="border border-border rounded-xl overflow-hidden">
                  {mockContents.map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-3",
                        index !== mockContents.length - 1 && "border-b border-border"
                      )}
                    >
                      {item.type === "folder" ? (
                        <Folder className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <File className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className="flex-1 text-sm font-medium">{item.name}</span>
                      <span className="text-sm text-muted-foreground">{formatSize(item.size)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleExtract}
                disabled={isProcessing}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Extracting..." : (
                  <>
                    <FolderOpen className="h-4 w-4" />
                    Extract All
                  </>
                )}
              </button>
              {isComplete && (
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors">
                  <Download className="h-4 w-4" />
                  Download Files
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
