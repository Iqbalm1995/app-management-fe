"use client";

import { Suspense } from "react";
import ProjectDocView from "./ProjectDocView";

export default function ProjectDocPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectDocView />
    </Suspense>
  );
}
