import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

function FloatingShape({
  className,
  delay = 0,
  gradient,
}: {
  className?: string;
  delay?: number;
  gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1, delay, ease: "easeOut" }}
      className={cn("absolute rounded-full blur-3xl", className)}
      style={{
        background: gradient,
      }}
    />
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-grid-pattern bg-grid-size opacity-30"
        style={{
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 20%, transparent 70%)",
        }}
      />
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background effects */}
      <GridBackground />
      
      {/* Floating shapes */}
      <FloatingShape
        className="w-[600px] h-[600px] -top-40 -left-40 opacity-20"
        gradient="radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)"
        delay={0}
      />
      <FloatingShape
        className="w-[500px] h-[500px] top-1/4 -right-20 opacity-15"
        gradient="radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)"
        delay={0.2}
      />
      <FloatingShape
        className="w-[400px] h-[400px] bottom-20 left-1/4 opacity-10"
        gradient="radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)"
        delay={0.4}
      />

      {/* Animated geometric shapes */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute top-1/3 right-1/4 w-20 h-20 border border-primary/20 rounded-xl"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-1/3 left-1/4 w-16 h-16 border border-accent/20 rounded-full"
      />

      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm text-muted-foreground">
              100% Local Processing • Privacy First
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight mb-6"
          >
            <span className="block">All-in-One</span>
            <span className="block text-gradient-animated">
              Document & Image
            </span>
            <span className="block">Processing Suite</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            AI background removal, PDF operations, image conversion & compression.
            All processing happens locally in your browser for maximum privacy.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/ai-tools/background-remover"
              className={cn(
                "group flex items-center gap-2 px-8 py-4 rounded-full",
                "bg-primary text-primary-foreground font-semibold",
                "shadow-[0_0_30px_hsl(var(--primary)/0.4)]",
                "hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)]",
                "transition-all duration-300"
              )}
            >
              <Sparkles className="h-5 w-5" />
              Start For Free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/pdf-tools"
              className={cn(
                "flex items-center gap-2 px-8 py-4 rounded-full",
                "glass hover:bg-secondary/50 transition-colors font-semibold"
              )}
            >
              Explore All Tools
            </Link>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4 mt-12"
          >
            {[
              { icon: Shield, text: "No Data Storage" },
              { icon: Zap, text: "Instant Processing" },
              { icon: Sparkles, text: "AI Powered" },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50"
              >
                <feature.icon className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">{feature.text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
