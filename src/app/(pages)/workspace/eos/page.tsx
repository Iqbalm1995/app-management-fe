"use client";

import { Suspense } from "react";
import EosView from "./eosView";

export default function EosPage() {
  return (
    <Suspense>
      <EosView />
    </Suspense>
  );
}
