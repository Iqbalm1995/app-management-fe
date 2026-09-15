"use client";

import React from "react";
import ApplicationPickerModal, {
  ApplicationPickerModalProps,
} from "@/app/components/ApplicationPickerModal";
import { ApplicationMasterResponse } from "@/app/services/useApps";

export interface AppPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedApp: ApplicationMasterResponse | null;
  onAppSelect: (app: ApplicationMasterResponse | null) => void;
  tokenData: string;
  title?: string;
  defaultViewMode?: "grid" | "table";
  allowOtherCategory?: boolean;
  lockByGroupId?: string | null;
}

export default function AppPickerModalForm(props: AppPickerModalProps) {
  return (
    <ApplicationPickerModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      selectedApp={props.selectedApp}
      onAppSelect={props.onAppSelect}
      tokenData={props.tokenData}
      title={props.title || "Pilih Product"}
      defaultViewMode={props.defaultViewMode || "grid"}
      allowOtherCategory={props.allowOtherCategory || false}
      lockByGroupId={props.lockByGroupId || null}
    />
  );
}
