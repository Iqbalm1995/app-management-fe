"use client";

import { Suspense } from "react";
import BRDRFCView from "./brdRfcView";

export default function BRDRFCPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BRDRFCView />
    </Suspense>
  );
}
