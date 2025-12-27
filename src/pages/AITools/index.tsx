import { Sparkles, Wand2, ZoomIn, Eraser } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { motion } from "framer-motion";
import { SparklesText } from "@/components/ui/sparkles-text";

const aiTools: ToolItem[] = [
  { name: "Background Remover", href: "/ai-tools/background-remover", icon: Wand2, description: "Remove backgrounds from images" },
  { name: "Image Enhancer", href: "/ai-tools/enhancer", icon: Sparkles, description: "Enhance image quality" },
  { name: "Object Remover", href: "/ai-tools/object-remover", icon: Eraser, description: "Remove unwanted objects" },
  { name: "Image Upscaler", href: "/ai-tools/upscaler", icon: ZoomIn, description: "Upscale images with AI" },
];

export default function AIToolsIndex() {
  return (
    <ToolLayout
      title="AI Tools"
      description="AI-powered image processing"
      tools={aiTools}
      categoryIcon={Sparkles}
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
          <SparklesText text="AI Tools" className="mb-6 text-foreground" />
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            This tool has Background Remover, Image Enhancer, Object Remover, and Image Upscaler.
          </p>
        </div>
      </div>
    </ToolLayout>
  );
}
