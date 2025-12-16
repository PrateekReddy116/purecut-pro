import { motion } from "framer-motion";
import {
  FileImage,
  FileText,
  Image,
  Archive,
  Wand2,
  FileSpreadsheet,
  FileType,
  Layers,
} from "lucide-react";

const tools = [
  { name: "PNG", icon: FileImage },
  { name: "PDF", icon: FileText },
  { name: "JPG", icon: Image },
  { name: "ZIP", icon: Archive },
  { name: "WebP", icon: FileImage },
  { name: "DOCX", icon: FileType },
  { name: "XLSX", icon: FileSpreadsheet },
  { name: "AI", icon: Wand2 },
  { name: "SVG", icon: Layers },
];

export function LogoCarousel() {
  const duplicatedTools = [...tools, ...tools];

  return (
    <section className="py-16 border-y border-border overflow-hidden">
      <div className="container px-6 mb-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-xs text-muted-foreground uppercase tracking-widest"
        >
          Supports all major formats
        </motion.p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: [0, "-50%"] }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex gap-10 w-fit"
        >
          {duplicatedTools.map((tool, index) => (
            <div key={index} className="flex items-center gap-2 shrink-0">
              <tool.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{tool.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
