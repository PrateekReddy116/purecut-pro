import { motion } from "framer-motion";
import { Shield, Zap, Globe, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Private",
    description: "All processing happens locally in your browser. Your files never leave your device.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No upload delays. Process files instantly with cutting-edge browser technology.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Access from any device with a modern browser. No installation required.",
  },
  {
    icon: Lock,
    title: "Enterprise Ready",
    description: "Secure enough for sensitive documents. Perfect for business and personal use.",
  },
];

export function WhyUseSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      
      <div className="container px-4 mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold mb-4">
            Why Choose <span className="text-gradient">PureCut Pro</span>?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built for privacy-conscious professionals who need powerful tools without compromising security.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl glass hover:bg-card/90 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
