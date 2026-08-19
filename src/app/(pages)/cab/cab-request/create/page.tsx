"use client";

import CreateView from "./createView";
import { Suspense } from "react";

export default function CabRequestCreatePage() {
  return (
    <Suspense>
      <CreateView />
    </Suspense>
  );
}
