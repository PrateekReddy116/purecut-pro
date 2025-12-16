import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ImageIcon, 
  RefreshCcw, 
  Shrink, 
  Crop, 
  RotateCw,
  Droplet,
  ArrowRight
} from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { cn } from "@/lib/utils";

const imageTools: ToolItem[] = [
  { name: "Format Converter", href: "/image-tools/convert", icon: RefreshCcw, description: "Convert image formats" },
  { name: "Image Compressor", href: "/image-tools/compress", icon: Shrink, description: "Reduce file size" },
  { name: "Image Resizer", href: "/image-tools/resize", icon: Crop, description: "Change dimensions" },
  { name: "Rotate & Flip", href: "/image-tools/rotate", icon: RotateCw, description: "Rotate images" },
  { name: "Add Watermark", href: "/image-tools/watermark", icon: Droplet, description: "Add text or image watermarks" },
];

const toolCards = [
  {
    name: "Format Converter",
    description: "Convert between PNG, JPG, WebP, GIF, and more. Batch convert multiple images at once.",
    icon: RefreshCcw,
    href: "/image-tools/convert",
    color: "from-emerald-500/20 to-teal-500/20",
  },
  {
    name: "Image Compressor",
    description: "Reduce image file size without noticeable quality loss. Perfect for web optimization.",
    icon: Shrink,
    href: "/image-tools/compress",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    name: "Image Resizer",
    description: "Resize images to specific dimensions or percentages. Maintain aspect ratio optionally.",
    icon: Crop,
    href: "/image-tools/resize",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    name: "Rotate & Flip",
    description: "Rotate images by any angle. Flip horizontally or vertically with one click.",
    icon: RotateCw,
    href: "/image-tools/rotate",
    color: "from-amber-500/20 to-orange-500/20",
  },
  {
    name: "Add Watermark",
    description: "Protect your images with custom text or image watermarks. Adjustable opacity and position.",
    icon: Droplet,
    href: "/image-tools/watermark",
    color: "from-pink-500/20 to-rose-500/20",
  },
];

export default function ImageToolsIndex() {
  return (
    <ToolLayout
      title="Image Tools"
      description="Process and convert images"
      tools={imageTools}
      categoryIcon={ImageIcon}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Image Tools</h1>
          <p className="text-muted-foreground">
            Complete suite of image processing tools. Convert, compress, resize, and edit your images.
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
