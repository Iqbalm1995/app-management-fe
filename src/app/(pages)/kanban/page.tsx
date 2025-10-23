"use client";

import { Suspense } from "react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import KanbanBacklogPage from "./kanbanView";

export default function KanbanPage() {
  useDocumentTitle("Kanban Board");
  return (
    <Suspense>
      <KanbanBacklogPage />
    </Suspense>
  );
}
