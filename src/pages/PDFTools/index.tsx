import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FileText, 
  Combine, 
  Split, 
  ImageIcon, 
  FileImage,
  Lock,
  Unlock,
  FileDown,
  ArrowRight
} from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { cn } from "@/lib/utils";

const pdfTools: ToolItem[] = [
  { name: "Merge PDFs", href: "/pdf-tools/merge", icon: Combine, description: "Combine multiple PDFs" },
  { name: "Split PDF", href: "/pdf-tools/split", icon: Split, description: "Split PDF into pages" },
  { name: "PDF to Images", href: "/pdf-tools/to-images", icon: ImageIcon, description: "Convert PDF to images" },
  { name: "Images to PDF", href: "/pdf-tools/from-images", icon: FileImage, description: "Create PDF from images" },
  { name: "Compress PDF", href: "/pdf-tools/compress", icon: FileDown, description: "Reduce PDF file size" },
  { name: "Protect PDF", href: "/pdf-tools/protect", icon: Lock, description: "Add password protection" },
  { name: "Unlock PDF", href: "/pdf-tools/unlock", icon: Unlock, description: "Remove password protection" },
];

const toolCards = [
  {
    name: "Merge PDFs",
    description: "Combine multiple PDF files into a single document. Drag and drop to reorder pages.",
    icon: Combine,
    href: "/pdf-tools/merge",
    color: "from-rose-500/20 to-orange-500/20",
  },
  {
    name: "Split PDF",
    description: "Split a PDF into separate files by page ranges or extract individual pages.",
    icon: Split,
    href: "/pdf-tools/split",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "PDF to Images",
    description: "Convert PDF pages to high-quality PNG or JPG images.",
    icon: ImageIcon,
    href: "/pdf-tools/to-images",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    name: "Images to PDF",
    description: "Create a PDF from multiple images. Supports PNG, JPG, and more.",
    icon: FileImage,
    href: "/pdf-tools/from-images",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    name: "Compress PDF",
    description: "Reduce PDF file size without losing quality. Perfect for email attachments.",
    icon: FileDown,
    href: "/pdf-tools/compress",
    color: "from-amber-500/20 to-yellow-500/20",
  },
  {
    name: "Protect PDF",
    description: "Add password protection to your PDF files for secure sharing.",
    icon: Lock,
    href: "/pdf-tools/protect",
    color: "from-pink-500/20 to-rose-500/20",
  },
];

export default function PDFToolsIndex() {
  return (
    <ToolLayout
      title="PDF Tools"
      description="All-in-one PDF processing"
      tools={pdfTools}
      categoryIcon={FileText}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">PDF Tools</h1>
          <p className="text-muted-foreground">
            Complete suite of PDF tools. Merge, split, convert, and protect your PDFs with ease.
          </p>
        </div>

        {/* Tool grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  "group block p-6 rounded-2xl h-full",
                  "border border-border/50 hover:border-primary/50",
                  "bg-gradient-to-br",
                  tool.color,
                  "transition-all duration-300 hover:-translate-y-1",
                  "hover:shadow-[0_0_30px_hsl(var(--primary)/0.2)]"
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-card/80 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <tool.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-bold mb-2">{tool.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>
                <div className="flex items-center gap-2 text-primary font-medium text-sm">
                  <span>Start now</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}
