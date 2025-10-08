import { Suspense } from "react";
import ProjectManagerDetail from "./projectManagerDetail";

export default function ProjectManagerPage() {
  return (
    <Suspense>
      <ProjectManagerDetail />
    </Suspense>
  );
}
