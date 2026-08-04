import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";

/**
 * Generates the standardized watermark text following the required formula:
 * DOKUMEN INI DIUNDUH PADA [LOCALDATE & TIME] | DIUNDUH DARI BJB APPS
 */
export const getFormattedWatermarkText = (customLocation?: string): string => {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");

  const day = pad(now.getDate());
  const month = pad(now.getMonth() + 1);
  const year = now.getFullYear();
  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());

  const localDateTime = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  const location = customLocation || "DIUNDUH DARI BJB APPS";

  return `DOKUMEN INI DIUNDUH PADA ${localDateTime} | ${location}`;
};

/**
 * Takes a PDF ArrayBuffer or Uint8Array and returns a new Uint8Array with
 * the dynamic watermark rendered BIG and BLUE on EVERY page.
 */
export const addWatermarkToPdfBuffer = async (
  pdfBuffer: ArrayBuffer | Uint8Array,
  customWatermarkText?: string
): Promise<Uint8Array> => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const text = customWatermarkText || getFormattedWatermarkText();
  const pages = pdfDoc.getPages();

  const angleDegrees = 45;
  const angleRad = (angleDegrees * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  // Red Color (#D32F2F -> rgb(0.83, 0.18, 0.18))
  const redColor = rgb(0.83, 0.18, 0.18);

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Dynamically calculate BIG font size so text spans diagonally across ~85% of page width
    const baseWidthAt1Pt = font.widthOfTextAtSize(text, 1);
    const targetWidth = width * 0.85;
    let fontSize = Math.min(26, Math.max(16, targetWidth / baseWidthAt1Pt));

    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = font.heightAtSize(fontSize);

    // Calculate position so the center of rotated text aligns with page center
    const xOffset = (textWidth / 2) * cos - (textHeight / 2) * sin;
    const yOffset = (textWidth / 2) * sin + (textHeight / 2) * cos;

    const x = width / 2 - xOffset;
    const y = height / 2 - yOffset;

    // Draw BIG RED center diagonal watermark
    page.drawText(text, {
      x,
      y,
      size: fontSize,
      font,
      color: redColor,
      opacity: 0.3,
      rotate: degrees(angleDegrees),
    });

    // Also draw clear footer watermark on each page
    const footerFontSize = Math.min(10, fontSize * 0.5);
    const footerWidth = font.widthOfTextAtSize(text, footerFontSize);
    const footerX = (width - footerWidth) / 2;
    const footerY = 15;

    page.drawText(text, {
      x: footerX > 10 ? footerX : 10,
      y: footerY,
      size: footerFontSize,
      font,
      color: redColor,
      opacity: 0.6,
    });
  }

  return await pdfDoc.save();
};

/**
 * Helper to download a PDF file with watermark applied dynamically.
 * If file is not PDF or watermarking fails, falls back gracefully to direct download.
 */
export const downloadWatermarkedPdf = async (
  fileUrl: string,
  fileName: string,
  customWatermarkText?: string
): Promise<void> => {
  if (!fileUrl) return;

  try {
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch file");

    const contentType = response.headers.get("content-type") || "";
    const isPdf =
      fileName.toLowerCase().endsWith(".pdf") ||
      contentType.includes("application/pdf") ||
      fileUrl.toLowerCase().includes(".pdf");

    if (!isPdf) {
      // Direct download for non-PDF files
      const blob = await response.blob();
      triggerBlobDownload(blob, fileName);
      return;
    }

    const arrayBuffer = await response.arrayBuffer();
    const watermarkedBytes = await addWatermarkToPdfBuffer(
      arrayBuffer,
      customWatermarkText
    );
    const watermarkedBlob = new Blob([watermarkedBytes], {
      type: "application/pdf",
    });

    triggerBlobDownload(watermarkedBlob, fileName);
  } catch (error) {
    console.error("Watermark download error, falling back to direct link:", error);
    // Fallback download
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName || "download.pdf";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

/**
 * Utility function to trigger browser download of a Blob.
 */
const triggerBlobDownload = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "download";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
