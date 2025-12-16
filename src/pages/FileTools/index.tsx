import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FolderArchive, 
  FileArchive, 
  FolderOpen, 
  ArrowRight
} from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { cn } from "@/lib/utils";

const fileTools: ToolItem[] = [
  { name: "Create Archive", href: "/file-tools/compress", icon: FileArchive, description: "Create ZIP archives" },
  { name: "Extract Files", href: "/file-tools/extract", icon: FolderOpen, description: "Extract archives" },
];

const toolCards = [
  {
    name: "Create Archive",
    description: "Create ZIP archives from multiple files. Compress your files for easy sharing and storage.",
    icon: FileArchive,
    href: "/file-tools/compress",
    color: "from-blue-500/20 to-indigo-500/20",
  },
  {
    name: "Extract Files",
    description: "Extract files from ZIP, RAR, and other archive formats. View contents before extracting.",
    icon: FolderOpen,
    href: "/file-tools/extract",
    color: "from-emerald-500/20 to-teal-500/20",
  },
];

export default function FileToolsIndex() {
  return (
    <ToolLayout
      title="File Tools"
      description="Compress and extract files"
      tools={fileTools}
      categoryIcon={FolderArchive}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">File Tools</h1>
          <p className="text-muted-foreground">
            Create and extract archives. Compress files for easy sharing and storage.
          </p>
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {toolCards.map((tool, index) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={tool.href}
                className={cn(
                  "group block p-8 rounded-2xl h-full",
                  "border border-border/50 hover:border-primary/50",
                  "bg-gradient-to-br",
                  tool.color,
                  "transition-all duration-300 hover:-translate-y-1",
                  "hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                )}
              >
                <div className="w-14 h-14 rounded-xl bg-card/80 backdrop-blur-sm flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <tool.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-display font-bold mb-2">{tool.name}</h3>
                <p className="text-muted-foreground mb-4">{tool.description}</p>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span>Get started</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Info section */}
        <div className="mt-12 p-6 rounded-2xl glass">
          <h3 className="font-display font-bold text-lg mb-4">Supported Formats</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["ZIP", "RAR", "7Z", "TAR.GZ"].map((format) => (
              <div
                key={format}
                className="p-3 rounded-xl bg-secondary/50 text-center"
              >
                <span className="font-mono font-bold">{format}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
