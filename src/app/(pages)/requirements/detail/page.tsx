"use client";

import { Suspense } from "react";
import RequirementDetailView from "./requirementDetailView";

export default function RequirementDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RequirementDetailView />
    </Suspense>
  );
}
