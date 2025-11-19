import { Suspense } from "react";
import ProjectWorkspaceView from "./projectWorkspace";

export default function ProjectWorkspacePage() {
  return (
    <Suspense>
      <ProjectWorkspaceView />
    </Suspense>
  );
}
