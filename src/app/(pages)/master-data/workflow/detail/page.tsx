import { Suspense } from "react";
import WorkflowDetailView from "./detailWorkflowPage";

export default function WFDetailPage() {
  return (
    <Suspense>
      <WorkflowDetailView />
    </Suspense>
  );
}
