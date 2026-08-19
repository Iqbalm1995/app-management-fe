"use client";

import CabApproveView from "./cabApproveView";
import { Suspense } from "react";

export default function CabApprovePage() {
  return (
    <Suspense>
      <CabApproveView />
    </Suspense>
  );
}
