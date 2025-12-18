import { motion } from "framer-motion";
import { Shield, Zap, Globe, Lock } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "100% Private",
    description: "Files never leave your device. All processing happens locally.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "No upload delays. Process files instantly in your browser.",
  },
  {
    icon: Globe,
    title: "Works Everywhere",
    description: "Any device with a modern browser. No installation required.",
  },
  {
    icon: Lock,
    title: "Enterprise Ready",
    description: "Secure enough for sensitive documents and business use.",
  },
];

export function WhyUseSection() {
  return (
    <section className="py-20">
      <div className="container px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
            Why PureCut Pro?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Built for privacy-conscious professionals who need powerful tools.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <feature.icon className="h-4 w-4" />
              </div>
              <h3 className="font-medium mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
