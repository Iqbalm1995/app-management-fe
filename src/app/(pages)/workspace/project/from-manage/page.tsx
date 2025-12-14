"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProjectWorkspaceView from "../projectWorkspace";

function FromManageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const backUrl = projectId ? `/projects/manage?projectId=${projectId}` : "/projects/manage";

  return <ProjectWorkspaceView isLocked={true} backUrl={backUrl} />;
}

export default function FromManagePage() {
  return (
    <Suspense>
      <FromManageContent />
    </Suspense>
  );
}
