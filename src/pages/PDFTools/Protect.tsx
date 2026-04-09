import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock, Download, Eye, EyeOff } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { FileUpload } from "@/components/FileUpload";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/config/api";

const pdfTools: ToolItem[] = [
  { name: "Merge PDFs", href: "/pdf-tools/merge", icon: Combine },
  { name: "Split PDF", href: "/pdf-tools/split", icon: Split },
  { name: "PDF to Images", href: "/pdf-tools/to-images", icon: ImageIcon },
  { name: "Images to PDF", href: "/pdf-tools/from-images", icon: FileImage },
  { name: "Protect PDF", href: "/pdf-tools/protect", icon: Lock },
  { name: "Unlock PDF", href: "/pdf-tools/unlock", icon: Unlock },
];

export default function PDFProtect() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [permissions, setPermissions] = useState({
    print: true,
    copy: false,
    edit: false,
  });
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

  const handleProtect = async () => {
    if (files.length === 0 || !files[0]) return;
    if (password !== confirmPassword || !password) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("password", password);
      formData.append("allow_print", String(permissions.print));
      formData.append("allow_copy", String(permissions.copy));
      formData.append("allow_edit", String(permissions.edit));

      const response = await fetch(`${API_BASE_URL}/pdf/protect`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let msg = `Protect failed (${response.status})`;
        try {
          const errBody = await response.json();
          if (typeof errBody?.detail === "string") msg = errBody.detail;
          else if (Array.isArray(errBody?.detail)) msg = errBody.detail.map((x: { msg?: string }) => x?.msg).filter(Boolean).join("; ") || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setIsComplete(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to protect PDF. Please try again.");
      setIsComplete(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const passwordsMatch = password === confirmPassword && password.length > 0;

  return (
    <ToolLayout title="PDF Tools" description="PDF processing" tools={pdfTools} categoryIcon={FileText}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Protect PDF</h1>
          <p className="text-muted-foreground">Add password protection to your PDF</p>
        </div>

        <FileUpload
          accept={{ "application/pdf": [".pdf"] }}
          maxFiles={1}
          onFilesSelected={handleFilesSelected}
          title="Upload a PDF to protect"
          description="PDF files only"
        />

        {files.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-6">
            {/* Password inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border bg-background focus:outline-none transition-colors",
                    confirmPassword && !passwordsMatch ? "border-red-500" : "border-border focus:border-foreground"
                  )}
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-red-500">Passwords don't match</p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <span className="text-sm font-medium text-muted-foreground">Permissions</span>
              <div className="space-y-2">
                {[
                  { key: "print", label: "Allow printing" },
                  { key: "copy", label: "Allow copying text" },
                  { key: "edit", label: "Allow editing" },
                ].map((perm) => (
                  <label key={perm.key} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-secondary transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions[perm.key as keyof typeof permissions]}
                      onChange={(e) => setPermissions({ ...permissions, [perm.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-border accent-foreground"
                    />
                    <span className="font-medium">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleProtect}
                disabled={isProcessing || !passwordsMatch}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium transition-all",
                  "bg-foreground text-background hover:opacity-90",
                  "disabled:opacity-50"
                )}
              >
                {isProcessing ? "Protecting..." : (
                  <>
                    <Lock className="h-4 w-4" />
                    Protect PDF
                  </>
                )}
              </button>
              {isComplete && downloadUrl && (
                <a
                  href={downloadUrl}
                  download="protected.pdf"
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
