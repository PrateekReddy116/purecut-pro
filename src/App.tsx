import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// AI Tools
import AIToolsIndex from "./pages/AITools";
import BackgroundRemover from "./pages/AITools/BackgroundRemover";

// PDF Tools
import PDFToolsIndex from "./pages/PDFTools";
import PDFMerge from "./pages/PDFTools/Merge";

// Image Tools
import ImageToolsIndex from "./pages/ImageTools";
import ImageConvert from "./pages/ImageTools/Convert";

// File Tools
import FileToolsIndex from "./pages/FileTools";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* AI Tools */}
          <Route path="/ai-tools" element={<AIToolsIndex />} />
          <Route path="/ai-tools/background-remover" element={<BackgroundRemover />} />
          <Route path="/ai-tools/enhancer" element={<AIToolsIndex />} />
          <Route path="/ai-tools/object-remover" element={<AIToolsIndex />} />
          <Route path="/ai-tools/upscaler" element={<AIToolsIndex />} />
          
          {/* PDF Tools */}
          <Route path="/pdf-tools" element={<PDFToolsIndex />} />
          <Route path="/pdf-tools/merge" element={<PDFMerge />} />
          <Route path="/pdf-tools/split" element={<PDFToolsIndex />} />
          <Route path="/pdf-tools/to-images" element={<PDFToolsIndex />} />
          <Route path="/pdf-tools/from-images" element={<PDFToolsIndex />} />
          <Route path="/pdf-tools/compress" element={<PDFToolsIndex />} />
          <Route path="/pdf-tools/protect" element={<PDFToolsIndex />} />
          <Route path="/pdf-tools/unlock" element={<PDFToolsIndex />} />
          
          {/* Image Tools */}
          <Route path="/image-tools" element={<ImageToolsIndex />} />
          <Route path="/image-tools/convert" element={<ImageConvert />} />
          <Route path="/image-tools/compress" element={<ImageToolsIndex />} />
          <Route path="/image-tools/resize" element={<ImageToolsIndex />} />
          <Route path="/image-tools/rotate" element={<ImageToolsIndex />} />
          <Route path="/image-tools/watermark" element={<ImageToolsIndex />} />
          
          {/* File Tools */}
          <Route path="/file-tools" element={<FileToolsIndex />} />
          <Route path="/file-tools/compress" element={<FileToolsIndex />} />
          <Route path="/file-tools/extract" element={<FileToolsIndex />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
