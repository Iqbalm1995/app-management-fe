import { Suspense } from "react";
import ProjectWorkspaceView from "../projectWorkspace";

export default function LockedProjectWorkspacePage() {
  return (
    <Suspense>
      <ProjectWorkspaceView isLocked={true} backUrl="/workspace" />
    </Suspense>
  );
}
