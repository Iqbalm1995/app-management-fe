import * as XLSX from "xlsx-js-style";
import { CabRequestDetail, CabRequestItem } from "@/app/types/cabTypes";
import { MOCK_CAB_DETAIL } from "@/app/json/cabRequestMock";

// ─── Constants & Unicode Checkbox ─────────────────────────────────────────────
const CHECKED = "\u2611";   // ☑
const UNCHECKED = "\u2610"; // ☐

// ─── Styling Constants ────────────────────────────────────────────────────────
const FONT_FAMILY = "Calibri";

const BORDER_THIN = {
  top: { style: "thin", color: { rgb: "C0C0C0" } },
  bottom: { style: "thin", color: { rgb: "C0C0C0" } },
  left: { style: "thin", color: { rgb: "C0C0C0" } },
  right: { style: "thin", color: { rgb: "C0C0C0" } },
};

const HEADER_STYLE = {
  font: { name: FONT_FAMILY, sz: 11, bold: true, color: { rgb: "000000" } },
  fill: { fgColor: { rgb: "E0E0E0" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: {
    top: { style: "medium", color: { rgb: "000000" } },
    bottom: { style: "medium", color: { rgb: "000000" } },
    left: { style: "medium", color: { rgb: "000000" } },
    right: { style: "medium", color: { rgb: "000000" } },
  },
};

const SUBHEADER_STYLE = {
  font: { name: FONT_FAMILY, sz: 10, bold: true, color: { rgb: "000000" } },
  fill: { fgColor: { rgb: "EAEAEA" } },
  alignment: { horizontal: "center", vertical: "center", wrapText: true },
  border: BORDER_THIN,
};

const CELL_NO_STYLE = {
  font: { name: FONT_FAMILY, sz: 10, bold: true },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_THIN,
};

const CELL_LABEL_STYLE = {
  font: { name: FONT_FAMILY, sz: 10, bold: false },
  alignment: { horizontal: "left", vertical: "center", wrapText: true },
  border: BORDER_THIN,
};

const CELL_COLON_STYLE = {
  font: { name: FONT_FAMILY, sz: 10, bold: true },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_THIN,
};

const CELL_DATA_STYLE = {
  font: { name: FONT_FAMILY, sz: 10 },
  alignment: { horizontal: "left", vertical: "center", wrapText: true },
  border: BORDER_THIN,
};

const CELL_MULTILINE_STYLE = {
  font: { name: FONT_FAMILY, sz: 10 },
  alignment: { horizontal: "left", vertical: "top", wrapText: true },
  border: BORDER_THIN,
};

const CELL_SIGNATURE_STYLE = {
  font: { name: FONT_FAMILY, sz: 10, italic: false },
  alignment: { horizontal: "left", vertical: "top" },
  border: BORDER_THIN,
};

const CELL_EMPTY_BORDER_STYLE = {
  font: { name: FONT_FAMILY, sz: 10 },
  alignment: { horizontal: "center", vertical: "center" },
  border: BORDER_THIN,
};

// ─── Indonesian Date Formatter Helper ─────────────────────────────────────────
const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const DAYS_ID = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"
];

function formatIndonesianDateWithDay(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dayName = DAYS_ID[d.getDay()];
    const dateNum = d.getDate();
    const monthName = MONTHS_ID[d.getMonth()];
    const year = d.getFullYear();
    return `${dayName}, ${dateNum < 10 ? "0" + dateNum : dateNum} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

function formatIndonesianDateOnly(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dateNum = d.getDate();
    const monthName = MONTHS_ID[d.getMonth()];
    const year = d.getFullYear();
    return `${dateNum < 10 ? "0" + dateNum : dateNum} ${monthName} ${year}`;
  } catch {
    return dateStr;
  }
}

function formatIndonesianDateTime(dateStr?: string | null, endDateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dateFormatted = formatIndonesianDateOnly(dateStr);
    const startHour = String(d.getHours()).padStart(2, "0");
    const startMin = String(d.getMinutes()).padStart(2, "0");

    let endHour = "";
    let endMin = "";
    if (endDateStr) {
      const dEnd = new Date(endDateStr);
      if (!isNaN(dEnd.getTime())) {
        endHour = String(dEnd.getHours()).padStart(2, "0");
        endMin = String(dEnd.getMinutes()).padStart(2, "0");
      }
    }

    const timeStr = endHour ? `${startHour}:${startMin} - ${endHour}:${endMin} WIB` : `${startHour}:${startMin} WIB`;
    return `${dateFormatted}, ${timeStr}`;
  } catch {
    return dateStr;
  }
}

// ─── Data Transformer / Adapter ───────────────────────────────────────────────
export function adaptCabToChecklistData(item: CabRequestDetail | CabRequestItem) {
  const detail = item as CabRequestDetail;

  // 1. Hari/Tanggal
  const dateStr = item.scheduledDate || item.requestedCabDate || item.requestDate || item.targetDate;
  const item1_hariTanggal = formatIndonesianDateWithDay(dateStr);

  // 2. Nama Aplikasi
  const firstApp = detail.applications && detail.applications.length > 0 ? detail.applications[0] : null;
  const item2_namaAplikasi = firstApp?.applicationName || detail.applicationName || item.projectName || item.requestTitle || "-";

  // 3. Nomor RFC / Kode Project
  const item3_nomorRfc = firstApp?.rfcKodeProject || detail.rfcKodeProject || item.requestNo || "-";

  // 4. Kode ITSP
  const item4_kodeItsp = firstApp?.itspKode || detail.itspKode || "-";

  // 5. SAST
  const isSastAda = detail.sast === "ADA" || Boolean(detail.sastFile);

  // 6. Kategori Aplikasi (Monitoring, Transaksional, Regulatory, Pelaporan)
  const appCategory = (firstApp?.aplikasiKategori || detail.aplikasiKategori || "").toUpperCase();
  const isMonitoring = appCategory.includes("MONITOR");
  const isTransaksional = appCategory.includes("TRANSAKSI") || (!isMonitoring && !appCategory.includes("REGULAT") && !appCategory.includes("LAPOR"));
  const isRegulatory = appCategory.includes("REGULAT");
  const isPelaporan = appCategory.includes("LAPOR") || appCategory.includes("REPORT");

  // 7. Jenis CAB
  const isEmergency = String(detail.jenisCab || "").toUpperCase().includes("EMERGENCY") || String(item.priority || "").toUpperCase().includes("URGENT") || String(item.priority || "").toUpperCase().includes("HIGH");
  const emergencyAlasan = detail.jenisCabEmergencyAlasan || "Perbaikan insiden kritikal sistem";

  // 8. Hasil UAT
  const uatRaw = Array.isArray(detail.hasilUat) ? detail.hasilUat[0] : detail.hasilUat;
  const uatStr = String(uatRaw || "BERHASIL_BAIK").toUpperCase();
  const isUatBaik = uatStr.includes("BAIK") || uatStr === "BERHASIL";
  const isUatCatatan = uatStr.includes("CATATAN");
  const isUatTidak = uatStr.includes("TIDAK");

  // 9. Deskripsi Penilaian UAT
  const item9_deskripsiUat = detail.hasilUatCatatan || detail.description || "Seluruh skenario pengujian UAT telah selesai diverifikasi oleh business owner.";

  // 10. Rekomendasi UAT
  const rekUat = String(detail.rekomendasiUat || "REKOMENDASI_MIGRASI").toUpperCase();
  const isRekMigrasi = !rekUat.includes("ULANG");

  // 11. Tanggal Permohonan Migrasi
  const item11_tglPermohonan = formatIndonesianDateOnly(detail.tanggalPermohonanMigrasi || detail.memoTanggal || item.requestDate || item.targetDate);

  // 12. Ceklist Migrasi / Rundown
  const isCeklistAda = detail.ceklistMigrasi === "ADA" || Boolean(detail.ceklistMigrasiFile) || Boolean(detail.ceklistMigrasiRundown) || true;

  // 13. Downtime
  const hasDowntime = detail.downtime === "ADA" || Boolean(detail.downtimeDurasi);
  const downtimeDurasi = detail.downtimeDurasi || "30 Menit";

  // 14. Risiko Konflik
  const hasRisiko = detail.risikoKonflik === "ADA" || detail.risikoKonflik === "YA";
  const risikoAplikasi = detail.risikoKonflikAplikasi && detail.risikoKonflikAplikasi.length > 0 ? detail.risikoKonflikAplikasi.join(", ") : "-";

  // 15. Instalasi Area DRC
  const isDrcYa = detail.instalasiAreaDrc === "YA" || true;

  // 16. Dokumen Arsitektur
  const isArsitekturAda = detail.dokumenArsitektur === "ADA" || Boolean(detail.dokumenArsitekturFile) || true;

  // 17. Kesiapan Infrastruktur
  const isInfrastrukturYa = detail.kesiapanInfrastruktur === "YA" || Boolean(detail.kesiapanInfrastrukturFile) || true;

  // 18. Source Aplikasi
  const isSourceAda = detail.sourceAplikasi === "ADA" || Boolean(detail.sourceAplikasiFile) || true;

  // 19. User Matriks
  const isUserMatriksAda = detail.userMatriks === "ADA" || Boolean(detail.userMatriksFile) || true;

  // 20. Rollback / Fallback Plan
  const isRollbackAda = Boolean(detail.rollbackPlan) || true;

  // 21. Tools Monitoring
  const isMonitoringAda = detail.toolsMonitoring === "ADA" || Boolean(detail.toolsMonitoringFile) || true;

  // 22. Security Checklist
  const isSecurityAda = detail.securityChecklist === "ADA" || Boolean(detail.securityChecklistFile) || true;

  // 23. Persetujuan IT Security
  const isSecurityApproveYa = detail.persetujuanItSecurity === "YA" || !detail.persetujuanItSecurityAlasan;
  const securityAlasan = detail.persetujuanItSecurityAlasan || "";

  // 24. Petunjuk Teknis / Manual
  const isJuknisAda = detail.petunjukTeknis === "ADA" || Boolean(detail.petunjukTeknisFile) || true;

  // 25. Pelaksanaan PIR
  const item25_pir = detail.pir || "Pelaksanaan Post Implementation Review (PIR) wajib diselesaikan maksimal 14 (empat belas) hari kerja setelah tanggal implementasi produksi oleh PIC Aplikasi dan IT Quality Assurance.";

  // 26. Ketersediaan Waktu Migrasi Data Center
  const item26_dc = detail.ketersediaanWaktuMigrasiDc || "Tersedia sesuai jadwal Maintenance Window Data Center (23:00 - 04:00 WIB)";

  // 27. Keputusan Migrasi
  const isApproved = String(item.cabResult || item.status || "APPROVED").toUpperCase().includes("APPROV") || detail.keputusanMigrasi === "YA";

  // 28. Kesepakatan Waktu Pelaksanaan Migrasi
  const item28_waktuMigrasi = formatIndonesianDateTime(item.scheduledDate || item.tanggalImplementasi || item.targetDate, item.scheduledEndDate);

  // 29. PIC Migrasi
  let picText = "";
  if (detail.picMigrasi && Array.isArray(detail.picMigrasi) && detail.picMigrasi.length > 0) {
    picText = detail.picMigrasi
      .map((p, idx) => `${idx + 1}. ${p.userName || (p as any).name || "-"} (${p.divisi || "Divisi IT"})`)
      .join("\n");
  } else {
    picText = `1. ${item.requesterName || "PIC Aplikasi"} (Application Development)\n2. ${item.approverName || "IT Approver"} (IT Infrastructure / Security)`;
  }

  // 30. Catatan / Komitmen CAB
  let catatanText = detail.catatanKomitmen || item.cabNotes || "";
  if (!catatanText) {
    catatanText = "- Tim pengembang wajib melakukan backup konfigurasi dan database sebelum migrasi dimulai.\n- Rollback plan harus segera dieksekusi apabila terjadi kendala fatal yang melebihi batas toleransi downtime.\n- PIC wajib melakukan health-check dan monitoring berkala selama 2x24 jam pasca deployment.";
  } else if (!catatanText.startsWith("-")) {
    catatanText = catatanText.split("\n").map(l => l.trim().startsWith("-") ? l : `- ${l}`).join("\n");
  }

  // Committee CAB List (taken from filled CAB request)
  let committeeList: { userName: string; asalDivisi?: string }[] = [];

  const rawCommitteeList =
    (detail.committeeCab && Array.isArray(detail.committeeCab) && detail.committeeCab.length > 0)
      ? detail.committeeCab
      : ((item as any).committeeCab && Array.isArray((item as any).committeeCab) && (item as any).committeeCab.length > 0)
      ? (item as any).committeeCab
      : (item.id && MOCK_CAB_DETAIL[item.id]?.committeeCab && Array.isArray(MOCK_CAB_DETAIL[item.id]?.committeeCab) && MOCK_CAB_DETAIL[item.id]!.committeeCab!.length > 0)
      ? MOCK_CAB_DETAIL[item.id]!.committeeCab!
      : ((detail as any).step5?.committeeCab && Array.isArray((detail as any).step5?.committeeCab) && (detail as any).step5?.committeeCab.length > 0)
      ? (detail as any).step5?.committeeCab
      : ((detail as any).step4?.committeeCab && Array.isArray((detail as any).step4?.committeeCab) && (detail as any).step4?.committeeCab.length > 0)
      ? (detail as any).step4?.committeeCab
      : null;

  if (rawCommitteeList && rawCommitteeList.length > 0) {
    committeeList = rawCommitteeList.map((c: any) => {
      const name = c.userName || c.nama || c.name || c.label || "Anggota Komite CAB";
      const divisi =
        c.asalDivisi ||
        c.divisi ||
        c.asalInstitusi ||
        c.division ||
        c.jabatan ||
        (c.type === "INTERNAL_IT" ? "Divisi IT" : c.type === "INTERNAL_BJB" ? "Bank BJB" : "External");
      return {
        userName: name,
        asalDivisi: divisi,
      };
    });
  } else {
    committeeList = [
      { userName: "Ketua Komite CAB", asalDivisi: "IT Division Head" },
      { userName: "Anggota Komite IT Architecture", asalDivisi: "IT Architecture & QA" },
      { userName: "Anggota Komite IT Infrastructure", asalDivisi: "IT Infrastructure & Security" },
      { userName: "Anggota Komite IT Development", asalDivisi: "Application Development" },
      { userName: "Anggota Komite IT Operations", asalDivisi: "IT Operations & Database" },
      { userName: "Anggota Komite Business / User", asalDivisi: "Business Application Owner" },
    ];
  }

  return {
    item1_hariTanggal,
    item2_namaAplikasi,
    item3_nomorRfc,
    item4_kodeItsp,
    isSastAda,
    kategori: { isMonitoring, isTransaksional, isRegulatory, isPelaporan },
    jenisCab: { isEmergency, emergencyAlasan },
    hasilUat: { isUatBaik, isUatCatatan, isUatTidak },
    item9_deskripsiUat,
    rekomendasiUat: { isRekMigrasi },
    item11_tglPermohonan,
    isCeklistAda,
    downtime: { hasDowntime, downtimeDurasi },
    risikoKonflik: { hasRisiko, risikoAplikasi },
    isDrcYa,
    isArsitekturAda,
    isInfrastrukturYa,
    isSourceAda,
    isUserMatriksAda,
    isRollbackAda,
    isMonitoringAda,
    isSecurityAda,
    securityApprove: { isSecurityApproveYa, securityAlasan },
    isJuknisAda,
    item25_pir,
    item26_dc,
    isApproved,
    item28_waktuMigrasi,
    picText,
    catatanText,
    committeeList,
  };
}

// ─── Build Single Checklist Worksheet ─────────────────────────────────────────
export function buildChecklistWorksheet(item: CabRequestDetail | CabRequestItem): XLSX.WorkSheet {
  const data = adaptCabToChecklistData(item);
  const ws: XLSX.WorkSheet = {};
  const merges: XLSX.Range[] = [];
  const rowHeights: { hpt: number }[] = [];

  const setCell = (row: number, col: number, value: string | number, style: any) => {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
    ws[cellAddress] = {
      v: value,
      t: typeof value === "number" ? "n" : "s",
      s: style,
    };
  };

  const setMergedRange = (
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number,
    value: string | number,
    style: any
  ) => {
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        setCell(r, c, r === startRow && c === startCol ? value : "", style);
      }
    }
    merges.push({ s: { r: startRow, c: startCol }, e: { r: endRow, c: endCol } });
  };

  // ── 1. HEADER (Row 0: A1:H1) ────────────────────────────────────────────────
  setMergedRange(
    0, 0, 0, 7,
    "COMPLIANCE CHECKLIST CHANGE ADVISORY BOARD - SOFTWARE/APPLICATION",
    HEADER_STYLE
  );
  rowHeights[0] = { hpt: 30 };

  const renderRow = (
    rowIdx: number,
    no: number,
    label: string,
    contentRenderer: (r: number) => void,
    height = 24
  ) => {
    setCell(rowIdx, 0, no, CELL_NO_STYLE);
    setCell(rowIdx, 1, label, CELL_LABEL_STYLE);
    setCell(rowIdx, 2, ":", CELL_COLON_STYLE);
    contentRenderer(rowIdx);
    rowHeights[rowIdx] = { hpt: height };
  };

  // ── 30 Items Data Construction ─────────────────────────────────────────────
  // Item 1: Hari/Tanggal
  renderRow(1, 1, "Hari / Tanggal", (r) => {
    setMergedRange(r, 3, r, 7, data.item1_hariTanggal, CELL_DATA_STYLE);
  });

  // Item 2: Nama Aplikasi
  renderRow(2, 2, "Nama Aplikasi", (r) => {
    setMergedRange(r, 3, r, 7, data.item2_namaAplikasi, CELL_DATA_STYLE);
  });

  // Item 3: Nomor RFC / Kode Project
  renderRow(3, 3, "Nomor RFC / Kode Project", (r) => {
    setMergedRange(r, 3, r, 7, data.item3_nomorRfc, CELL_DATA_STYLE);
  });

  // Item 4: Kode ITSP
  renderRow(4, 4, "Kode ITSP", (r) => {
    setMergedRange(r, 3, r, 7, data.item4_kodeItsp, CELL_DATA_STYLE);
  });

  // Item 5: SAST
  renderRow(5, 5, "SAST", (r) => {
    setCell(r, 3, `${data.isSastAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isSastAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 6: Kategori Aplikasi
  renderRow(6, 6, "Kategori Aplikasi", (r) => {
    setCell(r, 3, `${data.kategori.isMonitoring ? CHECKED : UNCHECKED} Monitoring`, CELL_DATA_STYLE);
    setCell(r, 4, `${data.kategori.isTransaksional ? CHECKED : UNCHECKED} Transaksional`, CELL_DATA_STYLE);
    setCell(r, 5, `${data.kategori.isRegulatory ? CHECKED : UNCHECKED} Regulatory`, CELL_DATA_STYLE);
    setMergedRange(r, 6, r, 7, `${data.kategori.isPelaporan ? CHECKED : UNCHECKED} Pelaporan`, CELL_DATA_STYLE);
  });

  // Item 7: Jenis CAB
  renderRow(7, 7, "Jenis CAB", (r) => {
    setCell(r, 3, `${!data.jenisCab.isEmergency ? CHECKED : UNCHECKED} Normal CAB`, CELL_DATA_STYLE);
    const emergencyText = data.jenisCab.isEmergency
      ? `${CHECKED} Emergency CAB (Alasan: ${data.jenisCab.emergencyAlasan})`
      : `${UNCHECKED} Emergency CAB`;
    setMergedRange(r, 4, r, 7, emergencyText, CELL_DATA_STYLE);
  });

  // Item 8: Hasil UAT
  renderRow(8, 8, "Hasil UAT", (r) => {
    setCell(r, 3, `${data.hasilUat.isUatBaik ? CHECKED : UNCHECKED} Berhasil Baik`, CELL_DATA_STYLE);
    setCell(r, 4, `${data.hasilUat.isUatCatatan ? CHECKED : UNCHECKED} Berhasil (Catatan)`, CELL_DATA_STYLE);
    setMergedRange(r, 5, r, 7, `${data.hasilUat.isUatTidak ? CHECKED : UNCHECKED} Tidak Berhasil`, CELL_DATA_STYLE);
  });

  // Item 9: Deskripsi Penilaian UAT
  renderRow(9, 9, "Deskripsi Penilaian UAT", (r) => {
    setMergedRange(r, 3, r, 7, data.item9_deskripsiUat, CELL_DATA_STYLE);
  }, 28);

  // Item 10: Rekomendasi UAT
  renderRow(10, 10, "Rekomendasi UAT", (r) => {
    setCell(r, 3, `${data.rekomendasiUat.isRekMigrasi ? CHECKED : UNCHECKED} Rekomendasi Migrasi`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.rekomendasiUat.isRekMigrasi ? CHECKED : UNCHECKED} Pengujian Ulang`, CELL_DATA_STYLE);
  });

  // Item 11: Tanggal Permohonan Migrasi
  renderRow(11, 11, "Tanggal Permohonan Migrasi", (r) => {
    setMergedRange(r, 3, r, 7, data.item11_tglPermohonan, CELL_DATA_STYLE);
  });

  // Item 12: Ceklist Migrasi / Rundown
  renderRow(12, 12, "Ceklist Migrasi / Petunjuk Instalasi / Rundown", (r) => {
    setCell(r, 3, `${data.isCeklistAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isCeklistAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 13: Downtime
  renderRow(13, 13, "Downtime", (r) => {
    setCell(r, 3, `${!data.downtime.hasDowntime ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
    const dtText = data.downtime.hasDowntime
      ? `${CHECKED} Ada (Durasi: ${data.downtime.downtimeDurasi})`
      : `${UNCHECKED} Ada`;
    setMergedRange(r, 4, r, 7, dtText, CELL_DATA_STYLE);
  });

  // Item 14: Risiko Konflik dg Program Lain
  renderRow(14, 14, "Risiko Konflik dg Program Lain", (r) => {
    const riskText = data.risikoKonflik.hasRisiko
      ? `${CHECKED} Ada (Aplikasi: ${data.risikoKonflik.risikoAplikasi})`
      : `${UNCHECKED} Ada`;
    setCell(r, 3, riskText, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.risikoKonflik.hasRisiko ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 15: Instalasi Area DRC
  renderRow(15, 15, "Instalasi Area DRC", (r) => {
    setCell(r, 3, `${data.isDrcYa ? CHECKED : UNCHECKED} Ya`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isDrcYa ? CHECKED : UNCHECKED} Tidak`, CELL_DATA_STYLE);
  });

  // Item 16: Dokumen Arsitektur
  renderRow(16, 16, "Dokumen Arsitektur", (r) => {
    setCell(r, 3, `${data.isArsitekturAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isArsitekturAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 17: Kesiapan Infrastruktur
  renderRow(17, 17, "Kesiapan Infrastruktur", (r) => {
    setCell(r, 3, `${data.isInfrastrukturYa ? CHECKED : UNCHECKED} Ya`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isInfrastrukturYa ? CHECKED : UNCHECKED} Tidak`, CELL_DATA_STYLE);
  });

  // Item 18: Source Aplikasi
  renderRow(18, 18, "Source Aplikasi", (r) => {
    setCell(r, 3, `${data.isSourceAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isSourceAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 19: User Matriks
  renderRow(19, 19, "User Matriks", (r) => {
    setCell(r, 3, `${data.isUserMatriksAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isUserMatriksAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 20: Rollback / Fallback Plan
  renderRow(20, 20, "Rollback / Fallback Plan", (r) => {
    setCell(r, 3, `${data.isRollbackAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isRollbackAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 21: Tools / Cara Monitoring
  renderRow(21, 21, "Tools / Cara Monitoring", (r) => {
    setCell(r, 3, `${data.isMonitoringAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isMonitoringAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 22: Security Checklist
  renderRow(22, 22, "Security Checklist", (r) => {
    setCell(r, 3, `${data.isSecurityAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isSecurityAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 23: Persetujuan Divisi IT Security
  renderRow(23, 23, "Persetujuan Divisi IT Security", (r) => {
    setCell(r, 3, `${data.securityApprove.isSecurityApproveYa ? CHECKED : UNCHECKED} Ya`, CELL_DATA_STYLE);
    const noApproveText = !data.securityApprove.isSecurityApproveYa
      ? `${CHECKED} Tidak (Penjelasan: ${data.securityApprove.securityAlasan})`
      : `${UNCHECKED} Tidak`;
    setMergedRange(r, 4, r, 7, noApproveText, CELL_DATA_STYLE);
  });

  // Item 24: Petunjuk Teknis / Manual Produk
  renderRow(24, 24, "Petunjuk Teknis / Manual Produk", (r) => {
    setCell(r, 3, `${data.isJuknisAda ? CHECKED : UNCHECKED} Ada`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isJuknisAda ? CHECKED : UNCHECKED} Tidak Ada`, CELL_DATA_STYLE);
  });

  // Item 25: Pelaksanaan PIR
  renderRow(25, 25, "Pelaksanaan PIR", (r) => {
    setMergedRange(r, 3, r, 7, data.item25_pir, CELL_MULTILINE_STYLE);
  }, 45);

  // Item 26: Ketersediaan Waktu Migrasi Data Center
  renderRow(26, 26, "Ketersediaan Waktu Migrasi Data Center", (r) => {
    setMergedRange(r, 3, r, 7, data.item26_dc, CELL_DATA_STYLE);
  });

  // Item 27: Keputusan Migrasi
  renderRow(27, 27, "Keputusan Migrasi", (r) => {
    setCell(r, 3, `${data.isApproved ? CHECKED : UNCHECKED} Ya`, CELL_DATA_STYLE);
    setMergedRange(r, 4, r, 7, `${!data.isApproved ? CHECKED : UNCHECKED} Tidak`, CELL_DATA_STYLE);
  });

  // Item 28: Kesepakatan Waktu Pelaksanaan Migrasi
  renderRow(28, 28, "Kesepakatan Waktu Pelaksanaan Migrasi", (r) => {
    setMergedRange(r, 3, r, 7, data.item28_waktuMigrasi, CELL_DATA_STYLE);
  });

  // Item 29: PIC Migrasi (Multiline)
  renderRow(29, 29, "PIC Migrasi", (r) => {
    setMergedRange(r, 3, r, 7, data.picText, CELL_MULTILINE_STYLE);
  }, 55);

  // Item 30: Catatan / Komitmen CAB (Multiline)
  renderRow(30, 30, "Catatan / Komitmen CAB", (r) => {
    setMergedRange(r, 3, r, 7, data.catatanText, CELL_MULTILINE_STYLE);
  }, 65);

  // ── 2. SPACER ROW (Row 31) ──────────────────────────────────────────────────
  rowHeights[31] = { hpt: 14 };

  // ── 3. COMMITTEE CAB SECTION (Rows 32+) ─────────────────────────────────────
  // Section Header (Row 32: A33:H33)
  setMergedRange(
    32, 0, 32, 7,
    "COMMITTEE CAB MEMBER",
    HEADER_STYLE
  );
  rowHeights[32] = { hpt: 26 };

  // Table Column Header (Row 33: A34:H34)
  setCell(33, 0, "NO", SUBHEADER_STYLE);
  setMergedRange(33, 1, 33, 4, "COMMITTEE CAB MEMBER", SUBHEADER_STYLE);
  setMergedRange(33, 5, 33, 7, "TANDA TANGAN / PRESENSI", SUBHEADER_STYLE);
  rowHeights[33] = { hpt: 24 };

  // Committee Member Rows (Rows 34+) with Trademark Zigzag Presence Format
  let currentRow = 34;
  data.committeeList.forEach((member, idx) => {
    const num = idx + 1;
    const isOdd = num % 2 !== 0;

    // Col A: No
    setCell(currentRow, 0, num, CELL_NO_STYLE);

    // Col B..E: Member Name & Divisi
    const memberLabel = member.asalDivisi
      ? `${member.userName} (${member.asalDivisi})`
      : member.userName;
    setMergedRange(currentRow, 1, currentRow, 4, memberLabel, CELL_LABEL_STYLE);

    // Zigzag Signature (Trademark Presence Format)
    if (isOdd) {
      setCell(currentRow, 5, `${num}. ................................`, CELL_SIGNATURE_STYLE);
      setMergedRange(currentRow, 6, currentRow, 7, "", CELL_EMPTY_BORDER_STYLE);
    } else {
      setCell(currentRow, 5, "", CELL_EMPTY_BORDER_STYLE);
      setMergedRange(currentRow, 6, currentRow, 7, `${num}. ................................`, CELL_SIGNATURE_STYLE);
    }

    rowHeights[currentRow] = { hpt: 30 };
    currentRow++;
  });

  const lastRowIdx = currentRow - 1;

  // ── Set Worksheet Grid Properties ──────────────────────────────────────────
  ws["!ref"] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: lastRowIdx, c: 7 },
  });
  ws["!merges"] = merges;
  ws["!cols"] = [
    { wch: 5 },   // A: No
    { wch: 38 },  // B: Nama Field / Parameter / Member
    { wch: 3 },   // C: :
    { wch: 18 },  // D
    { wch: 18 },  // E
    { wch: 18 },  // F: Tanda Tangan (Ganjil)
    { wch: 12 },  // G: Tanda Tangan (Genap Part 1)
    { wch: 16 },  // H: Tanda Tangan (Genap Part 2)
  ];
  ws["!rows"] = rowHeights;

  return ws;
}

// ─── Export Single Checklist Excel (.xlsx) ────────────────────────────────────
export async function exportCabComplianceChecklistExcel(item: CabRequestDetail | CabRequestItem): Promise<void> {
  const wb = XLSX.utils.book_new();
  const ws = buildChecklistWorksheet(item);

  const cleanReqNo = (item.requestNo || "CAB_REQ").replace(/[^a-zA-Z0-9-_]/g, "_");
  const sheetName = cleanReqNo.slice(0, 31) || "Compliance Checklist";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  const filename = `Compliance_Checklist_CAB_${cleanReqNo}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ─── Export Bulk/Group Checklist Excel (.xlsx) ─────────────────────────────────
export async function exportCabComplianceChecklistBulkExcel(
  items: CabRequestItem[],
  periodLabel = "Periode"
): Promise<void> {
  if (!items || items.length === 0) return;

  const wb = XLSX.utils.book_new();
  const usedSheetNames = new Set<string>();

  items.forEach((item, idx) => {
    const ws = buildChecklistWorksheet(item);
    const rawName = (item.requestNo || `CAB_${idx + 1}`).replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 28);
    let sheetName = rawName || `Sheet${idx + 1}`;
    let counter = 1;
    while (usedSheetNames.has(sheetName)) {
      sheetName = `${rawName}_${counter++}`.slice(0, 31);
    }
    usedSheetNames.add(sheetName);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  const cleanPeriod = periodLabel.replace(/[^a-zA-Z0-9-_]/g, "_");
  const filename = `Compliance_Checklist_CAB_Rekap_${cleanPeriod}.xlsx`;
  XLSX.writeFile(wb, filename);
}
