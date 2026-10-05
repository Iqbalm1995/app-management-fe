"use client";

import { Suspense } from "react";
import EosCreateView from "./eosCreateView";

export default function EosCreatePage() {
  return (
    <Suspense>
      <EosCreateView />
    </Suspense>
  );
}
