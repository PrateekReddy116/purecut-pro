import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { FolderArchive, FileArchive, FolderOpen, Download, File, Folder } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";

const fileTools: ToolItem[] = [
  { name: "Create Archive", href: "/file-tools/compress", icon: FileArchive },
  { name: "Extract Files", href: "/file-tools/extract", icon: FolderOpen },
];

type ZipEntry = {
  path: string;
  displayName: string;
  size: number;
  isDir: boolean;
  sizeUnknown: boolean;
};

function isSafeZipPath(name: string): boolean {
  if (!name) return false;
  if (name.endsWith("/")) return true;
  const norm = name.replace(/\\/g, "/").trim();
  if (norm.startsWith("/")) return false;
  const parts = norm.split("/").filter(Boolean);
  return !parts.includes("..");
}

function basenameFromPath(p: string): string {
  const n = p.replace(/\\/g, "/").split("/").filter(Boolean).pop();
  return n || "file";
}

function readUncompressedSize(obj: JSZip.JSZipObject): number | null {
  if (obj.dir) return 0;
  const internal = obj as unknown as { _data?: { uncompressedSize?: number } };
  const s = internal._data?.uncompressedSize;
  return typeof s === "number" && s >= 0 ? s : null;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ExtractFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showContents, setShowContents] = useState(false);
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [unsafeSkipped, setUnsafeSkipped] = useState(false);
  const zipRef = useRef<JSZip | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setShowContents(false);
    setEntries([]);
    setListError(null);
    setActionError(null);
    setUnsafeSkipped(false);
    zipRef.current = null;
  }, []);

  const handlePreview = async () => {
    if (files.length === 0 || !files[0]) return;

    setIsProcessing(true);
    setListError(null);
    setActionError(null);
    setUnsafeSkipped(false);
    zipRef.current = null;

    try {
      const buf = await files[0].arrayBuffer();
      const zip = await JSZip.loadAsync(buf);
      zipRef.current = zip;

      const list: ZipEntry[] = [];
      let skippedUnsafe = false;

      zip.forEach((relativePath, file) => {
        if (!isSafeZipPath(relativePath)) {
          skippedUnsafe = true;
          return;
        }
        const display = relativePath.replace(/\/$/, "");
        const size = readUncompressedSize(file);
        list.push({
          path: relativePath,
          displayName: display,
          size: size ?? 0,
          isDir: file.dir,
          sizeUnknown: !file.dir && size === null,
        });
      });

      list.sort((a, b) => a.displayName.localeCompare(b.displayName, undefined, { sensitivity: "base" }));
      setEntries(list);
      setUnsafeSkipped(skippedUnsafe);
      setShowContents(true);
    } catch (e) {
      console.error(e);
      setListError("Could not open this ZIP. The file may be corrupt or not a valid archive.");
      setShowContents(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadOne = async (path: string, suggestedName?: string) => {
    const zip = zipRef.current;
    if (!zip) return;
    const obj = zip.file(path);
    if (!obj || obj.dir) return;

    setActionError(null);
    try {
      const blob = await obj.async("blob");
      const name = suggestedName ?? basenameFromPath(path);
      triggerBlobDownload(blob, name);
    } catch (e) {
      console.error(e);
      setActionError("Could not read that file from the archive.");
    }
  };

  const downloadAllFiles = async () => {
    const zip = zipRef.current;
    if (!zip) return;

    const fileEntries = entries.filter((e) => !e.isDir && isSafeZipPath(e.path));
    if (fileEntries.length === 0) return;

    setIsProcessing(true);
    setActionError(null);

    const baseName = files[0]?.name?.replace(/\.zip$/i, "") || "extracted";

    try {
      const outZip = new JSZip();
      for (const entry of fileEntries) {
        const obj = zip.file(entry.path);
        if (!obj || obj.dir) continue;
        const rawPath = entry.path.replace(/^\/+/, "");
        const data = await obj.async("uint8Array");
        outZip.file(rawPath, data);
      }
      const blob = await outZip.generateAsync({ type: "blob", compression: "DEFLATE" });
      triggerBlobDownload(blob, `${baseName}_files.zip`);
    } catch (e) {
      console.error(e);
      setActionError("Could not build the download ZIP. Try downloading files one at a time.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number, unknown: boolean) => {
    if (unknown) return "—";
    if (bytes === 0 && !unknown) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const fileRows = entries.filter((e) => !e.isDir);
  const fileCount = fileRows.length;

  return (
    <ToolLayout title="File Tools" description="File operations" tools={fileTools} categoryIcon={FolderArchive}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Extract Files</h1>
          <p className="text-muted-foreground">Open a ZIP in your browser; download all repacks entries into one ZIP, or grab files individually.</p>
        </div>

        <FileUpload
          accept={{ "application/zip": [".zip"], "application/x-zip-compressed": [".zip"] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          title="Upload a ZIP archive"
          description=".zip — unpacked locally in your browser"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            <div className="p-4 rounded-xl bg-secondary border border-border flex items-center gap-3">
              <FileArchive className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{files[0].name}</p>
                <p className="text-sm text-muted-foreground">
                  {(files[0].size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            {!showContents && (
              <button
                type="button"
                onClick={handlePreview}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium border border-border hover:bg-secondary transition-colors"
              >
                {isProcessing ? "Loading..." : "Show contents"}
              </button>
            )}
            {listError && <p className="text-sm text-destructive text-center">{listError}</p>}
            {unsafeSkipped && showContents && (
              <p className="text-sm text-amber-600 dark:text-amber-500 text-center">
                Some entries were skipped because their paths were not safe to extract.
              </p>
            )}

            {showContents && entries.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Contents</span>
                  {fileCount > 0 && (
                    <button
                      type="button"
                      onClick={downloadAllFiles}
                      disabled={isProcessing}
                      className={cn(
                        "inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
                        "border border-border bg-background hover:bg-secondary transition-colors",
                        "disabled:opacity-50"
                      )}
                    >
                      <Download className="h-4 w-4" />
                      {isProcessing ? "Building ZIP…" : `Download all as ZIP (${fileCount})`}
                    </button>
                  )}
                </div>
                <div className="border border-border rounded-xl overflow-hidden max-h-[28rem] overflow-y-auto">
                  {entries.map((item, index) => (
                      <div
                        key={`${item.path}-${index}`}
                        className={cn(
                          "flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-3",
                          index !== entries.length - 1 && "border-b border-border"
                        )}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          {item.isDir ? (
                            <Folder className="h-5 w-5 shrink-0 text-muted-foreground" />
                          ) : (
                            <File className="h-5 w-5 shrink-0 text-muted-foreground" />
                          )}
                          <span className="truncate text-sm font-medium" title={item.displayName}>
                            {item.displayName}
                          </span>
                        </div>
                        <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-end">
                          <span className="w-16 text-right text-sm text-muted-foreground tabular-nums">
                            {item.isDir ? "—" : formatSize(item.size, item.sizeUnknown)}
                          </span>
                          {!item.isDir && (
                            <button
                              type="button"
                              onClick={() => downloadOne(item.path)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
            {showContents && entries.length === 0 && !listError && (
              <p className="text-center text-sm text-muted-foreground">This archive has no entries to show.</p>
            )}
            {actionError && <p className="text-sm text-destructive text-center">{actionError}</p>}
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
}
