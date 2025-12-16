import { motion } from "framer-motion";
import { 
  FileImage, 
  FileText, 
  Image, 
  Archive, 
  Wand2, 
  FileSpreadsheet,
  FileType,
  Layers
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
  // Double the items for seamless loop
  const duplicatedTools = [...tools, ...tools];

  return (
    <section className="py-16 overflow-hidden">
      <div className="container px-4 mx-auto mb-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-muted-foreground text-lg"
        >
          Supports all major file formats
        </motion.p>
      </div>

      <div className="relative">
        {/* Gradient masks */}
        <div className="absolute left-0 top-0 bottom-0 w-40 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-40 bg-gradient-to-l from-background to-transparent z-10" />

        {/* Scrolling container */}
        <motion.div
          animate={{ x: [0, "-50%"] }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="flex gap-8 w-fit"
        >
          {duplicatedTools.map((tool, index) => (
            <div
              key={index}
              className="flex items-center gap-3 px-6 py-4 rounded-xl glass hover:bg-secondary/50 transition-colors cursor-default shrink-0"
            >
              <tool.icon className="h-8 w-8 text-primary" />
              <span className="text-lg font-medium text-foreground">{tool.name}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
