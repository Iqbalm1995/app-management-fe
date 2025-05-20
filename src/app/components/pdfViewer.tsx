"use client";

import React, { useEffect, useRef } from "react";

interface PdfCanvasViewerProps {
  fileUrl: string;
}

const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({ fileUrl }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderPDF = async () => {
      const pdfjsLib = await import("pdfjs-dist");
      const { GlobalWorkerOptions, getDocument } = pdfjsLib;

      // Use local worker
      GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

      const loadingTask = getDocument(fileUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext("2d");
      if (!context) return;

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;
    };

    renderPDF();
  }, [fileUrl]);

  return <canvas ref={canvasRef} />;
};

export default PdfCanvasViewer;
