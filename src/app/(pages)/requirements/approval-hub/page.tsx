"use client";

import { Suspense } from "react";
import ApprovalHubView from "./approvalHubView";

export default function ApprovalHubPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ApprovalHubView />
    </Suspense>
  );
}
