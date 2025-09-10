import { Suspense } from "react";
import WorkflowPresetView from "./workflowPresetView";

export default function PresetWFPage() {
  return (
    <Suspense>
      <WorkflowPresetView />
    </Suspense>
  );
}
