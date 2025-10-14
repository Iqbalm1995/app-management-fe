import { Suspense } from "react";
import ApplicationDetail from "./applicationDetail";

export default function ApplicationDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApplicationDetail />
    </Suspense>
  );
}
