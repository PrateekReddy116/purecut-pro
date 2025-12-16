import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Wand2, 
  FileText, 
  ImageIcon, 
  FolderArchive,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const bentoItems = [
  {
    title: "AI Background Remover",
    description: "Remove backgrounds from images instantly with AI. Perfect for product photos, portraits, and more.",
    icon: Wand2,
    href: "/ai-tools/background-remover",
    className: "md:col-span-2 md:row-span-2",
    gradient: "from-primary/20 to-accent/20",
    featured: true,
  },
  {
    title: "PDF Tools",
    description: "Merge, split, compress and convert PDFs with ease.",
    icon: FileText,
    href: "/pdf-tools",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-rose-500/20 to-orange-500/20",
    featured: false,
  },
  {
    title: "Image Converter",
    description: "Convert between PNG, JPG, WebP and more formats.",
    icon: ImageIcon,
    href: "/image-tools",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-emerald-500/20 to-teal-500/20",
    featured: false,
  },
  {
    title: "File Compression",
    description: "Create and extract ZIP archives. Compress files without losing quality.",
    icon: FolderArchive,
    href: "/file-tools",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-blue-500/20 to-indigo-500/20",
    featured: false,
  },
  {
    title: "AI Image Enhancer",
    description: "Upscale and enhance images using advanced AI models.",
    icon: Sparkles,
    href: "/ai-tools",
    className: "md:col-span-1 md:row-span-1",
    gradient: "from-violet-500/20 to-purple-500/20",
    featured: false,
  },
];

export function BentoGrid() {
  return (
    <section className="py-24 relative">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Powerful Tools at Your <span className="text-gradient">Fingertips</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to process documents and images, all in one place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
          {bentoItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cn(item.className)}
            >
              <Link
                to={item.href}
                className={cn(
                  "group relative h-full flex flex-col p-6 rounded-2xl overflow-hidden",
                  "border border-border/50 hover:border-primary/50",
                  "bg-gradient-to-br",
                  item.gradient,
                  "transition-all duration-500 hover:-translate-y-1",
                  "hover:shadow-[0_0_40px_hsl(var(--primary)/0.2)]"
                )}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-card/80 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>

                  <h3 className={cn(
                    "font-display font-bold mb-2",
                    item.featured ? "text-2xl sm:text-3xl" : "text-xl"
                  )}>
                    {item.title}
                  </h3>

                  <p className={cn(
                    "text-muted-foreground flex-1",
                    item.featured ? "text-base" : "text-sm"
                  )}>
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-primary font-medium">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>

                {/* Decorative elements for featured card */}
                {item.featured && (
                  <>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl" />
                  </>
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
