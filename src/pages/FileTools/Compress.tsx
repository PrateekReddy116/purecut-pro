import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FolderArchive, FileArchive, FolderOpen, Download, Trash2 } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const fileTools: ToolItem[] = [
  { name: "Create Archive", href: "/file-tools/compress", icon: FileArchive },
  { name: "Extract Files", href: "/file-tools/extract", icon: FolderOpen },
];

export default function CreateArchive() {
  const [files, setFiles] = useState<File[]>([]);
  const [archiveName, setArchiveName] = useState("archive");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsComplete(false);
  }, []);

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <ToolLayout title="File Tools" description="File operations" tools={fileTools} categoryIcon={FolderArchive}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Create Archive</h1>
          <p className="text-muted-foreground">Compress files into a ZIP archive</p>
        </div>

        <FileUpload
          accept={{ "*/*": [] }}
          maxFiles={100}
          onFilesSelected={handleFilesSelected}
          title="Drop files here"
          description="Any file type"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* Archive name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Archive Name</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={archiveName}
                  onChange={(e) => setArchiveName(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
                />
                <span className="text-muted-foreground">.zip</span>
              </div>
            </div>

            {/* File list */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Files ({files.length})</span>
                <span className="text-sm text-muted-foreground">Total: {formatSize(totalSize)}</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-secondary border border-border">
                    <FileArchive className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="p-2 rounded-lg hover:bg-background transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={isProcessing || files.length === 0}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Creating..." : (
                  <>
                    <FileArchive className="h-4 w-4" />
                    Create ZIP
                  </>
                )}
              </button>
              {isComplete && (
                <button className="flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium bg-secondary hover:bg-muted transition-colors">
                  <Download className="h-4 w-4" />
                  Download {archiveName}.zip
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
