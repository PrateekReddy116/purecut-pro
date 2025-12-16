import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navbar } from "./Navbar";

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
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex pt-14">
        {/* Sidebar */}
        <motion.aside
          initial={{ width: 240 }}
          animate={{ width: sidebarCollapsed ? 64 : 240 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="fixed left-0 top-14 bottom-0 z-40 border-r border-border bg-background overflow-hidden"
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <CategoryIcon className="h-4 w-4" />
                </div>
                {!sidebarCollapsed && (
                  <div className="overflow-hidden">
                    <h2 className="font-medium text-sm truncate">{title}</h2>
                    <p className="text-xs text-muted-foreground truncate">{description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
              <ul className="space-y-0.5">
                {tools.map((tool) => {
                  const isActive = location.pathname === tool.href;
                  const Icon = tool.icon;

                  return (
                    <li key={tool.href}>
                      <Link
                        to={tool.href}
                        className={cn(
                          "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-secondary text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed && <span className="truncate">{tool.name}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Collapse button */}
            <div className="p-2 border-t border-border">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg hover:bg-secondary transition-colors text-xs text-muted-foreground"
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
            "flex-1 transition-all duration-200",
            sidebarCollapsed ? "ml-16" : "ml-60"
          )}
        >
          <div className="p-6 max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
