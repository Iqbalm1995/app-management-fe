// src/app/services/useCabRequest.ts
"use client";

import { useState } from "react";
import { DELAY_LOW } from "../constants/applicationConstants";
import { MOCK_CAB_LIST, MOCK_CAB_DETAIL, DEFAULT_CAB_ACTIVITIES, getDynamicCabActivities } from "../json/cabRequestMock";
import {
  ApproveCabPayload,
  BulkScheduleCabItemPayload,
  BulkScheduleCabPayload,
  CabActivityItem,
  CabCategory,
  CabCommitteeMember,
  CabFormData,
  CabPicInternalIT,
  CabRequestDetail,
  CabRequestItem,
  CreateCabRequestPayload,
  ScheduleCabPayload,
  UpdateCabResultPayload,
} from "../types/cabTypes";

interface CabListResponse {
  data: CabRequestItem[];
  countTotal: number;
}

interface CabDetailResponse {
  data: CabRequestDetail | null;
}

/**
 * Generates a CAB Request Number in format: {NNNN}/CAB/{MM}/{YYYY}
 * where NNNN is a 4-digit sequence number that resets to 0001 each month.
 *
 * Example:
 * - 0001/CAB/08/2026
 * - 0002/CAB/08/2026
 * - 0001/CAB/09/2026 (resets at new month)
 */
export const generateCabRequestNo = (
  dateInput?: Date | string,
  existingList: CabRequestItem[] = MOCK_CAB_LIST
): string => {
  const date = dateInput ? new Date(dateInput) : new Date();
  const validDate = isNaN(date.getTime()) ? new Date() : date;

  const mm = String(validDate.getMonth() + 1).padStart(2, "0");
  const yyyy = String(validDate.getFullYear());
  const monthYearSuffix = `/CAB/${mm}/${yyyy}`;

  let maxSeq = 0;

  existingList.forEach((item) => {
    if (!item.requestNo) return;

    // Match format: {NNNN}/CAB/{MM}/{YYYY}
    const match = item.requestNo.match(/^(\d{4})\/CAB\/(\d{2})\/(\d{4})$/i);
    if (match) {
      const itemSeq = parseInt(match[1], 10);
      const itemMm = match[2];
      const itemYyyy = match[3];
      if (itemMm === mm && itemYyyy === yyyy) {
        if (!isNaN(itemSeq) && itemSeq > maxSeq) {
          maxSeq = itemSeq;
        }
      }
    }
  });

  const nextSeq = maxSeq + 1;
  const seqStr = String(nextSeq).padStart(4, "0");

  return `${seqStr}${monthYearSuffix}`;
};

