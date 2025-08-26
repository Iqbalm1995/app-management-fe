import { Suspense } from "react";
import ProjectDevelopmentDetail from "./projectDevelopmentDetail";

export default function ProjectDevelopmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectDevelopmentDetail />
    </Suspense>
  );
}
