"use client";

import CabRequestView from "./cabRequestView";
import { Suspense } from "react";

export default function CabRequestPage() {
  return (
    <Suspense>
      <CabRequestView />
    </Suspense>
  );
}
