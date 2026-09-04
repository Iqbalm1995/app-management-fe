"use client";

import { Suspense } from "react";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import DevKanbanView from "./devKanbanView";

export default function DevKanbanPage() {
  useDocumentTitle("Developer Kanban");
  return (
    <Suspense>
      <DevKanbanView />
    </Suspense>
  );
}
