import { FileText, Combine, Split, ImageIcon, FileImage, Lock, Unlock } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { motion } from "framer-motion";
import { SparklesText } from "@/components/ui/sparkles-text";

const pdfTools: ToolItem[] = [
  { name: "Merge PDFs", href: "/pdf-tools/merge", icon: Combine, description: "Combine multiple PDFs" },
  { name: "Split PDF", href: "/pdf-tools/split", icon: Split, description: "Split PDF into pages" },
  { name: "PDF to Images", href: "/pdf-tools/to-images", icon: ImageIcon, description: "Convert PDF to images" },
  { name: "Images to PDF", href: "/pdf-tools/from-images", icon: FileImage, description: "Create PDF from images" },
  { name: "Protect PDF", href: "/pdf-tools/protect", icon: Lock, description: "Add password protection" },
  { name: "Unlock PDF", href: "/pdf-tools/unlock", icon: Unlock, description: "Remove password protection" },
];

export default function PDFToolsIndex() {
  return (
    <ToolLayout
      title="PDF Tools"
      description="All-in-one PDF processing"
      tools={pdfTools}
      categoryIcon={FileText}
    >
      <div className="w-full relative min-h-[60vh]">
        <div className="fixed left-1/2 -translate-x-1/2 w-full max-w-4xl flex flex-col items-center justify-center text-center py-16" style={{ top: '50%', transform: 'translate(-50%, -50%)' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-muted-foreground">100% Local Processing</span>
          </motion.div>
          <SparklesText text="PDF Tools" className="mb-6 text-foreground" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            This tool has Merge PDFs, Split PDF, PDF to Images, Images to PDF, Protect PDF, and Unlock PDF.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
