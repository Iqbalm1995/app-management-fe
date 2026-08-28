"use client";

import CabRequestDetailView from "./cabRequestDetailView";
import { Suspense } from "react";

export default function CabRequestDetailPage() {
  return (
    <Suspense>
      <CabRequestDetailView />
    </Suspense>
  );
}
