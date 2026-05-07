import { AuthDataResponse } from "@/app/services/useAuthentications";
import { MyPerformanceSummaryResponse, MyPerformanceQuartalChartResponse } from "@/app/services/useReports";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { UserEvaluationReportListResponse } from "@/app/services/useReports";

export interface MyPerformancePdfPayload {
  auth: AuthDataResponse;
  summary: MyPerformanceSummaryResponse;
  quartalChart: MyPerformanceQuartalChartResponse;
  projects: ProjectDataResponse[];
  evaluations: UserEvaluationReportListResponse[];
  selectedYear: number;
  selectedQuarters: number[];
}

const BRAND_COLOR: [number, number, number] = [0, 87, 173];   // bjb blue
const ACCENT_COLOR: [number, number, number] = [41, 128, 185];
const LIGHT_GRAY: [number, number, number] = [245, 247, 250];
const TEXT_DARK: [number, number, number] = [30, 30, 30];
const TEXT_MUTED: [number, number, number] = [120, 120, 120];

export async function exportMyPerformancePDF(payload: MyPerformancePdfPayload): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  // ── Helper: add footer to all pages ──────────────────────────────────────
  const addFooter = () => {
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(...TEXT_MUTED);
      doc.text(`Page ${i} of ${totalPages}`, margin, pageH - 6);
      doc.text(`bjb KOBRA | Generated: ${new Date().toLocaleDateString("id-ID")}`, pageW - margin, pageH - 6, { align: "right" });
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, pageH - 9, pageW - margin, pageH - 9);
    }
  };

  // ── Helper: section heading ───────────────────────────────────────────────
  const sectionHeading = (text: string, y: number): number => {
    doc.setFillColor(...BRAND_COLOR);
    doc.rect(margin, y, contentW, 7, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(text, margin + 3, y + 5);
    doc.setTextColor(...TEXT_DARK);
    return y + 10;
  };

  // ── Helper: stat box ─────────────────────────────────────────────────────
  const statBox = (label: string, value: string | number, x: number, y: number, w: number, color: [number, number, number]) => {
    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(x, y, w, 14, 2, 2, "F");
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(String(value), x + w / 2, y + 8, { align: "center" });
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...TEXT_MUTED);
    doc.text(label, x + w / 2, y + 12.5, { align: "center" });
  };

  let y = margin;

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 1 — PORTFOLIO SUMMARY
  // ════════════════════════════════════════════════════════════════════════

  // Header banner
  doc.setFillColor(...BRAND_COLOR);
  doc.rect(0, 0, pageW, 32, "F");

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(180, 210, 255);
  doc.text("bjb KOBRA — Application Management System", margin, 8);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("MY PERFORMANCE PORTFOLIO", margin, 17);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 225, 255);
  const periodLabel = `Period: ${payload.selectedYear} ${payload.selectedQuarters.map(q => `Q${q}`).join(", ")}`;
  doc.text(periodLabel, margin, 24);
  doc.text(`Generated: ${new Date().toLocaleDateString("id-ID")}`, pageW - margin, 24, { align: "right" });

  y = 38;

  // User info row
  doc.setFillColor(...LIGHT_GRAY);
  doc.rect(margin, y, contentW, 18, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text(payload.auth.nama || "—", margin + 3, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...TEXT_MUTED);
  doc.text(`NIP: ${payload.auth.nip || "—"}`, margin + 3, y + 11);
  doc.text(`Jabatan: ${payload.auth.jabatan || "—"}`, margin + 3, y + 15.5);
  doc.text(`Unit Kerja: ${payload.auth.namaUnitKerja || "—"}`, pageW / 2, y + 11);
  doc.text(`User ID: ${payload.auth.userId || "—"}`, pageW / 2, y + 15.5);
  y += 22;

  // ── Section 1: Project Summary ───────────────────────────────────────────
  y = sectionHeading("1. PROJECT SUMMARY", y);
  const boxW = contentW / 6 - 2;
  const boxes = [
    { label: "Total Projects", value: payload.summary.totalProjects, color: ACCENT_COLOR },
    { label: "Active", value: payload.summary.projectActive, color: [39, 174, 96] as [number,number,number] },
    { label: "Closed", value: payload.summary.projectClose, color: [127, 140, 141] as [number,number,number] },
    { label: "Internal Dev", value: payload.summary.projectInternalDev, color: ACCENT_COLOR },
    { label: "Procurement", value: payload.summary.projectProcurement, color: [142, 68, 173] as [number,number,number] },
    { label: "RFC", value: payload.summary.projectRfc, color: [230, 126, 34] as [number,number,number] },
  ];
  boxes.forEach((b, i) => statBox(b.label, b.value, margin + i * (boxW + 2), y, boxW, b.color));
  y += 18;

  // ── Section 2: Requirement Summary ──────────────────────────────────────
  y = sectionHeading("2. REQUIREMENT SUMMARY", y);
  const reqBoxW = contentW / 3 - 2;
  [
    { label: "Total Requirements", value: payload.summary.totalRequirements, color: [142, 68, 173] as [number,number,number] },
    { label: "BRD", value: payload.summary.requirementBrd, color: ACCENT_COLOR },
    { label: "RFC", value: payload.summary.requirementRfc, color: [230, 126, 34] as [number,number,number] },
  ].forEach((b, i) => statBox(b.label, b.value, margin + i * (reqBoxW + 3), y, reqBoxW, b.color));
  y += 18;

  // ── Section 3: Task Summary ──────────────────────────────────────────────
  y = sectionHeading("3. TASK SUMMARY", y);

  // Task stat boxes row 1
  const taskBoxW = contentW / 4 - 2;
  [
    { label: "Assigned", value: payload.summary.totalTaskAssigned, color: ACCENT_COLOR },
    { label: "Completed", value: payload.summary.totalTaskCompleted, color: [39, 174, 96] as [number,number,number] },
    { label: "Sub-tasks Total", value: payload.summary.totalTaskItems, color: [22, 160, 133] as [number,number,number] },
    { label: "Sub-tasks Done", value: payload.summary.totalTaskItemCompleted, color: [39, 174, 96] as [number,number,number] },
  ].forEach((b, i) => statBox(b.label, b.value, margin + i * (taskBoxW + 2), y, taskBoxW, b.color));
  y += 18;

  // Board positions + Priority side by side
  const halfW = contentW / 2 - 3;

  // Board positions (left)
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text("Board Positions", margin, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const boards = [
    { label: "To Do", value: payload.summary.taskTodo },
    { label: "In Progress", value: payload.summary.taskInProgress },
    { label: "In Review", value: payload.summary.taskInReview },
    { label: "Done", value: payload.summary.taskDone },
  ];
  boards.forEach((b, i) => {
    const bx = margin + i * (halfW / 4);
    doc.setTextColor(...TEXT_MUTED);
    doc.text(b.label, bx, y + 9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...TEXT_DARK);
    doc.text(String(b.value), bx, y + 14);
    doc.setFont("helvetica", "normal");
  });

  // Priority (right)
  const rx = margin + halfW + 6;
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...TEXT_DARK);
  doc.text("Priority", rx, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  [
    { label: "HIGH", value: payload.summary.taskPriorityHigh, color: [192, 57, 43] as [number,number,number] },
    { label: "MEDIUM", value: payload.summary.taskPriorityMedium, color: [230, 126, 34] as [number,number,number] },
    { label: "LOW", value: payload.summary.taskPriorityLow, color: [39, 174, 96] as [number,number,number] },
  ].forEach((p, i) => {
    const px = rx + i * (halfW / 3);
    doc.setTextColor(...p.color);
    doc.text(p.label, px, y + 9);
    doc.setFont("helvetica", "bold");
    doc.text(String(p.value), px, y + 14);
    doc.setFont("helvetica", "normal");
  });
  y += 20;

  // ── Section 4: Quartal Chart ─────────────────────────────────────────────
  y = sectionHeading(`4. QUARTAL PROGRESS — ${payload.selectedYear}`, y);

  // Chart image via ApexCharts built-in dataURI (reliable, no html2canvas)
  try {
    const ApexCharts = (await import("apexcharts")).default;
    const result = await ApexCharts.exec("my-performance-line-chart", "dataURI", { scale: 1.5 });
    const imgData = (result as any)?.imgURI;

    if (imgData) {
      const chartH = 50;
      const chartW = contentW * 0.65;
      doc.addImage(imgData, "PNG", margin, y, chartW, chartH);

      const tableX = margin + chartW + 4;
      const tableW = contentW - chartW - 4;
      autoTable(doc, {
        startY: y,
        margin: { left: tableX },
        tableWidth: tableW,
        head: [["Q", "Active", "Closed"]],
        body: payload.quartalChart.chart.map(p => [p.quarter, p.activeCount, p.closedCount]),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: BRAND_COLOR },
        columnStyles: { 0: { cellWidth: tableW * 0.3 }, 1: { cellWidth: tableW * 0.35 }, 2: { cellWidth: tableW * 0.35 } },
      });
      y += chartH + 4;
    } else {
      throw new Error("No imgURI");
    }
  } catch {
    // Fallback: data table only
    autoTable(doc, {
      startY: y,
      margin: { left: margin },
      head: [["Quarter", "Active Projects", "Closed Projects"]],
      body: payload.quartalChart.chart.map(p => [p.quarter, p.activeCount, p.closedCount]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: BRAND_COLOR },
      tableWidth: contentW / 2,
    });
    y += 35;
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE 2 — PROJECT LIST + EVALUATION REPORT
  // ════════════════════════════════════════════════════════════════════════
  doc.addPage();
  y = margin;

  // ── Section 5: Project List ──────────────────────────────────────────────
  y = sectionHeading("5. ASSIGNED PROJECTS", y);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["No", "Project No", "Project Name", "Type", "Status", "Progress"]],
    body: payload.projects.map((p, i) => [
      i + 1,
      p.projectNo || "-",
      p.projectName || "-",
      p.projectType || "-",
      p.projectStatus || "-",
      `${p.projectStatusPercentage || 0}%`,
    ]),
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: BRAND_COLOR },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 25 },
      2: { cellWidth: 70 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25 },
      5: { cellWidth: 15 },
    },
    didDrawPage: () => { y = (doc as any).lastAutoTable.finalY + 8; },
  });
  y = (doc as any).lastAutoTable.finalY + 8;

  // ── Section 6: Evaluation Report ────────────────────────────────────────
  y = sectionHeading("6. EVALUATION REPORT", y);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["No", "Project No", "Project Name", "Period", "Basic", "Timeless", "Extra", "Grand Total"]],
    body: payload.evaluations.map((e, i) => [
      i + 1,
      e.projectNo || "-",
      e.projectName || "-",
      `${e.yearPeriod} Q${e.quartalPeriod}`,
      e.evBasicPoint,
      e.evTimelessPoint,
      e.evExtraPoint,
      e.evGrandTotal,
    ]),
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: BRAND_COLOR },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 22 },
      2: { cellWidth: 65 },
      3: { cellWidth: 18 },
      4: { cellWidth: 14 },
      5: { cellWidth: 16 },
      6: { cellWidth: 12 },
      7: { cellWidth: 18 },
    },
  });

  // Add footers to all pages
  addFooter();

  // Save
  const filename = `My_Performance_Portfolio_${payload.selectedYear}_${payload.selectedQuarters.map(q => `Q${q}`).join("")}.pdf`;
  doc.save(filename);
}
