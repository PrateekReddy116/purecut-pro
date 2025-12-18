import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Wand2, FileText, ImageIcon, FolderArchive, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const bentoItems = [
  {
    title: "AI Background Remover",
    description: "Remove backgrounds instantly with AI. Perfect for product photos and portraits.",
    icon: Wand2,
    href: "/ai-tools/background-remover",
    className: "md:col-span-2 md:row-span-2",
    featured: true,
  },
  {
    title: "PDF Tools",
    description: "Merge, split, compress PDFs.",
    icon: FileText,
    href: "/pdf-tools",
    className: "",
    featured: false,
  },
  {
    title: "Image Converter",
    description: "Convert PNG, JPG, WebP.",
    icon: ImageIcon,
    href: "/image-tools",
    className: "",
    featured: false,
  },
  {
    title: "File Compression",
    description: "Create ZIP archives.",
    icon: FolderArchive,
    href: "/file-tools",
    className: "md:col-span-2",
    featured: false,
  },
];

export function BentoGrid() {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
            Powerful tools at your fingertips
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Everything you need to process documents and images.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {bentoItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={cn(item.className)}
            >
              <Link
                to={item.href}
                className={cn(
                  "group flex flex-col p-5 rounded-2xl bg-background border border-border h-full",
                  "hover:border-foreground/20 transition-colors",
                  item.featured ? "min-h-[280px]" : "min-h-[140px]"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "rounded-lg bg-secondary flex items-center justify-center",
                      item.featured ? "w-10 h-10" : "w-8 h-8"
                    )}
                  >
                    <item.icon className={cn(item.featured ? "h-4 w-4" : "h-3.5 w-3.5")} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="mt-auto">
                  <h3 className={cn("font-medium mb-1", item.featured ? "text-lg" : "text-sm")}>
                    {item.title}
                  </h3>
                  <p className={cn("text-muted-foreground", item.featured ? "text-sm" : "text-xs")}>
                    {item.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
