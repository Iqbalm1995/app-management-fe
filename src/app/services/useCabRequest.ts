// src/app/services/useCabRequest.ts
"use client";

import { useState } from "react";
import { DELAY_LOW } from "../constants/applicationConstants";
import { MOCK_CAB_LIST, MOCK_CAB_DETAIL, DEFAULT_CAB_ACTIVITIES } from "../json/cabRequestMock";
import {
  ApproveCabPayload,
  CabActivityItem,
  CabFormData,
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
        const detail = MOCK_CAB_DETAIL[id];
        if (detail) {
          if (!detail.activityChecklist || detail.activityChecklist.length === 0) {
            detail.activityChecklist = DEFAULT_CAB_ACTIVITIES.map((act) => ({ ...act }));
          }
          setLoading(false);
          resolve({ data: detail });
          return;
        }
        const listItem = MOCK_CAB_LIST.find((r) => r.id === id);
        setLoading(false);
        if (listItem) {
          const newDetail: CabRequestDetail = {
            ...listItem,
            requesterEmail: "user@bjb.co.id",
            description: "Permohonan CAB untuk implementasi perubahan sistem.",
            impactAnalysis: "Downtime terkontrol sekitar 15-30 menit pada jam non-operasional.",
            rollbackPlan: "Restore snapshot VM/DB sebelum deployment. Estimasi rollback 15 menit.",
            approvalHistory: [],
            activityChecklist: DEFAULT_CAB_ACTIVITIES.map((act) => ({ ...act })),
          };
          MOCK_CAB_DETAIL[id] = newDetail;
          resolve({ data: newDetail });
        } else {
          resolve({ data: null });
        }
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
        const pending = MOCK_CAB_LIST.filter((r) => r.status === "WAITING APPROVE");
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
        const reqNo = `CAB-2026-${String(MOCK_CAB_LIST.length + 1).padStart(3, "0")}`;
        const targetDate = (payload as any).targetDate || new Date().toISOString().slice(0, 10);
        const newItem: CabRequestItem = {
          id,
          requestNo: reqNo,
          requestTitle: (payload as any).requestTitle || "New CAB Request",
          requestType: (payload as any).requestType || "DEPLOYMENT",
          requestDate: new Date().toISOString().slice(0, 10),
          targetDate,
          requestedCabDate: (payload as any).targetDate ? `${(payload as any).targetDate}T09:00:00` : null,
          scheduledDate: null,
          scheduledEndDate: null,
          status: isDraft ? "DRAFT" : "REQUEST",
          requesterName: "Iqbal Maulana",
          approverName: "Ahmad Fauzi",
          projectName: (payload as any).projectName || "Core Banking",
        };
        MOCK_CAB_LIST.unshift(newItem);
        MOCK_CAB_DETAIL[id] = {
          ...newItem,
          requesterEmail: "iqbal.maulana@bjb.co.id",
          description: (payload as any).description || "-",
          impactAnalysis: (payload as any).impactAnalysis || "-",
          rollbackPlan: (payload as any).rollbackPlan || "-",
          approvalHistory: [],
          activityChecklist: DEFAULT_CAB_ACTIVITIES.map((act) => ({ ...act })),
        };
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
          MOCK_CAB_LIST[idx].status = "WAITING APPROVE";
        }
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id].scheduledDate = payload.scheduledDate;
          MOCK_CAB_DETAIL[id].scheduledEndDate = payload.scheduledEndDate;
          MOCK_CAB_DETAIL[id].cabLocation = payload.cabLocation;
          MOCK_CAB_DETAIL[id].status = "WAITING APPROVE";
        }
        setLoading(false);
        resolve(true);
      }, DELAY_LOW);
    });
  };

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
          MOCK_CAB_LIST[idx].status = "WAITING APPROVE";
        }
        if (MOCK_CAB_DETAIL[id]) {
          MOCK_CAB_DETAIL[id].status = "WAITING APPROVE";
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
        const newStatus = payload.action === "APPROVE" ? "APPROVED" : "REJECTED";
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
            status: payload.action === "APPROVE" ? "APPROVED" : "REJECTED",
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
    UpdateCabResult,
    SendToApproval,
    ActionCabRequest,
    ToggleCabActivity,
  };
};

export default useCabRequest;
