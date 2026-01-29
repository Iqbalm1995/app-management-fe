"use client";

import { Suspense } from "react";
import PendingApproveView from "./pendingApproveView";

export default function PendingApprovePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PendingApproveView />
    </Suspense>
  );
}
