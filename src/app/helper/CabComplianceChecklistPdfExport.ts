import { CabRequestDetail, CabRequestItem } from "@/app/types/cabTypes";
import { adaptCabToChecklistData } from "./CabComplianceChecklistExcelExport";

// ─── Constants & Checkbox Symbols ─────────────────────────────────────────────
// Standard ASCII representation to avoid WinAnsiEncoding font issues in standard jsPDF Helvetica
export const CHECKED = "[X]";
export const UNCHECKED = "[ ]";

// ─── DTO Interfaces ───────────────────────────────────────────────────────────

export interface CabEvidencePayload {
  headerTitle?: string;
  imageUrl?: string | null;       // Base64 data URI or image URL
  caption?: string;
  uploadedAt?: string;
  uploadedBy?: string;
}

export interface CabSignaturePayload {
  city: string;
  dateFormatted: string;
  signatureImageUrl?: string | null;
  signerName: string;
  signerRole: string;
  signerNip?: string;
}

export interface CabCompliancePdfPayload {
  documentTitle: string;
  documentNo?: string;

  // 30 Items Data Object from Excel Adapter
  checklistData: ReturnType<typeof adaptCabToChecklistData>;

  // Middle & Bottom
  evidence: CabEvidencePayload;
  signature: CabSignaturePayload;
}

// ─── Adapter Function ─────────────────────────────────────────────────────────

