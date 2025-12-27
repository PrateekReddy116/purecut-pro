import { ImageIcon, RefreshCcw, Shrink, Crop, RotateCw, Droplet } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { motion } from "framer-motion";
import { SparklesText } from "@/components/ui/sparkles-text";

const imageTools: ToolItem[] = [
  { name: "Format Converter", href: "/image-tools/convert", icon: RefreshCcw, description: "Convert image formats" },
  { name: "Image Compressor", href: "/image-tools/compress", icon: Shrink, description: "Reduce file size" },
  { name: "Image Resizer", href: "/image-tools/resize", icon: Crop, description: "Change dimensions" },
  { name: "Rotate & Flip", href: "/image-tools/rotate", icon: RotateCw, description: "Rotate images" },
  { name: "Add Watermark", href: "/image-tools/watermark", icon: Droplet, description: "Add text or image watermarks" },
];

export default function ImageToolsIndex() {
  return (
    <ToolLayout
      title="Image Tools"
      description="Process and convert images"
      tools={imageTools}
      categoryIcon={ImageIcon}
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
          <SparklesText text="Image Tools" className="mb-6 text-foreground" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            This tool has Format Converter, Image Compressor, Image Resizer, Rotate & Flip, and Add Watermark.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
