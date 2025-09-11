"use client";

import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import WorkflowPresetDetailView from "./workflowPresetDetailView";

export default function WorkflowPresetDetailPage() {
  return (
    <Suspense fallback={<LoadingMiniSignature />}>
      <WorkflowPresetDetailView />
    </Suspense>
  );
}
