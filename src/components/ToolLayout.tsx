import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export interface ToolItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface ToolLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  tools: ToolItem[];
  categoryIcon: React.ComponentType<{ className?: string }>;
}

export function ToolLayout({
  children,
  title,
  description,
  tools,
  categoryIcon: CategoryIcon,
}: ToolLayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex pt-24">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: 280 }}
          animate={{ width: sidebarCollapsed ? 80 : 280 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed left-0 top-24 bottom-0 z-40 border-r border-border/50 bg-sidebar overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CategoryIcon className="h-5 w-5 text-primary" />
                </div>
                {!sidebarCollapsed && (
                  <div className="overflow-hidden">
                    <h2 className="font-display font-bold text-lg truncate">{title}</h2>
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-1">
                {tools.map((tool) => {
                  const isActive = location.pathname === tool.href;
                  const Icon = tool.icon;
                  
                  return (
                    <li key={tool.href}>
                      <Link
                        to={tool.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                          "hover:bg-sidebar-accent",
                          isActive && "bg-primary/10 text-primary"
                        )}
                      >
                        <Icon className={cn(
                          "h-5 w-5 shrink-0",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                        {!sidebarCollapsed && (
                          <span className={cn(
                            "text-sm font-medium truncate",
                            isActive ? "text-primary" : "text-foreground"
                          )}>
                            {tool.name}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Collapse button */}
            <div className="p-3 border-t border-border/50">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-sm"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <>
                    <ChevronLeft className="h-4 w-4" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main content */}
        <main
          className={cn(
            "flex-1 transition-all duration-300",
            sidebarCollapsed ? "ml-20" : "ml-[280px]"
          )}
        >
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
