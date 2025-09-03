import { Suspense } from "react";
import ProjectKanbanView from "./projectKanbanView";

export default function ProjectKanbanPage() {
  return (
    <Suspense>
      <ProjectKanbanView />
    </Suspense>
  );
}
