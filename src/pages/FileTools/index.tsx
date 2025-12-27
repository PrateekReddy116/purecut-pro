import { FolderArchive, FileArchive, FolderOpen } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { motion } from "framer-motion";
import { SparklesText } from "@/components/ui/sparkles-text";

const fileTools: ToolItem[] = [
  { name: "Create Archive", href: "/file-tools/compress", icon: FileArchive, description: "Create ZIP archives" },
  { name: "Extract Files", href: "/file-tools/extract", icon: FolderOpen, description: "Extract archives" },
];

export default function FileToolsIndex() {
  return (
    <ToolLayout
      title="File Tools"
      description="Compress and extract files"
      tools={fileTools}
      categoryIcon={FolderArchive}
    >
      <div className="w-full relative min-h-[60vh]">
        <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-4xl flex flex-col items-center justify-center text-center py-16" style={{ top: '40%', transform: 'translate(-50%, -50%)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-muted-foreground">100% Local Processing</span>
          </motion.div>
          <SparklesText text="File Tools" className="mb-6 text-foreground" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            This tool has Create Archive and Extract Files.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