const useCabRequest = () => {
  const [loading, setLoading] = useState(false);

  const ListCabRequests = async (
    _token: string,
    params?: { status?: string; search?: string }
  ): Promise<CabListResponse | null> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        let result = [...MOCK_CAB_LIST];
        if (params?.status && params.status !== "ALL") {
          result = result.filter((r) => r.status === params.status);
        }
        if (params?.search) {
          const s = params.search.toLowerCase();
          result = result.filter(
            (r) =>
              r.requestTitle.toLowerCase().includes(s) ||
              r.requestNo.toLowerCase().includes(s) ||
              r.requesterName.toLowerCase().includes(s) ||
              r.projectName.toLowerCase().includes(s)
          );
        }
        setLoading(false);
        resolve({ data: result, countTotal: result.length });
      }, DELAY_LOW);
    });
  };

  const GetCabRequestById = async (
    _token: string,
    id: string
  ): Promise<CabDetailResponse | null> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        let detail = MOCK_CAB_DETAIL[id];
        if (!detail) {
          const listItem = MOCK_CAB_LIST.find((r) => r.id === id);
          if (listItem) {
            detail = {
              ...listItem,
              category: ((listItem.category as CabCategory) || (listItem.requestType?.toUpperCase().includes("INFRA") ? "HARDWARE" : "SOFTWARE")) as CabCategory,
              requesterEmail: "user@bjb.co.id",
              description: "Permohonan CAB untuk implementasi dan deployment perubahan sistem.",
              impactAnalysis: "Sistem akan mengalami controlled downtime sekitar 60 menit pada periode maintenance window non-operasional (01:00 - 02:00 WIB).",
              rollbackPlan: "Rollback ke snapshot VM/DB sebelum deployment. Estimasi waktu rollback: 15 menit.",
              approvalHistory: [],
              activityChecklist: getDynamicCabActivities(listItem as any),
            };
            MOCK_CAB_DETAIL[id] = detail;
          }
        }

        if (detail) {
          // Fill default rich form details if missing
          const defaultDetail: Partial<CabRequestDetail> = {
            category: detail.requestType?.toUpperCase().includes("INFRA") || detail.requestType?.toUpperCase().includes("HARDWARE") ? "HARDWARE" : "SOFTWARE",
            rfcKodeProject: detail.rfcKodeProject || "RFC-2026-088",
            itspKode: detail.itspKode || "ITSP-BJB-990",
            aplikasiKategori: detail.aplikasiKategori || "CORE_BANKING",
            jenisCab: detail.jenisCab || "WEEKLY",
            jenisCabEmergencyAlasan: detail.jenisCabEmergencyAlasan || "",
            hasilUat: detail.hasilUat || ["BERHASIL_BAIK"],
            rekomendasiUat: detail.rekomendasiUat || "REKOMENDASI_MIGRASI",
            tanggalPermohonanMigrasi: detail.tanggalPermohonanMigrasi || detail.targetDate || "2026-08-22",
            ceklistMigrasiRundown: detail.ceklistMigrasiRundown || "1. Backup database snapshot (01:00)\n2. Stop service gateway (01:30)\n3. Deploy release binary (01:45)\n4. Database migration script (02:00)\n5. Smoke test & health check (02:20)\n6. Start traffic routing (02:30)",
            downtime: detail.downtime || "ADA",
            downtimeDurasi: detail.downtimeDurasi || "60 Menit",
            risikoKonflik: detail.risikoKonflik || "TIDAK_ADA",
            instalasiAreaDrc: detail.instalasiAreaDrc || "YA",
            sast: detail.sast || "ADA",
            dokumenArsitektur: detail.dokumenArsitektur || "ADA",
            dokumenArsitekturLink: detail.dokumenArsitekturLink || "https://wiki.bjb.co.id/arch/rfc-2026",
            kesiapanInfrastruktur: detail.kesiapanInfrastruktur || "YA",
            sourceAplikasi: detail.sourceAplikasi || "ADA",
            userMatriks: detail.userMatriks || "ADA",
            toolsMonitoring: detail.toolsMonitoring || "ADA",
            securityChecklist: detail.securityChecklist || "ADA",
            persetujuanItSecurity: detail.persetujuanItSecurity || "YA",
            persetujuanItSecurityAlasan: detail.persetujuanItSecurityAlasan || "",
            petunjukTeknis: detail.petunjukTeknis || "ADA",
            picMigrasi: detail.picMigrasi || {
              type: "INTERNAL_IT",
              userId: "usr-01",
              userName: detail.requesterName || "Iqbal Maulana",
              divisi: "Divisi IT Digital Banking",
            },
            committeeCab: detail.committeeCab && detail.committeeCab.length > 0 ? detail.committeeCab : [
              { type: "INTERNAL_IT", userName: "Ahmad Fauzi", asalDivisi: "Divisi IT Architecture" },
              { type: "INTERNAL_BJB", userName: "Budi Santoso", asalDivisi: "Divisi IT Operations" },
              { type: "INTERNAL_BJB", userName: "Refan Hidayat", asalDivisi: "Divisi Risk Management" },
            ],
            isCabDone: detail.isCabDone || "N",
            activityChecklist: getDynamicCabActivities(detail, detail.activityChecklist),
          };

          const mergedDetail: CabRequestDetail = { ...defaultDetail, ...detail } as CabRequestDetail;
          MOCK_CAB_DETAIL[id] = mergedDetail;

          setLoading(false);
          resolve({ data: mergedDetail });
          return;
        }

        setLoading(false);
        resolve({ data: null });
      }, DELAY_LOW);
    });
  };

  const GetCabCalendar = async (
    _token: string
  ): Promise<CabListResponse | null> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // DRAFT must NEVER show on calendar
        const scheduled = MOCK_CAB_LIST.filter(
          (r) => r.scheduledDate !== null && r.status !== "DRAFT"
        );
        setLoading(false);
        resolve({ data: scheduled, countTotal: scheduled.length });
      }, DELAY_LOW);
    });
  };

  const GetPendingApprovals = async (
    _token: string
  ): Promise<CabListResponse | null> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const pending = MOCK_CAB_LIST.filter(
          (r) => r.status === "WAITING APPROVAL" || r.status === "WAITING APPROVE"
        );
        setLoading(false);
        resolve({ data: pending, countTotal: pending.length });
      }, DELAY_LOW);
    });
  };

  const CreateCabRequest = async (
    _token: string,
    payload: CreateCabRequestPayload | CabFormData | Record<string, unknown>,
    isDraft?: boolean
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = `cab-${Date.now().toString().slice(-4)}`;
        const formPayload = payload as any;
        const requestDateStr = new Date().toISOString().slice(0, 10);
        const reqNo = generateCabRequestNo(requestDateStr, MOCK_CAB_LIST);
        const isSw = formPayload.category === "SOFTWARE";
        const isHw = formPayload.category === "HARDWARE";

        let requestTitle = formPayload.requestTitle || "New CAB Request";
        let requestType = formPayload.requestType || "DEPLOYMENT";
        let projectName = formPayload.projectName || "Core Banking";
        let requestedCabDate: string | null = null;
        let targetDate = formPayload.targetDate || new Date().toISOString().slice(0, 10);
        let description = formPayload.description || "Permohonan CAB untuk implementasi perubahan sistem.";
        let impactAnalysis = formPayload.impactAnalysis || "-";
        let rollbackPlan = formPayload.rollbackPlan || "-";
        let downtime: "TIDAK" | "ADA" | "" = "ADA";
        let downtimeDurasi = "60 Menit";
        let risikoKonflik: "ADA" | "TIDAK_ADA" | "" = "TIDAK_ADA";
        let instalasiAreaDrc: "YA" | "TIDAK" | "" = "YA";
        let ceklistMigrasiRundown = "1. Backup snapshot\n2. Deploy binary\n3. Smoke test";
        let hasilUat: ("BERHASIL_BAIK" | "BERHASIL_CATATAN" | "TIDAK_BERHASIL")[] = ["BERHASIL_BAIK"];
        let rekomendasiUat: "REKOMENDASI_MIGRASI" | "PENGUJIAN_ULANG" | "" = "REKOMENDASI_MIGRASI";
        let picMigrasi: CabPicInternalIT[] = [{ type: "INTERNAL_IT", userId: "usr-01", userName: "Iqbal Maulana", divisi: "Divisi IT Digital Banking" }];
        let committeeCab: CabCommitteeMember[] = [
          { type: "INTERNAL_IT", userName: "Ahmad Fauzi", asalDivisi: "Divisi IT Architecture" },
          { type: "INTERNAL_BJB", userName: "Budi Santoso", asalDivisi: "Divisi IT Operations" },
        ];

        if (isSw && formPayload.step1) {
          requestTitle = formPayload.step1.applicationName || requestTitle;
          requestType = formPayload.step1.tipeCab || formPayload.step1.aplikasiKategori || requestType;
          projectName = formPayload.step1.applicationName || projectName;
          requestedCabDate = formPayload.step1.requestedCabDate || null;
          targetDate = formPayload.step2?.tanggalPermohonanMigrasi || formPayload.step1.dayDate || targetDate;
          description = `Implementasi perubahan software pada aplikasi ${formPayload.step1.applicationName}. RFC: ${formPayload.step1.rfcKodeProject || "-"}, ITSP: ${formPayload.step1.itspKode || "-"}.`;
          impactAnalysis = formPayload.step3?.downtime === "ADA"
            ? `Terdapat estimasi downtime berdurasi ${formPayload.step3.downtimeDurasi || "60 Menit"}. Risiko konflik: ${formPayload.step3.risikoKonflik || "TIDAK_ADA"}.`
            : "Zero-downtime implementation.";
          rollbackPlan = formPayload.step4?.rollbackPlan === "ADA"
            ? "Rencana rollback tersedia melalui restore snapshot database & binary aplikasi versi sebelumnya."
            : "-";
          downtime = formPayload.step3?.downtime || "ADA";
          downtimeDurasi = formPayload.step3?.downtimeDurasi || "60 Menit";
          risikoKonflik = formPayload.step3?.risikoKonflik || "TIDAK_ADA";
          instalasiAreaDrc = formPayload.step3?.instalasiAreaDrc || "YA";
          ceklistMigrasiRundown = formPayload.step3?.ceklistMigrasiRundown || ceklistMigrasiRundown;
          hasilUat = formPayload.step2?.hasilUat || ["BERHASIL_BAIK"];
          rekomendasiUat = formPayload.step2?.rekomendasiUat || "REKOMENDASI_MIGRASI";
          if (formPayload.step5?.picMigrasi) picMigrasi = formPayload.step5.picMigrasi;
          if (formPayload.step5?.committeeCab) committeeCab = formPayload.step5.committeeCab;
        } else if (isHw && formPayload.step1) {
          requestTitle = formPayload.step1.namaHardware || requestTitle;
          requestType = formPayload.step1.kodeProjectType || "INFRASTRUCTURE";
          projectName = formPayload.step1.kodeProject || "Hardware & Infra";
          requestedCabDate = formPayload.step1.requestedCabDate || null;
          targetDate = formPayload.step2?.tanggalPermohonanImplementasi || formPayload.step1.dayDate || targetDate;
          description = formPayload.step1.deskripsiPerubahan || description;
          impactAnalysis = formPayload.step1.dampakOperasional || impactAnalysis;
          rollbackPlan = formPayload.step3?.rollbackPlan === "ADA" ? "Rencana rollback konfigurasi hardware & fallback cluster siap." : "-";
          if (formPayload.step4?.picMigrasi) picMigrasi = formPayload.step4.picMigrasi;
          if (formPayload.step4?.committeeCab) committeeCab = formPayload.step4.committeeCab;
        }

        const newItem: CabRequestItem = {
          id,
          requestNo: reqNo,
          requestTitle,
          requestType,
          requestDate: new Date().toISOString().slice(0, 10),
          targetDate,
          requestedCabDate,
          scheduledDate: null,
          scheduledEndDate: null,
          status: isDraft ? "DRAFT" : "REQUEST",
          requesterName: "Iqbal Maulana",
          approverName: "Ahmad Fauzi",
          projectName,
        };

        MOCK_CAB_LIST.unshift(newItem);
        const newDetail: CabRequestDetail = {
          ...newItem,
          category: isHw ? "HARDWARE" : "SOFTWARE",
          tipeCab: isSw ? formPayload.step1?.tipeCab : undefined,
          appSide: isSw ? formPayload.step1?.appSide : undefined,
          appSideOther: isSw ? formPayload.step1?.appSideOther : undefined,
          applications: isSw ? formPayload.step1?.applications || [] : undefined,
          requesterEmail: "iqbal.maulana@bjb.co.id",
          description,
          impactAnalysis,
          rollbackPlan,
          downtime,
          downtimeDurasi,
          risikoKonflik,
          risikoKonflikAplikasi: isSw ? formPayload.step3?.risikoKonflikAplikasi || [] : [],
          instalasiAreaDrc,
          ceklistMigrasi: isSw ? formPayload.step3?.ceklistMigrasi || "ADA" : "ADA",
          ceklistMigrasiFile: isSw ? (typeof formPayload.step3?.ceklistMigrasiFile === "string" ? formPayload.step3?.ceklistMigrasiFile : formPayload.step3?.ceklistMigrasiFile?.name) : null,
          ceklistMigrasiRundown,
          hasilUat,
          hasilUatCatatan: isSw ? formPayload.step2?.hasilUatCatatan || "" : "",
          rekomendasiUat,
          isHaveMemo: isSw ? formPayload.step2?.isHaveMemo || "Y" : "Y",
          perihalSementara: isSw ? formPayload.step2?.perihalSementara || "" : "",
          memoDirektoratPengirim: isSw ? formPayload.step2?.memoDirektoratPengirim || "Direktorat IT & Operasional" : "",
          memoDivisiPengirim: isSw ? formPayload.step2?.memoDivisiPengirim || "Divisi IT Digital Banking" : "",
          memoNomor: isSw ? formPayload.step2?.memoNomor || "" : "",
          memoPerihal: isSw ? (formPayload.step2?.isHaveMemo === "N" ? formPayload.step2?.perihalSementara || "" : formPayload.step2?.memoPerihal || "") : "",
          memoTanggal: isSw ? formPayload.step2?.memoTanggal || "" : "",
          memoTanggalDiterima: isSw ? formPayload.step2?.memoTanggalDiterima || "" : "",
          tanggalPermohonanMigrasi: targetDate,
          sast: isSw ? formPayload.step4?.sast || "ADA" : "ADA",
          sastFile: isSw ? (typeof formPayload.step4?.sastFile === "string" ? formPayload.step4?.sastFile : formPayload.step4?.sastFile?.name) : null,
          dokumenArsitektur: isSw ? formPayload.step4?.dokumenArsitektur || "ADA" : (formPayload.step3?.dokumenArsitektur || "ADA"),
          dokumenArsitekturFile: isSw
            ? (typeof formPayload.step4?.dokumenArsitekturFile === "string" ? formPayload.step4?.dokumenArsitekturFile : formPayload.step4?.dokumenArsitekturFile?.name)
            : (typeof formPayload.step3?.dokumenArsitekturFile === "string" ? formPayload.step3?.dokumenArsitekturFile : formPayload.step3?.dokumenArsitekturFile?.name),
          dokumenArsitekturLink: isSw ? formPayload.step4?.dokumenArsitekturLink || "" : "",
          kesiapanInfrastruktur: isSw ? formPayload.step4?.kesiapanInfrastruktur || "YA" : "YA",
          kesiapanInfrastrukturFile: isSw ? (typeof formPayload.step4?.kesiapanInfrastrukturFile === "string" ? formPayload.step4?.kesiapanInfrastrukturFile : formPayload.step4?.kesiapanInfrastrukturFile?.name) : null,
          sourceAplikasi: isSw ? formPayload.step4?.sourceAplikasi || "ADA" : "ADA",
          sourceAplikasiFile: isSw ? (typeof formPayload.step4?.sourceAplikasiFile === "string" ? formPayload.step4?.sourceAplikasiFile : formPayload.step4?.sourceAplikasiFile?.name) : null,
          userMatriks: isSw ? formPayload.step4?.userMatriks || "ADA" : "ADA",
          userMatriksFile: isSw ? (typeof formPayload.step4?.userMatriksFile === "string" ? formPayload.step4?.userMatriksFile : formPayload.step4?.userMatriksFile?.name) : null,
          toolsMonitoring: isSw ? formPayload.step4?.toolsMonitoring || "ADA" : (formPayload.step3?.perangkatMonitoring || "ADA"),
          toolsMonitoringFile: isSw
            ? (typeof formPayload.step4?.toolsMonitoringFile === "string" ? formPayload.step4?.toolsMonitoringFile : formPayload.step4?.toolsMonitoringFile?.name)
            : (typeof formPayload.step3?.perangkatMonitoringFile === "string" ? formPayload.step3?.perangkatMonitoringFile : formPayload.step3?.perangkatMonitoringFile?.name),
          securityChecklist: isSw ? formPayload.step4?.securityChecklist || "ADA" : "ADA",
          securityChecklistFile: isSw ? (typeof formPayload.step4?.securityChecklistFile === "string" ? formPayload.step4?.securityChecklistFile : formPayload.step4?.securityChecklistFile?.name) : null,
          persetujuanItSecurity: isSw ? formPayload.step4?.persetujuanItSecurity || "YA" : (formPayload.step3?.persetujuanItSecurity || "YA"),
          persetujuanItSecurityAlasan: isSw ? formPayload.step4?.persetujuanItSecurityAlasan || "" : "",
          persetujuanItSecurityFile: isSw
            ? (typeof formPayload.step4?.persetujuanItSecurityFile === "string" ? formPayload.step4?.persetujuanItSecurityFile : formPayload.step4?.persetujuanItSecurityFile?.name)
            : (typeof formPayload.step3?.persetujuanItSecurityFile === "string" ? formPayload.step3?.persetujuanItSecurityFile : formPayload.step3?.persetujuanItSecurityFile?.name),
          petunjukTeknis: isSw ? formPayload.step4?.petunjukTeknis || "ADA" : "ADA",
          petunjukTeknisFile: isSw ? (typeof formPayload.step4?.petunjukTeknisFile === "string" ? formPayload.step4?.petunjukTeknisFile : formPayload.step4?.petunjukTeknisFile?.name) : null,
          picMigrasi,
          committeeCab,
          approvalHistory: [],
          activityChecklist: [],
        };
        newDetail.activityChecklist = getDynamicCabActivities(newDetail);
        MOCK_CAB_DETAIL[id] = newDetail;
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  const ScheduleCabRequest = async (
    _token: string,
    id: string,
    payload: ScheduleCabPayload
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = MOCK_CAB_LIST.findIndex((r) => r.id === id);
        if (idx !== -1) {
          MOCK_CAB_LIST[idx].scheduledDate = payload.scheduledDate;
          MOCK_CAB_LIST[idx].scheduledEndDate = payload.scheduledEndDate;
          MOCK_CAB_LIST[idx].status = "SCHEDULED";
          MOCK_CAB_LIST[idx].isCabDone = MOCK_CAB_LIST[idx].isCabDone || "N";
        }
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id].scheduledDate = payload.scheduledDate;
          MOCK_CAB_DETAIL[id].scheduledEndDate = payload.scheduledEndDate;
          MOCK_CAB_DETAIL[id].cabLocation = payload.cabLocation;
          MOCK_CAB_DETAIL[id].status = "SCHEDULED";
          MOCK_CAB_DETAIL[id].isCabDone = MOCK_CAB_DETAIL[id].isCabDone || "N";
        }
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  const BulkScheduleCabRequests = async (
    _token: string,
    payload: BulkScheduleCabPayload | BulkScheduleCabItemPayload[]
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const items = Array.isArray(payload) ? payload : payload.items;
        items.forEach((item) => {
          const idx = MOCK_CAB_LIST.findIndex((r) => r.id === item.id);
          if (idx !== -1) {
            MOCK_CAB_LIST[idx].scheduledDate = item.scheduledDate;
            MOCK_CAB_LIST[idx].scheduledEndDate = item.scheduledEndDate;
            MOCK_CAB_LIST[idx].status = "SCHEDULED";
            MOCK_CAB_LIST[idx].isCabDone = MOCK_CAB_LIST[idx].isCabDone || "N";
          }
          if (MOCK_CAB_DETAIL[item.id]) {
            MOCK_CAB_DETAIL[item.id].scheduledDate = item.scheduledDate;
            MOCK_CAB_DETAIL[item.id].scheduledEndDate = item.scheduledEndDate;
            if (item.cabLocation) {
              MOCK_CAB_DETAIL[item.id].cabLocation = item.cabLocation;
            }
            MOCK_CAB_DETAIL[item.id].status = "SCHEDULED";
            MOCK_CAB_DETAIL[item.id].isCabDone = MOCK_CAB_DETAIL[item.id].isCabDone || "N";
          }
        });
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  const ConfirmCabMeeting = async (
    _token: string,
    id: string
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = MOCK_CAB_LIST.findIndex((r) => r.id === id);
        if (idx !== -1) {
          MOCK_CAB_LIST[idx].status = "CONFIRM";
        }
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id].status = "CONFIRM";
        }
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  const SetCabImplementStatus = async (
    _token: string,
    id: string,
    isCabDone: "Y" | "N" = "Y"
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStatus = isCabDone === "Y" ? "IMPLEMENT" : "CONFIRM";
        const idx = MOCK_CAB_LIST.findIndex((r) => r.id === id);
        if (idx !== -1) {
          MOCK_CAB_LIST[idx].isCabDone = isCabDone;
          MOCK_CAB_LIST[idx].status = newStatus;
        }
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id].isCabDone = isCabDone;
          MOCK_CAB_DETAIL[id].status = newStatus;
        }
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  const SetCabDoneStatus = SetCabImplementStatus;

  const UpdateCabResult = async (
    _token: string,
    id: string,
    payload: UpdateCabResultPayload
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id].cabResult = payload.cabResult;
          MOCK_CAB_DETAIL[id].cabNotes = payload.cabNotes;
          MOCK_CAB_DETAIL[id].implementationStatus = payload.implementationStatus;
        }
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  const SendToApproval = async (
    _token: string,
    id: string
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const idx = MOCK_CAB_LIST.findIndex((r) => r.id === id);
        if (idx !== -1) {
          MOCK_CAB_LIST[idx].status = "WAITING APPROVAL";
          MOCK_CAB_LIST[idx].isCabDone = "Y";
        }
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id].status = "WAITING APPROVAL";
          MOCK_CAB_DETAIL[id].isCabDone = "Y";
        }
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  const ActionCabRequest = async (
    _token: string,
    id: string,
    payload: ApproveCabPayload
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const newStatus = payload.action === "APPROVE" ? "COMPLETED" : "REJECTED";
        const idx = MOCK_CAB_LIST.findIndex((r) => r.id === id);
        if (idx !== -1) {
          MOCK_CAB_LIST[idx].status = newStatus;
        }
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id].status = newStatus;
          MOCK_CAB_DETAIL[id].approvalHistory.push({
            id: `ap-${Date.now()}`,
            stepOrder: MOCK_CAB_DETAIL[id].approvalHistory.length + 1,
            approverName: "Ahmad Fauzi",
            approverRole: "Development Group Head",
            status: payload.action === "APPROVE" ? "COMPLETED" : "REJECTED",
            actionDate: new Date().toISOString(),
            note: payload.note || (payload.action === "APPROVE" ? "Disetujui." : "Ditolak."),
          });
        }
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  const ToggleCabActivity = async (
    _token: string,
    id: string,
    activityId: string,
    userName?: string
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const detail = MOCK_CAB_DETAIL[id];
        if (detail) {
          if (!detail.activityChecklist || detail.activityChecklist.length === 0) {
            detail.activityChecklist = DEFAULT_CAB_ACTIVITIES.map((act) => ({ ...act }));
          }
          const act = detail.activityChecklist.find((a) => a.id === activityId);
          if (act) {
            act.isDone = !act.isDone;
            act.doneAt = act.isDone ? new Date().toISOString() : null;
            act.doneBy = act.isDone ? (userName || "Scheduler") : null;
          }
        }
        setLoading(false);
        resolve(true);
      }, 50);
    });
  };

  const UpdateCabRequest = async (
    _token: string,
    id: string,
    payload: Partial<CabRequestDetail>
  ): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const listIdx = MOCK_CAB_LIST.findIndex((r) => r.id === id);
        if (listIdx !== -1) {
          MOCK_CAB_LIST[listIdx] = { ...MOCK_CAB_LIST[listIdx], ...payload };
        }
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id] = { ...MOCK_CAB_DETAIL[id], ...payload };
        }
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

  return {
    loading,
    ListCabRequests,
    GetCabRequestById,
    GetCabCalendar,
    GetPendingApprovals,
    CreateCabRequest,
    UpdateCabRequest,
    ScheduleCabRequest,
    BulkScheduleCabRequests,
    ConfirmCabMeeting,
    SetCabImplementStatus,
    SetCabDoneStatus,
    UpdateCabResult,
    SendToApproval,
    ActionCabRequest,
    ToggleCabActivity,
    generateCabRequestNo,
  };
};

export default useCabRequest;
