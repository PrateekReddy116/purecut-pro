import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Scissors, 
  FileText, 
  Image, 
  FolderArchive,
  Sparkles,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", path: "/", icon: null },
  { name: "AI Tools", path: "/ai-tools", icon: Sparkles },
  { name: "PDF Tools", path: "/pdf-tools", icon: FileText },
  { name: "Image Tools", path: "/image-tools", icon: Image },
  { name: "File Tools", path: "/file-tools", icon: FolderArchive },
];

export function Navbar() {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        isScrolled ? "top-2" : "top-4"
      )}
    >
      <nav
        className={cn(
          "relative flex items-center gap-1 px-2 py-2 rounded-full glass-strong",
          "shadow-lg shadow-background/50"
        )}
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 mr-2"
        >
          <div className="relative">
            <Scissors className="h-6 w-6 text-primary" />
            <div className="absolute inset-0 blur-md bg-primary/40" />
          </div>
          <span className="font-display font-bold text-lg hidden sm:block">
            PureCut<span className="text-primary">Pro</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative px-4 py-2 rounded-full text-sm font-medium transition-colors"
              >
                {active && (
                  <motion.div
                    layoutId="tubelight"
                    className="absolute inset-0 rounded-full bg-primary/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  >
                    {/* Tubelight glow effect */}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary blur-sm" />
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                  </motion.div>
                )}
                <span
                  className={cn(
                    "relative z-10 flex items-center gap-2 transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* CTA Button */}
        <Link
          to="/ai-tools/background-remover"
          className={cn(
            "hidden sm:flex items-center gap-2 px-4 py-2 rounded-full ml-2",
            "bg-primary text-primary-foreground font-medium text-sm",
            "hover:opacity-90 transition-opacity",
            "shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Try Free
        </Link>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden absolute top-full left-0 right-0 mt-2 p-4 glass-strong rounded-2xl"
        >
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  {item.name}
                </Link>
              );
            })}
            <Link
              to="/ai-tools/background-remover"
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-3 rounded-xl mt-2",
                "bg-primary text-primary-foreground font-medium",
                "shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
              )}
            >
              <Sparkles className="h-5 w-5" />
              Try Free
            </Link>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
