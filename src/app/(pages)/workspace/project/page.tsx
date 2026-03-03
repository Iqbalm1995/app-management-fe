"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProjectWorkspaceView from "./projectWorkspace";

function ProjectWorkspacePageContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const from = searchParams.get("from");
  
  // Determine back URL based on referrer
  let backUrl = "/workspace"; // Default
  if (from === "projects-manage" && projectId) {
    backUrl = `/projects/manage?projectId=${projectId}`;
  }

  return <ProjectWorkspaceView isLocked={false} backUrl={backUrl} />;
}

export default function ProjectWorkspacePage() {
  return (
    <Suspense>
      <ProjectWorkspacePageContent />
    </Suspense>
  );
}
