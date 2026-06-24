"use client";

import { Suspense } from "react";
import ConfMatrixCriteriaAppsView from "./confMatrixCriteriaAppsView";

export default function ConfMatrixCriteriaAppsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfMatrixCriteriaAppsView />
    </Suspense>
  );
}
