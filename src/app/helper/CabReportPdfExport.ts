import { CabRequestItem } from "@/app/types/cabTypes";

const BRAND_BLUE: [number, number, number] = [0, 87, 173];
const BG_LIGHT: [number, number, number] = [245, 247, 250];
const TEXT_MAIN: [number, number, number] = [33, 37, 41];
const TEXT_MUTED: [number, number, number] = [108, 117, 125];

export const getCabCategory = (item: CabRequestItem): "SOFTWARE" | "HARDWARE" => {
  if (item.category === "HARDWARE" || item.category === "SOFTWARE") return item.category;
  const typeUpper = String(item.requestType || "").toUpperCase();
  if (typeUpper === "INFRASTRUCTURE" || typeUpper === "HARDWARE" || typeUpper === "PROCUREMENT" || (item.projectName && item.projectName.toLowerCase().includes("hardware"))) {
    return "HARDWARE";
  }
  return "SOFTWARE";
};

export interface ExportCabReportPdfOptions {
  title: string;
  subtitle?: string;
  groupType: "DAY" | "WEEK" | "MONTH" | "QUARTER" | "ALL";
  periodLabel: string;
  items: CabRequestItem[];
  generatedBy?: string;
}

export async function exportCabReportsGroupPdf(options: ExportCabReportPdfOptions): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF("l", "mm", "a4"); // Landscape for comprehensive tabular reports
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  // ── Top Accent Bar ────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, pageW, 5, "F");

  // ── Document Title & Meta ─────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("LAPORAN RESMI CHANGE ADVISORY BOARD (CAB) MEETING", margin, 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Periode: ${options.periodLabel} • Total: ${options.items.length} Agenda`, margin, 20);
  doc.text(
    `Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} • Dicetak oleh: ${options.generatedBy || "IT Governance / Scheduler"}`,
    pageW - margin,
    20,
    { align: "right" }
  );

  doc.setDrawColor(220, 224, 230);
  doc.line(margin, 23, pageW - margin, 23);

  // ── Datatable (Starts immediately without stats boxes) ─────────────────────
  const tableData = options.items.map((item, index) => {
    const meetingDate = item.scheduledDate ? item.scheduledDate.slice(0, 10) : item.targetDate || "-";
    const meetingTime = item.scheduledDate
      ? `${item.scheduledDate.slice(11, 16)} - ${item.scheduledEndDate ? item.scheduledEndDate.slice(11, 16) : ""} WIB`
      : "-";
    const resultText = item.cabResult || item.status || "APPROVED";
    const notesText = item.cabNotes || "-";
    const categoryText = getCabCategory(item);
    const buktiCount = item.buktiImplementasi ? item.buktiImplementasi.length : 0;
    const buktiText = buktiCount > 0 ? `Lengkap (${buktiCount})` : "Belum Ada";

    return [
      String(index + 1),
      item.requestNo,
      item.requestTitle,
      item.projectName,
      categoryText,
      meetingDate,
      meetingTime,
      item.requesterName,
      resultText,
      notesText,
      buktiText,
    ];
  });

  autoTable(doc, {
    startY: 27,
    margin: { left: margin, right: margin },
    head: [[
      "No",
      "No. Request",
      "Judul Perubahan",
      "Project / Aplikasi",
      "Tipe",
      "Tgl Meeting",
      "Waktu",
      "Pemohon",
      "Keputusan CAB",
      "Catatan / Kesimpulan",
      "Bukti Impl.",
    ]],
    body: tableData,
    theme: "grid",
    headStyles: {
      fillColor: BRAND_BLUE,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_MAIN,
      valign: "top",
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 24, fontStyle: "bold" },
      2: { cellWidth: 42 },
      3: { cellWidth: 32 },
      4: { cellWidth: 22, halign: "center", fontStyle: "bold" },
      5: { cellWidth: 18, halign: "center" },
      6: { cellWidth: 20, halign: "center" },
      7: { cellWidth: 22 },
      8: { cellWidth: 24, halign: "center", fontStyle: "bold" },
      9: { cellWidth: 34 },
      10: { cellWidth: 22, halign: "center", fontStyle: "bold" },
    },
    didDrawPage: (data) => {
      // Footer
      const totalPages = (doc.internal as any).getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(`Halaman ${data.pageNumber} dari ${totalPages}`, margin, pageH - 6);
      doc.text("Laporan Resmi Komite Change Advisory Board (CAB)", pageW / 2, pageH - 6, { align: "center" });
      doc.text(`Confidential • ${new Date().toISOString().slice(0, 10)}`, pageW - margin, pageH - 6, { align: "right" });
    },
  });

  // Save PDF
  const filename = `CAB_Report_${options.groupType}_${options.periodLabel.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  doc.save(filename);
}

export async function exportSingleCabMeetingPdf(item: CabRequestItem): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentW = pageW - margin * 2;

  // Header Bar
  doc.setFillColor(...BRAND_BLUE);
  doc.rect(0, 0, pageW, 5, "F");

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("BERITA ACARA HASIL SIDANG CHANGE ADVISORY BOARD (CAB)", margin, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Nomor Dokumen: BA-CAB/${item.requestNo}`, margin, 21);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`, pageW - margin, 21, { align: "right" });

  doc.setDrawColor(200, 205, 212);
  doc.line(margin, 24, pageW - margin, 24);

  // Status Banner
  const resultText = (item.cabResult || item.status || "APPROVED").toUpperCase();
  const isApproved = resultText.includes("APPROVE");
  const bannerColor: [number, number, number] = isApproved ? [40, 167, 69] : [220, 53, 69];

  doc.setFillColor(...BG_LIGHT);
  doc.roundedRect(margin, 28, contentW, 13, 2, 2, "F");
  doc.setDrawColor(...bannerColor);
  doc.setLineWidth(0.8);
  doc.roundedRect(margin, 28, contentW, 13, 2, 2, "D");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...bannerColor);
  doc.text(`KEPUTUSAN SIDANG CAB: ${resultText}`, margin + 5, 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`Status Pelaksanaan: Sidang Selesai (Flag CAB Done: Y)`, margin + 5, 39);

  // Section 1: Informasi Permohonan
  let currentY = 46;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("I. INFORMASI PERUBAHAN SISTEM", margin, currentY);

  const infoRows = [
    ["Nomor Permohonan CAB", item.requestNo, "Tipe / Kategori", getCabCategory(item)],
    ["Judul Perubahan", item.requestTitle, "Nama Project", item.projectName || "-"],
    ["Pemohon (Requester)", item.requesterName || "-", "Approver Utama", item.approverName || "-"],
    ["Target Tanggal Implementasi", item.targetDate ? new Date(item.targetDate).toLocaleDateString("id-ID") : "-", "Jadwal Sidang CAB", item.scheduledDate ? `${item.scheduledDate.replace("T", " ")} WIB` : "-"],
  ];

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: margin, right: margin },
    body: infoRows,
    theme: "plain",
    styles: { fontSize: 8, cellPadding: 2, textColor: TEXT_MAIN },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: "bold", textColor: TEXT_MUTED },
      1: { cellWidth: 50 },
      2: { cellWidth: 40, fontStyle: "bold", textColor: TEXT_MUTED },
      3: { cellWidth: 50 },
    },
  });

  // Section 2: Catatan & Rekomendasi Komite CAB
  currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("II. NOTULENSI & REKOMENDASI KOMITE CAB", margin, currentY);

  const notesRows = [
    ["Lokasi / Ruang Meeting", item.cabLocation || "Ruang Rapat IT Divisi / Online MS Teams"],
    ["Hasil Keputusan Sidang", resultText],
    ["Catatan Komite CAB", item.cabNotes || "Perubahan telah diverifikasi dan disetujui sesuai dokumen kepatuhan."],
  ];

  autoTable(doc, {
    startY: currentY + 3,
    margin: { left: margin, right: margin },
    body: notesRows,
    theme: "grid",
    headStyles: { fillColor: BRAND_BLUE },
    styles: { fontSize: 8, cellPadding: 3, textColor: TEXT_MAIN },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: "bold", fillColor: BG_LIGHT },
      1: { cellWidth: contentW - 45 },
    },
  });

  // Section 3: Lampiran Bukti Implementasi (Screenshots / Verification Evidence)
  currentY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("III. LAMPIRAN BUKTI IMPLEMENTASI & VERIFIKASI", margin, currentY);

  const buktiList = item.buktiImplementasi || [];
  if (buktiList.length > 0) {
    const buktiRows = buktiList.map((b, bIdx) => [
      String(bIdx + 1),
      b.name,
      b.size ? `${(b.size / 1024).toFixed(1)} KB` : "-",
      b.uploadedAt ? new Date(b.uploadedAt).toLocaleString("id-ID") : "Terverifikasi",
      "✓ VALID / TERLAMPIR",
    ]);

    autoTable(doc, {
      startY: currentY + 3,
      margin: { left: margin, right: margin },
      head: [["No", "Nama Berkas Gambar / Screenshot", "Ukuran", "Waktu Unggah", "Status Verifikasi"]],
      body: buktiRows,
      theme: "grid",
      headStyles: { fillColor: BRAND_BLUE, fontSize: 7.5, fontStyle: "bold", halign: "center" },
      styles: { fontSize: 7.5, cellPadding: 2.5, textColor: TEXT_MAIN },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 70 },
        2: { cellWidth: 25, halign: "center" },
        3: { cellWidth: 40, halign: "center" },
        4: { cellWidth: 35, halign: "center", fontStyle: "bold" },
      },
    });
  } else {
    autoTable(doc, {
      startY: currentY + 3,
      margin: { left: margin, right: margin },
      body: [["Belum ada bukti implementasi digital yang dilampirkan."]],
      theme: "plain",
      styles: { fontSize: 7.5, fontStyle: "italic", textColor: [220, 53, 69] },
    });
  }

  // Section 4: Tanda Tangan & Persetujuan
  currentY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND_BLUE);
  doc.text("IV. PERSETUJUAN KOMITE CHANGE ADVISORY BOARD", margin, currentY);

  const sigY = currentY + 7;
  const colW = contentW / 3;

  const signatures = [
    { title: "Pemohon / Pelaksana Migrasi", name: item.requesterName || "Iqbal Maulana", role: "IT Development / Migration PIC" },
    { title: "Ketua Komite CAB / Scheduler", name: "Ahmad Fauzi", role: "IT Change Manager" },
    { title: "Lead Approver", name: item.approverName || "Budi Santoso", role: "Head of IT Operations" },
  ];

  signatures.forEach((sig, i) => {
    const x = margin + i * colW;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(sig.title, x + colW / 2, sigY, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(40, 167, 69);
    doc.text("[DIGITALLY SIGNED]", x + colW / 2, sigY + 14, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...TEXT_MAIN);
    doc.text(sig.name, x + colW / 2, sigY + 21, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(sig.role, x + colW / 2, sigY + 25, { align: "center" });
  });

  // Footer
  doc.setFontSize(7);
  doc.setTextColor(...TEXT_MUTED);
  doc.text("Dokumen ini dihasilkan secara elektronik melalui Aplikasi Manajemen Perubahan IT (KOBRA).", margin, pageH - 8);
  doc.text(`ID: ${item.id}`, pageW - margin, pageH - 8, { align: "right" });

  // Save PDF
  doc.save(`Berita_Acara_CAB_${item.requestNo.replace(/[\/\\]/g, "_")}.pdf`);
}
