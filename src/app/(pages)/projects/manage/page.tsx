import { Suspense } from "react";
import ProjectManageView from "./ProjectManageView";

export default function ProjectManagePage() {
  return (
    <Suspense>
      <ProjectManageView />
    </Suspense>
  );
}
