import { Link } from "react-router-dom";
import { Scissors } from "lucide-react";

const footerLinks = {
  tools: [
    { name: "Background Remover", href: "/ai-tools/background-remover" },
    { name: "PDF Merger", href: "/pdf-tools/merge" },
    { name: "Image Converter", href: "/image-tools/convert" },
  ],
  resources: [
    { name: "Documentation", href: "#" },
    { name: "Support", href: "#" },
  ],
  legal: [
    { name: "Privacy", href: "#" },
    { name: "Terms", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <Scissors className="h-4 w-4" />
              <span className="font-medium text-sm">PureCut Pro</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              All-in-one document and image processing.
              100% local processing.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-medium mb-3">Tools</h4>
            <ul className="space-y-2">
              {footerLinks.tools.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-medium mb-3">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-medium mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} PureCut Pro
          </p>
        </div>
      </div>
    </footer>
  );
}