export function adaptCabToCompliancePdfPayload(
  item: CabRequestDetail | CabRequestItem,
  customEvidence?: CabEvidencePayload,
  customSignature?: CabSignaturePayload
): CabCompliancePdfPayload {
  const detail = item as CabRequestDetail;
  const checklistData = adaptCabToChecklistData(item);

  // Evidence Payload (Middle Section)
  let evidenceImage: string | null = null;
  let evidenceCaption = "Screenshot Pelaksanaan Rapat Sidang & Verifikasi Dokumen Kepatuhan CAB";
  if (detail.buktiImplementasi && detail.buktiImplementasi.length > 0) {
    const firstBukti = detail.buktiImplementasi[0];
    evidenceImage = firstBukti.url || (firstBukti as any).previewUrl || (firstBukti as any).data || null;
    evidenceCaption = `Bukti: ${firstBukti.name}`;
  }

  const evidence: CabEvidencePayload = {
    headerTitle: customEvidence?.headerTitle || "COMMITE ADVISORY BOARD",
    imageUrl: customEvidence?.imageUrl !== undefined ? customEvidence.imageUrl : evidenceImage,
    caption: customEvidence?.caption || evidenceCaption,
    uploadedAt: customEvidence?.uploadedAt || (item.scheduledDate ? item.scheduledDate.slice(0, 10) : undefined),
    uploadedBy: customEvidence?.uploadedBy || item.requesterName,
  };

  // Signature Payload (Bottom Section)
  const scheduledDate = item.scheduledDate || item.requestedCabDate || item.requestDate || item.targetDate;
  let dateFormatted = "-";
  if (scheduledDate) {
    try {
      const d = new Date(scheduledDate);
      if (!isNaN(d.getTime())) {
        const MONTHS_ID = [
          "Januari", "Februari", "Maret", "April", "Mei", "Juni",
          "Juli", "Agustus", "September", "Oktober", "November", "Desember",
        ];
        dateFormatted = `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
      }
    } catch {
      dateFormatted = scheduledDate;
    }
  }

  const signature: CabSignaturePayload = {
    city: customSignature?.city || "Bandung",
    dateFormatted: customSignature?.dateFormatted || dateFormatted,
    signatureImageUrl: customSignature?.signatureImageUrl || null,
    signerName: customSignature?.signerName || "Ilyas Muntaha Aiba",
    signerRole: customSignature?.signerRole || "Koordinator CAB",
    signerNip: customSignature?.signerNip,
  };

  return {
    documentTitle: "COMPLIANCE CHECKLIST CHANGE ADVISORY BOARD - SOFTWARE/APPLICATION",
    documentNo: item.requestNo,
    checklistData,
    evidence,
    signature,
  };
}

// ─── HTML & CSS Generator ─────────────────────────────────────────────────────

export function generateCabComplianceHtml(payload: CabCompliancePdfPayload): string {
  const cb = (checked: boolean) => (checked ? `<strong style="font-family: monospace;">[X]</strong>` : `<span style="font-family: monospace;">[&nbsp;]</span>`);
  const data = payload.checklistData;

  const picHtml = data.picText
    ? data.picText.split("\n").map((line) => `<div>${line}</div>`).join("")
    : "-";

  const catatanHtml = data.catatanText
    ? data.catatanText.split("\n").map((line) => `<div>${line}</div>`).join("")
    : "-";

  const pirHtml = data.item25_pir
    ? data.item25_pir.split("\n").map((line) => `<div>${line}</div>`).join("")
    : "-";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${payload.documentTitle}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 15mm;
    }
    * {
      box-sizing: border-box;
      font-family: Arial, Helvetica, sans-serif;
    }
    body {
      margin: 0;
      padding: 0;
      color: #000;
      font-size: 7.5pt;
      line-height: 1.2;
      background: #fff;
    }
    .checklist-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
    }
    .checklist-table th {
      background-color: #E0E0E0;
      font-weight: bold;
      text-transform: uppercase;
      text-align: center;
      padding: 4px 6px;
      font-size: 8pt;
      border: 1px solid #000;
    }
    .checklist-table td {
      border: 1px solid #B0B0B0;
      padding: 2px 4px;
      vertical-align: top;
    }
    .col-no { width: 4%; text-align: center; font-weight: bold; }
    .col-param { width: 36%; font-weight: 500; }
    .col-colon { width: 2%; text-align: center; }
    .col-val { width: 58%; }

    .footnote {
      font-size: 6.5pt;
      font-style: italic;
      margin-top: 2px;
      margin-bottom: 6px;
    }

    .evidence-box {
      width: 100%;
      border: 1px solid #000;
      margin-top: 4px;
      margin-bottom: 6px;
    }
    .evidence-header {
      background-color: #E0E0E0;
      font-weight: bold;
      text-align: center;
      padding: 3px 6px;
      font-size: 7.5pt;
      border-bottom: 1px solid #000;
      text-transform: uppercase;
    }
    .evidence-content {
      padding: 4px;
      text-align: center;
      min-height: 80px;
      max-height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #FAFAFA;
    }
    .evidence-img {
      max-width: 100%;
      max-height: 150px;
      object-fit: contain;
      border: 1px solid #ddd;
    }
    .evidence-caption {
      font-size: 6.5pt;
      font-style: italic;
      color: #555;
      margin-top: 3px;
    }

    .signature-container {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: 6px;
    }
    .signature-block {
      width: 240px;
      text-align: center;
    }
    .signature-date {
      font-size: 7.5pt;
      margin-bottom: 2px;
    }
    .signature-space {
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .signature-img {
      max-height: 48px;
      max-width: 140px;
    }
    .signer-name {
      font-size: 8pt;
      font-weight: bold;
      text-decoration: underline;
    }
    .signer-role {
      font-size: 7pt;
      color: #222;
    }
    .signer-nip {
      font-size: 6.5pt;
      color: #666;
    }
  </style>
</head>
<body>
  <!-- 1. Bagian Atas: Tabel Checklist 30 Item -->
  <table class="checklist-table">
    <thead>
      <tr>
        <th colspan="4">${payload.documentTitle}</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="col-no">1</td>
        <td class="col-param">Hari / Tanggal</td>
        <td class="col-colon">:</td>
        <td class="col-val">${data.item1_hariTanggal}</td>
      </tr>
      <tr>
        <td class="col-no">2</td>
        <td class="col-param">Nama Aplikasi</td>
        <td class="col-colon">:</td>
        <td class="col-val"><strong>${data.item2_namaAplikasi}</strong></td>
      </tr>
      <tr>
        <td class="col-no">3</td>
        <td class="col-param">Nomor RFC / Kode Project</td>
        <td class="col-colon">:</td>
        <td class="col-val">${data.item3_nomorRfc}</td>
      </tr>
      <tr>
        <td class="col-no">4</td>
        <td class="col-param">Kode ITSP</td>
        <td class="col-colon">:</td>
        <td class="col-val">${data.item4_kodeItsp}</td>
      </tr>
      <tr>
        <td class="col-no">5</td>
        <td class="col-param">SAST</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isSastAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isSastAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">6</td>
        <td class="col-param">Kategori Aplikasi</td>
        <td class="col-colon">:</td>
        <td class="col-val">
          ${cb(data.kategori.isMonitoring)} Monitoring &nbsp;&nbsp;
          ${cb(data.kategori.isTransaksional)} Transaksional &nbsp;&nbsp;
          ${cb(data.kategori.isRegulatory)} Regulatory &nbsp;&nbsp;
          ${cb(data.kategori.isPelaporan)} Pelaporan
        </td>
      </tr>
      <tr>
        <td class="col-no">7</td>
        <td class="col-param">Jenis CAB</td>
        <td class="col-colon">:</td>
        <td class="col-val">
          ${cb(!data.jenisCab.isEmergency)} Normal CAB &nbsp;&nbsp;&nbsp;&nbsp;
          ${cb(data.jenisCab.isEmergency)} Emergency CAB ${data.jenisCab.isEmergency ? `(Alasan: ${data.jenisCab.emergencyAlasan})` : ""}
        </td>
      </tr>
      <tr>
        <td class="col-no">8</td>
        <td class="col-param">Hasil UAT</td>
        <td class="col-colon">:</td>
        <td class="col-val">
          ${cb(data.hasilUat.isUatBaik)} Berhasil Baik &nbsp;&nbsp;
          ${cb(data.hasilUat.isUatCatatan)} Berhasil (Catatan) &nbsp;&nbsp;
          ${cb(data.hasilUat.isUatTidak)} Tidak Berhasil
        </td>
      </tr>
      <tr>
        <td class="col-no">9</td>
        <td class="col-param">Deskripsi Penilaian UAT</td>
        <td class="col-colon">:</td>
        <td class="col-val">${data.item9_deskripsiUat}</td>
      </tr>
      <tr>
        <td class="col-no">10</td>
        <td class="col-param">Rekomendasi UAT</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.rekomendasiUat.isRekMigrasi)} Rekomendasi Migrasi &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.rekomendasiUat.isRekMigrasi)} Pengujian Ulang</td>
      </tr>
      <tr>
        <td class="col-no">11</td>
        <td class="col-param">Tanggal Permohonan Migrasi</td>
        <td class="col-colon">:</td>
        <td class="col-val">${data.item11_tglPermohonan}</td>
      </tr>
      <tr>
        <td class="col-no">12</td>
        <td class="col-param">Ceklist Migrasi / Petunjuk Instalasi / Rundown</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isCeklistAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isCeklistAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">13</td>
        <td class="col-param">Downtime</td>
        <td class="col-colon">:</td>
        <td class="col-val">
          ${cb(!data.downtime.hasDowntime)} Tidak Ada &nbsp;&nbsp;&nbsp;&nbsp;
          ${cb(data.downtime.hasDowntime)} Ada ${data.downtime.hasDowntime ? `(Durasi: ${data.downtime.downtimeDurasi})` : ""}
        </td>
      </tr>
      <tr>
        <td class="col-no">14</td>
        <td class="col-param">Risiko Konflik dg Program Lain</td>
        <td class="col-colon">:</td>
        <td class="col-val">
          ${cb(data.risikoKonflik.hasRisiko)} Ada ${data.risikoKonflik.hasRisiko ? `(Aplikasi: ${data.risikoKonflik.risikoAplikasi})` : ""} &nbsp;&nbsp;&nbsp;&nbsp;
          ${cb(!data.risikoKonflik.hasRisiko)} Tidak Ada
        </td>
      </tr>
      <tr>
        <td class="col-no">15</td>
        <td class="col-param">Instalasi Area DRC</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isDrcYa)} Ya &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isDrcYa)} Tidak</td>
      </tr>
      <tr>
        <td class="col-no">16</td>
        <td class="col-param">Dokumen Arsitektur</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isArsitekturAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isArsitekturAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">17</td>
        <td class="col-param">Kesiapan Infrastruktur</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isInfrastrukturYa)} Ya &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isInfrastrukturYa)} Tidak</td>
      </tr>
      <tr>
        <td class="col-no">18</td>
        <td class="col-param">Source Aplikasi</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isSourceAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isSourceAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">19</td>
        <td class="col-param">User Matriks</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isUserMatriksAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isUserMatriksAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">20</td>
        <td class="col-param">Rollback / Fallback Plan</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isRollbackAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isRollbackAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">21</td>
        <td class="col-param">Tools / Cara Monitoring</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isMonitoringAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isMonitoringAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">22</td>
        <td class="col-param">Security Checklist</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isSecurityAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isSecurityAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">23</td>
        <td class="col-param">Persetujuan Divisi IT Security</td>
        <td class="col-colon">:</td>
        <td class="col-val">
          ${cb(data.securityApprove.isSecurityApproveYa)} Ya &nbsp;&nbsp;&nbsp;&nbsp;
          ${cb(!data.securityApprove.isSecurityApproveYa)} Tidak ${!data.securityApprove.isSecurityApproveYa ? `(Penjelasan: ${data.securityApprove.securityAlasan})` : ""}
        </td>
      </tr>
      <tr>
        <td class="col-no">24</td>
        <td class="col-param">Petunjuk Teknis / Manual Produk</td>
        <td class="col-colon">:</td>
        <td class="col-val">${cb(data.isJuknisAda)} Ada &nbsp;&nbsp;&nbsp;&nbsp; ${cb(!data.isJuknisAda)} Tidak Ada</td>
      </tr>
      <tr>
        <td class="col-no">25</td>
        <td class="col-param">Pelaksanaan PIR</td>
        <td class="col-colon">:</td>
        <td class="col-val">${pirHtml}</td>
      </tr>
      <tr>
        <td class="col-no">26</td>
        <td class="col-param">Ketersediaan Waktu Migrasi Data Center</td>
        <td class="col-colon">:</td>
        <td class="col-val">${data.item26_dc}</td>
      </tr>
      <tr>
        <td class="col-no">27</td>
        <td class="col-param">Keputusan Migrasi</td>
        <td class="col-colon">:</td>
        <td class="col-val">
          ${cb(data.isApproved)} Ya &nbsp;&nbsp;&nbsp;&nbsp;
          ${cb(!data.isApproved)} Tidak
        </td>
      </tr>
      <tr>
        <td class="col-no">28</td>
        <td class="col-param">Kesepakatan Waktu Pelaksanaan Migrasi</td>
        <td class="col-colon">:</td>
        <td class="col-val">${data.item28_waktuMigrasi}</td>
      </tr>
      <tr>
        <td class="col-no">29</td>
        <td class="col-param">PIC Migrasi</td>
        <td class="col-colon">:</td>
        <td class="col-val">${picHtml}</td>
      </tr>
      <tr>
        <td class="col-no">30</td>
        <td class="col-param">Catatan / Komitmen CAB</td>
        <td class="col-colon">:</td>
        <td class="col-val">${catatanHtml}</td>
      </tr>
    </tbody>
  </table>
  <div class="footnote">Note: Dokumen kelengkapan sesuai checklist harap dibawa saat pelaksanaan CAB.</div>

  <!-- 2. Bagian Tengah: Bukti Lampiran -->
  <div class="evidence-box">
    <div class="evidence-header">${payload.evidence.headerTitle || "COMMITE ADVISORY BOARD"}</div>
    <div class="evidence-content">
      ${payload.evidence.imageUrl ? `<img src="${payload.evidence.imageUrl}" class="evidence-img" alt="Bukti Sidang CAB" />` : '<div style="color: #666; font-style: italic; padding: 15px;">[ Bukti Screenshot Rapat / Verifikasi Dokumen Kepatuhan Terlampir ]</div>'}
      ${payload.evidence.caption ? `<div class="evidence-caption">${payload.evidence.caption}</div>` : ""}
    </div>
  </div>

  <!-- 3. Bagian Bawah: Blok Tanda Tangan -->
  <div class="signature-container">
    <div class="signature-block">
      <div class="signature-date">${payload.signature.city}, ${payload.signature.dateFormatted}</div>
      <div class="signature-space">
        ${payload.signature.signatureImageUrl ? `<img src="${payload.signature.signatureImageUrl}" class="signature-img" alt="Tanda Tangan" />` : ""}
      </div>
      <div class="signer-name">${payload.signature.signerName}</div>
      <div class="signer-role">${payload.signature.signerRole}</div>
      ${payload.signature.signerNip ? `<div class="signer-nip">${payload.signature.signerNip}</div>` : ""}
    </div>
  </div>
</body>
</html>`;
}

// ─── Image Loader Helper ──────────────────────────────────────────────────────

async function loadImageDataUri(src: string): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:image/")) return src;
  try {
    const res = await fetch(src);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// ─── Direct jsPDF Generator ───────────────────────────────────────────────────

export async function exportCabComplianceChecklistPdf(
  item: CabRequestDetail | CabRequestItem,
  customEvidence?: CabEvidencePayload,
  customSignature?: CabSignaturePayload
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const payload = adaptCabToCompliancePdfPayload(item, customEvidence, customSignature);
  const data = payload.checklistData;

  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 12;
  const contentW = pageW - marginX * 2;

  const cb = (checked: boolean) => (checked ? CHECKED : UNCHECKED);

  // ── 1. Bagian Atas: Tabel Checklist 30 Item ────────────────────────────────
  const tableRows: any[][] = [
    ["1", "Hari / Tanggal", ":", data.item1_hariTanggal],
    ["2", "Nama Aplikasi", ":", data.item2_namaAplikasi],
    ["3", "Nomor RFC / Kode Project", ":", data.item3_nomorRfc],
    ["4", "Kode ITSP", ":", data.item4_kodeItsp],
    ["5", "SAST", ":", `${cb(data.isSastAda)} Ada     ${cb(!data.isSastAda)} Tidak Ada`],
    ["6", "Kategori Aplikasi", ":", `${cb(data.kategori.isMonitoring)} Monitoring   ${cb(data.kategori.isTransaksional)} Transaksional   ${cb(data.kategori.isRegulatory)} Regulatory   ${cb(data.kategori.isPelaporan)} Pelaporan`],
    ["7", "Jenis CAB", ":", `${cb(!data.jenisCab.isEmergency)} Normal CAB     ${cb(data.jenisCab.isEmergency)} Emergency CAB ${data.jenisCab.isEmergency ? `(Alasan: ${data.jenisCab.emergencyAlasan})` : ""}`],
    ["8", "Hasil UAT", ":", `${cb(data.hasilUat.isUatBaik)} Berhasil Baik   ${cb(data.hasilUat.isUatCatatan)} Berhasil (Catatan)   ${cb(data.hasilUat.isUatTidak)} Tidak Berhasil`],
    ["9", "Deskripsi Penilaian UAT", ":", data.item9_deskripsiUat],
    ["10", "Rekomendasi UAT", ":", `${cb(data.rekomendasiUat.isRekMigrasi)} Rekomendasi Migrasi     ${cb(!data.rekomendasiUat.isRekMigrasi)} Pengujian Ulang`],
    ["11", "Tanggal Permohonan Migrasi", ":", data.item11_tglPermohonan],
    ["12", "Ceklist Migrasi / Petunjuk Instalasi / Rundown", ":", `${cb(data.isCeklistAda)} Ada     ${cb(!data.isCeklistAda)} Tidak Ada`],
    ["13", "Downtime", ":", `${cb(!data.downtime.hasDowntime)} Tidak Ada     ${cb(data.downtime.hasDowntime)} Ada ${data.downtime.hasDowntime ? `(Durasi: ${data.downtime.downtimeDurasi})` : ""}`],
    ["14", "Risiko Konflik dg Program Lain", ":", `${cb(data.risikoKonflik.hasRisiko)} Ada ${data.risikoKonflik.hasRisiko ? `(Aplikasi: ${data.risikoKonflik.risikoAplikasi})` : ""}     ${cb(!data.risikoKonflik.hasRisiko)} Tidak Ada`],
    ["15", "Instalasi Area DRC", ":", `${cb(data.isDrcYa)} Ya     ${cb(!data.isDrcYa)} Tidak`],
    ["16", "Dokumen Arsitektur", ":", `${cb(data.isArsitekturAda)} Ada     ${cb(!data.isArsitekturAda)} Tidak Ada`],
    ["17", "Kesiapan Infrastruktur", ":", `${cb(data.isInfrastrukturYa)} Ya     ${cb(!data.isInfrastrukturYa)} Tidak`],
    ["18", "Source Aplikasi", ":", `${cb(data.isSourceAda)} Ada     ${cb(!data.isSourceAda)} Tidak Ada`],
    ["19", "User Matriks", ":", `${cb(data.isUserMatriksAda)} Ada     ${cb(!data.isUserMatriksAda)} Tidak Ada`],
    ["20", "Rollback / Fallback Plan", ":", `${cb(data.isRollbackAda)} Ada     ${cb(!data.isRollbackAda)} Tidak Ada`],
    ["21", "Tools / Cara Monitoring", ":", `${cb(data.isMonitoringAda)} Ada     ${cb(!data.isMonitoringAda)} Tidak Ada`],
    ["22", "Security Checklist", ":", `${cb(data.isSecurityAda)} Ada     ${cb(!data.isSecurityAda)} Tidak Ada`],
    ["23", "Persetujuan Divisi IT Security", ":", `${cb(data.securityApprove.isSecurityApproveYa)} Ya     ${cb(!data.securityApprove.isSecurityApproveYa)} Tidak ${!data.securityApprove.isSecurityApproveYa ? `(Penjelasan: ${data.securityApprove.securityAlasan})` : ""}`],
    ["24", "Petunjuk Teknis / Manual Produk", ":", `${cb(data.isJuknisAda)} Ada     ${cb(!data.isJuknisAda)} Tidak Ada`],
    ["25", "Pelaksanaan PIR", ":", data.item25_pir],
    ["26", "Ketersediaan Waktu Migrasi Data Center", ":", data.item26_dc],
    ["27", "Keputusan Migrasi", ":", `${cb(data.isApproved)} Ya     ${cb(!data.isApproved)} Tidak`],
    ["28", "Kesepakatan Waktu Pelaksanaan Migrasi", ":", data.item28_waktuMigrasi],
    ["29", "PIC Migrasi", ":", data.picText],
    ["30", "Catatan / Komitmen CAB", ":", data.catatanText],
  ];

  autoTable(doc, {
    startY: 8,
    margin: { left: marginX, right: marginX },
    head: [[{
      content: payload.documentTitle,
      colSpan: 4,
      styles: {
        halign: "center",
        fillColor: [224, 224, 224],
        textColor: [0, 0, 0],
        fontStyle: "bold",
        fontSize: 7.8,
        cellPadding: 1.8,
      },
    }]],
    body: tableRows,
    theme: "grid",
    styles: {
      fontSize: 6.5,
      cellPadding: 1.1,
      textColor: [0, 0, 0],
      lineColor: [180, 180, 180],
      lineWidth: 0.15,
      overflow: "linebreak",
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 63, fontStyle: "bold" },
      2: { cellWidth: 3, halign: "center" },
      3: { cellWidth: contentW - 73 },
    },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 2;

  // Footnote
  doc.setFont("helvetica", "italic");
  doc.setFontSize(5.8);
  doc.setTextColor(80, 80, 80);
  doc.text("Note: Dokumen kelengkapan sesuai checklist harap dibawa saat pelaksanaan CAB.", marginX, currentY);
  currentY += 3.5;

  // Check if remaining space is sufficient for Section 2 & 3 or add page
  const remainingSpace = pageH - currentY - 10;
  if (remainingSpace < 65) {
    doc.addPage();
    currentY = 12;
  }

  // ── 2. Bagian Tengah: Lampiran Bukti (Evidence Box) ─────────────────────────
  const boxW = contentW;
  const boxHeaderH = 5;
  const boxContentH = 34;

  doc.setFillColor(224, 224, 224);
  doc.rect(marginX, currentY, boxW, boxHeaderH, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(0, 0, 0);
  doc.text(payload.evidence.headerTitle || "COMMITE ADVISORY BOARD", marginX + boxW / 2, currentY + 3.6, { align: "center" });

  doc.setFillColor(255, 255, 255);
  doc.rect(marginX, currentY + boxHeaderH, boxW, boxContentH, "FD");

  let imageRendered = false;
  if (payload.evidence.imageUrl) {
    try {
      const dataUri = await loadImageDataUri(payload.evidence.imageUrl);
      if (dataUri) {
        const imgFormat = dataUri.includes("png") ? "PNG" : "JPEG";
        const maxImgW = boxW - 10;
        const maxImgH = boxContentH - 6;
        const imgX = marginX + (boxW - maxImgW) / 2;
        const imgY = currentY + boxHeaderH + 2;
        doc.addImage(dataUri, imgFormat, imgX, imgY, maxImgW, maxImgH, undefined, "FAST");
        imageRendered = true;
      }
    } catch {
      imageRendered = false;
    }
  }

  if (!imageRendered) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("[ Bukti Screenshot Rapat / Verifikasi Dokumen Kepatuhan Terlampir ]", marginX + boxW / 2, currentY + boxHeaderH + boxContentH / 2, { align: "center" });
  }

  currentY += boxHeaderH + boxContentH + 3.5;

  // ── 3. Bagian Bawah: Blok Tanda Tangan (Tengah Kertas & Spasi Kosong untuk TTD Manual Pena) ──
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.2);
  doc.setTextColor(0, 0, 0);
  doc.text(`${payload.signature.city}, ${payload.signature.dateFormatted}`, pageW / 2, currentY, { align: "center" });

  currentY += 2.5;

  if (payload.signature.signatureImageUrl) {
    try {
      const sigDataUri = await loadImageDataUri(payload.signature.signatureImageUrl);
      if (sigDataUri) {
        const sigFormat = sigDataUri.includes("png") ? "PNG" : "JPEG";
        const sigW = 35;
        doc.addImage(sigDataUri, sigFormat, pageW / 2 - sigW / 2, currentY, sigW, 14, undefined, "FAST");
      }
    } catch {
      // no-op
    }
  }

  // Spasi kosong untuk tanda tangan offline menggunakan pulpen
  currentY += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(0, 0, 0);
  doc.text(payload.signature.signerName, pageW / 2, currentY, { align: "center" });

  const nameWidth = doc.getTextWidth(payload.signature.signerName);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(pageW / 2 - nameWidth / 2, currentY + 0.6, pageW / 2 + nameWidth / 2, currentY + 0.6);

  currentY += 3.2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(50, 50, 50);
  doc.text(payload.signature.signerRole, pageW / 2, currentY, { align: "center" });

  if (payload.signature.signerNip) {
    currentY += 2.8;
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    doc.text(`NIP. ${payload.signature.signerNip}`, pageW / 2, currentY, { align: "center" });
  }

  // File Download Save
  const safeTitle = (item.projectName || item.requestTitle || "Dokumen")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 30);
  const safeNo = (item.requestNo || "CAB").replace(/[^a-zA-Z0-9_-]/g, "_");
  doc.save(`Compliance_Checklist_CAB_${safeNo}_${safeTitle}.pdf`);
}

// ─── Bulk PDF Export (Per Period) ─────────────────────────────────────────────

export async function exportCabComplianceChecklistBulkPdf(
  items: (CabRequestDetail | CabRequestItem)[],
  periodLabel: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF("p", "mm", "a4");
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 12;
  const contentW = pageW - marginX * 2;
  const cb = (checked: boolean) => (checked ? CHECKED : UNCHECKED);

  for (let i = 0; i < items.length; i++) {
    if (i > 0) doc.addPage();

    const item = items[i];
    const payload = adaptCabToCompliancePdfPayload(item);
    const data = payload.checklistData;

    const tableRows: any[][] = [
      ["1", "Hari / Tanggal", ":", data.item1_hariTanggal],
      ["2", "Nama Aplikasi", ":", data.item2_namaAplikasi],
      ["3", "Nomor RFC / Kode Project", ":", data.item3_nomorRfc],
      ["4", "Kode ITSP", ":", data.item4_kodeItsp],
      ["5", "SAST", ":", `${cb(data.isSastAda)} Ada     ${cb(!data.isSastAda)} Tidak Ada`],
      ["6", "Kategori Aplikasi", ":", `${cb(data.kategori.isMonitoring)} Monitoring   ${cb(data.kategori.isTransaksional)} Transaksional   ${cb(data.kategori.isRegulatory)} Regulatory   ${cb(data.kategori.isPelaporan)} Pelaporan`],
      ["7", "Jenis CAB", ":", `${cb(!data.jenisCab.isEmergency)} Normal CAB     ${cb(data.jenisCab.isEmergency)} Emergency CAB ${data.jenisCab.isEmergency ? `(Alasan: ${data.jenisCab.emergencyAlasan})` : ""}`],
      ["8", "Hasil UAT", ":", `${cb(data.hasilUat.isUatBaik)} Berhasil Baik   ${cb(data.hasilUat.isUatCatatan)} Berhasil (Catatan)   ${cb(data.hasilUat.isUatTidak)} Tidak Berhasil`],
      ["9", "Deskripsi Penilaian UAT", ":", data.item9_deskripsiUat],
      ["10", "Rekomendasi UAT", ":", `${cb(data.rekomendasiUat.isRekMigrasi)} Rekomendasi Migrasi     ${cb(!data.rekomendasiUat.isRekMigrasi)} Pengujian Ulang`],
      ["11", "Tanggal Permohonan Migrasi", ":", data.item11_tglPermohonan],
      ["12", "Ceklist Migrasi / Petunjuk Instalasi / Rundown", ":", `${cb(data.isCeklistAda)} Ada     ${cb(!data.isCeklistAda)} Tidak Ada`],
      ["13", "Downtime", ":", `${cb(!data.downtime.hasDowntime)} Tidak Ada     ${cb(data.downtime.hasDowntime)} Ada ${data.downtime.hasDowntime ? `(Durasi: ${data.downtime.downtimeDurasi})` : ""}`],
      ["14", "Risiko Konflik dg Program Lain", ":", `${cb(data.risikoKonflik.hasRisiko)} Ada ${data.risikoKonflik.hasRisiko ? `(Aplikasi: ${data.risikoKonflik.risikoAplikasi})` : ""}     ${cb(!data.risikoKonflik.hasRisiko)} Tidak Ada`],
      ["15", "Instalasi Area DRC", ":", `${cb(data.isDrcYa)} Ya     ${cb(!data.isDrcYa)} Tidak`],
      ["16", "Dokumen Arsitektur", ":", `${cb(data.isArsitekturAda)} Ada     ${cb(!data.isArsitekturAda)} Tidak Ada`],
      ["17", "Kesiapan Infrastruktur", ":", `${cb(data.isInfrastrukturYa)} Ya     ${cb(!data.isInfrastrukturYa)} Tidak`],
      ["18", "Source Aplikasi", ":", `${cb(data.isSourceAda)} Ada     ${cb(!data.isSourceAda)} Tidak Ada`],
      ["19", "User Matriks", ":", `${cb(data.isUserMatriksAda)} Ada     ${cb(!data.isUserMatriksAda)} Tidak Ada`],
      ["20", "Rollback / Fallback Plan", ":", `${cb(data.isRollbackAda)} Ada     ${cb(!data.isRollbackAda)} Tidak Ada`],
      ["21", "Tools / Cara Monitoring", ":", `${cb(data.isMonitoringAda)} Ada     ${cb(!data.isMonitoringAda)} Tidak Ada`],
      ["22", "Security Checklist", ":", `${cb(data.isSecurityAda)} Ada     ${cb(!data.isSecurityAda)} Tidak Ada`],
      ["23", "Persetujuan Divisi IT Security", ":", `${cb(data.securityApprove.isSecurityApproveYa)} Ya     ${cb(!data.securityApprove.isSecurityApproveYa)} Tidak ${!data.securityApprove.isSecurityApproveYa ? `(Penjelasan: ${data.securityApprove.securityAlasan})` : ""}`],
      ["24", "Petunjuk Teknis / Manual Produk", ":", `${cb(data.isJuknisAda)} Ada     ${cb(!data.isJuknisAda)} Tidak Ada`],
      ["25", "Pelaksanaan PIR", ":", data.item25_pir],
      ["26", "Ketersediaan Waktu Migrasi Data Center", ":", data.item26_dc],
      ["27", "Keputusan Migrasi", ":", `${cb(data.isApproved)} Ya     ${cb(!data.isApproved)} Tidak`],
      ["28", "Kesepakatan Waktu Pelaksanaan Migrasi", ":", data.item28_waktuMigrasi],
      ["29", "PIC Migrasi", ":", data.picText],
      ["30", "Catatan / Komitmen CAB", ":", data.catatanText],
    ];

    autoTable(doc, {
      startY: 8,
      margin: { left: marginX, right: marginX },
      head: [[{
        content: payload.documentTitle,
        colSpan: 4,
        styles: {
          halign: "center",
          fillColor: [224, 224, 224],
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 7.8,
          cellPadding: 1.8,
        },
      }]],
      body: tableRows,
      theme: "grid",
      styles: {
        fontSize: 6.5,
        cellPadding: 1.1,
        textColor: [0, 0, 0],
        lineColor: [180, 180, 180],
        lineWidth: 0.15,
        overflow: "linebreak",
      },
      columnStyles: {
        0: { cellWidth: 7, halign: "center", fontStyle: "bold" },
        1: { cellWidth: 63, fontStyle: "bold" },
        2: { cellWidth: 3, halign: "center" },
        3: { cellWidth: contentW - 73 },
      },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 2;

    // Footnote
    doc.setFont("helvetica", "italic");
    doc.setFontSize(5.8);
    doc.setTextColor(80, 80, 80);
    doc.text("Note: Dokumen kelengkapan sesuai checklist harap dibawa saat pelaksanaan CAB.", marginX, currentY);
    currentY += 3.5;

    // Check if remaining space is sufficient for Section 2 & 3 or add page
    const remainingSpace = pageH - currentY - 10;
    if (remainingSpace < 70) {
      doc.addPage();
      currentY = 12;
    }

    // Evidence Box
    const boxW = contentW;
    const boxHeaderH = 5;
    const boxContentH = 34;
    doc.setFillColor(224, 224, 224);
    doc.rect(marginX, currentY, boxW, boxHeaderH, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(0, 0, 0);
    doc.text(payload.evidence.headerTitle || "COMMITE ADVISORY BOARD", marginX + boxW / 2, currentY + 3.6, { align: "center" });

    doc.setFillColor(255, 255, 255);
    doc.rect(marginX, currentY + boxHeaderH, boxW, boxContentH, "FD");
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text("[ Bukti Screenshot Rapat / Verifikasi Dokumen Kepatuhan Terlampir ]", marginX + boxW / 2, currentY + boxHeaderH + boxContentH / 2, { align: "center" });

    currentY += boxHeaderH + boxContentH + 3.5;

    // ── Signature Block (Tengah Kertas & Spasi Kosong untuk TTD Manual Pena) ──
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(0, 0, 0);
    doc.text(`${payload.signature.city}, ${payload.signature.dateFormatted}`, pageW / 2, currentY, { align: "center" });

    currentY += 2.5;

    // Spasi kosong untuk tanda tangan manual / offline dengan pulpen
    currentY += 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text(payload.signature.signerName, pageW / 2, currentY, { align: "center" });

    const nameWidth = doc.getTextWidth(payload.signature.signerName);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.line(pageW / 2 - nameWidth / 2, currentY + 0.6, pageW / 2 + nameWidth / 2, currentY + 0.6);

    currentY += 3.2;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.8);
    doc.setTextColor(50, 50, 50);
    doc.text(payload.signature.signerRole, pageW / 2, currentY, { align: "center" });

    if (payload.signature.signerNip) {
      currentY += 2.8;
      doc.setFontSize(6);
      doc.setTextColor(100, 100, 100);
      doc.text(`NIP. ${payload.signature.signerNip}`, pageW / 2, currentY, { align: "center" });
    }
  }

  const safePeriod = periodLabel.replace(/[\/\\]/g, "_");
  doc.save(`Compliance_Checklist_CAB_Periode_${safePeriod}.pdf`);
}
