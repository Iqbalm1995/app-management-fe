import { Suspense } from "react";
import KanbanBacklogPage from "./kanbanView";

export default function KanbanPage() {
  return (
    <Suspense>
      <KanbanBacklogPage />
    </Suspense>
  );
}
