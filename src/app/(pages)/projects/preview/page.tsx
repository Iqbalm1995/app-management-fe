import { Suspense } from "react";
import ProjectPreviewView from "./ProjectPreviewView";

export default function ProjectPreviewPage() {
  return (
    <Suspense>
      <ProjectPreviewView />
    </Suspense>
  );
}
