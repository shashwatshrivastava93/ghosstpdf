"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Printer,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
} from "pdfjs-dist";

interface PdfViewerProps {
  pdfUrl: string;
}

export function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loadingTaskRef = useRef<PDFDocumentLoadingTask | null>(null);
  const pdfDocRef = useRef<PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<{ cancel: () => void } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  const renderPage = useCallback(
    async (pageNum: number, currentScale: number) => {
      if (!pdfDocRef.current || !canvasRef.current) return;

      renderTaskRef.current?.cancel();
      setIsRendering(true);

      try {
        const page = await pdfDocRef.current.getPage(pageNum);
        const viewport = page.getViewport({
          scale: currentScale * window.devicePixelRatio,
        });

        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / window.devicePixelRatio}px`;
        canvas.style.height = `${viewport.height / window.devicePixelRatio}px`;

        const renderTask = page.render({
          canvas,
          viewport,
          canvasContext: canvas.getContext("2d")!,
        });
        renderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err) {
        if ((err as Error).name === "RenderingCancelledException") return;
        console.error("Failed to render page:", err);
      } finally {
        setIsRendering(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;
    let loadingTask: PDFDocumentLoadingTask | null = null;

    async function loadPdf() {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

      loadingTask = pdfjsLib.getDocument({ url: pdfUrl });
      loadingTaskRef.current = loadingTask;

      const pdf = await loadingTask.promise;

      if (cancelled) return;

      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);

      const page = await pdf.getPage(1);
      const unscaledViewport = page.getViewport({ scale: 1 });
      const fitScale =
        Math.max((containerRef.current?.clientWidth || 800) / unscaledViewport.width, 0.3);
      setScale(fitScale);
    }

    loadPdf();

    return () => {
      cancelled = true;
      loadingTask?.destroy().catch(() => {});
      pdfDocRef.current = null;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (pdfDocRef.current && totalPages > 0) {
      renderPage(currentPage, scale);
    }
  }, [currentPage, scale, renderPage, totalPages]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const zoomIn = () => setScale((s) => Math.min(s * 1.2, 3));
  const zoomOut = () => setScale((s) => Math.max(s / 1.2, 0.3));

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handlePrint = useCallback(() => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.src = pdfUrl;
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 100);
    };
    document.body.appendChild(iframe);
  }, [pdfUrl]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-full bg-zinc-950 relative"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800 relative z-20">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-zinc-400 min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-zinc-400 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-zinc-700 mx-1" />
          <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrint}
            aria-label="Print PDF"
            title="Print PDF"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex items-start justify-center p-4 relative">
        {isRendering && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 z-10">
            <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
          </div>
        )}
        <canvas ref={canvasRef} className="shadow-2xl max-w-full" />
      </div>
    </div>
  );
}