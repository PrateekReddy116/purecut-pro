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
import ImageEnhancer from "./pages/AITools/Enhancer";
import ObjectRemover from "./pages/AITools/ObjectRemover";
import ImageUpscaler from "./pages/AITools/Upscaler";

// PDF Tools
import PDFToolsIndex from "./pages/PDFTools";
import PDFMerge from "./pages/PDFTools/Merge";
import PDFSplit from "./pages/PDFTools/Split";
import PDFToImages from "./pages/PDFTools/ToImages";
import ImagesToPDF from "./pages/PDFTools/FromImages";
import PDFProtect from "./pages/PDFTools/Protect";
import PDFUnlock from "./pages/PDFTools/Unlock";

// Image Tools
import ImageToolsIndex from "./pages/ImageTools";
import ImageConvert from "./pages/ImageTools/Convert";
import ImageCompress from "./pages/ImageTools/Compress";
import ImageResize from "./pages/ImageTools/Resize";
import ImageRotate from "./pages/ImageTools/Rotate";
import AddWatermark from "./pages/ImageTools/Watermark";

// File Tools
import FileToolsIndex from "./pages/FileTools";
import CreateArchive from "./pages/FileTools/Compress";
import ExtractFiles from "./pages/FileTools/Extract";

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
          <Route path="/ai-tools/enhancer" element={<ImageEnhancer />} />
          <Route path="/ai-tools/object-remover" element={<ObjectRemover />} />
          <Route path="/ai-tools/upscaler" element={<ImageUpscaler />} />
          
          {/* PDF Tools */}
          <Route path="/pdf-tools" element={<PDFToolsIndex />} />
          <Route path="/pdf-tools/merge" element={<PDFMerge />} />
          <Route path="/pdf-tools/split" element={<PDFSplit />} />
          <Route path="/pdf-tools/to-images" element={<PDFToImages />} />
          <Route path="/pdf-tools/from-images" element={<ImagesToPDF />} />
          <Route path="/pdf-tools/protect" element={<PDFProtect />} />
          <Route path="/pdf-tools/unlock" element={<PDFUnlock />} />
          
          {/* Image Tools */}
          <Route path="/image-tools" element={<ImageToolsIndex />} />
          <Route path="/image-tools/convert" element={<ImageConvert />} />
          <Route path="/image-tools/compress" element={<ImageCompress />} />
          <Route path="/image-tools/resize" element={<ImageResize />} />
          <Route path="/image-tools/rotate" element={<ImageRotate />} />
          <Route path="/image-tools/watermark" element={<AddWatermark />} />
          
          {/* File Tools */}
          <Route path="/file-tools" element={<FileToolsIndex />} />
          <Route path="/file-tools/compress" element={<CreateArchive />} />
          <Route path="/file-tools/extract" element={<ExtractFiles />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
