"use client";

import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import WorkflowPresetListView from "./workflowPresetListView";

export default function WorkflowPresetPage() {
  return (
    <Suspense fallback={<LoadingMiniSignature />}>
      <WorkflowPresetListView />
    </Suspense>
  );
}
