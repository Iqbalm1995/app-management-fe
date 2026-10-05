"use client";

import { Suspense } from "react";
import EosDetailView from "./eosDetailView";

export default function EosDetailPage() {
  return (
    <Suspense>
      <EosDetailView />
    </Suspense>
  );
}
