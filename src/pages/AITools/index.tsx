import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Wand2, ZoomIn, Eraser, ArrowRight } from "lucide-react";
import { ToolLayout, ToolItem } from "@/components/ToolLayout";
import { cn } from "@/lib/utils";

const aiTools: ToolItem[] = [
  { name: "Background Remover", href: "/ai-tools/background-remover", icon: Wand2, description: "Remove backgrounds from images" },
  { name: "Image Enhancer", href: "/ai-tools/enhancer", icon: Sparkles, description: "Enhance image quality" },
  { name: "Object Remover", href: "/ai-tools/object-remover", icon: Eraser, description: "Remove unwanted objects" },
  { name: "Image Upscaler", href: "/ai-tools/upscaler", icon: ZoomIn, description: "Upscale images with AI" },
];

const toolCards = [
  {
    name: "Background Remover",
    description: "Instantly remove backgrounds from any image with AI precision. Perfect for product photos, portraits, and more.",
    icon: Wand2,
    href: "/ai-tools/background-remover",
    color: "from-primary/20 to-accent/20",
  },
  {
    name: "Image Enhancer",
    description: "Enhance image quality, adjust colors, and improve clarity with advanced AI algorithms.",
    icon: Sparkles,
    href: "/ai-tools/enhancer",
    color: "from-violet-500/20 to-purple-500/20",
  },
  {
    name: "Object Remover",
    description: "Remove unwanted objects, people, or imperfections from your images seamlessly.",
    icon: Eraser,
    href: "/ai-tools/object-remover",
    color: "from-rose-500/20 to-pink-500/20",
  },
  {
    name: "Image Upscaler",
    description: "Upscale images up to 4x without losing quality using state-of-the-art AI models.",
    icon: ZoomIn,
    href: "/ai-tools/upscaler",
    color: "from-emerald-500/20 to-teal-500/20",
  },
];

export default function AIToolsIndex() {
  return (
    <ToolLayout
      title="AI Tools"
      description="AI-powered image processing"
      tools={aiTools}
      categoryIcon={Sparkles}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">AI Tools</h1>
          <p className="text-muted-foreground">
            Powerful AI-powered tools for image processing. All processing happens locally in your browser.
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
                <h3 className="text-xl font-display font-bold mb-2">{tool.name}</h3>
                <p className="text-muted-foreground mb-4">{tool.description}</p>
                <div className="flex items-center gap-2 text-primary font-medium">
                  <span>Try it now</span>
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
