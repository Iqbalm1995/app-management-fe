"use client";

import { Suspense } from "react";
import SysModuleGroupDetailView from "./sysModuleGroupDetailView";

export default function SysModuleGroupDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SysModuleGroupDetailView />
    </Suspense>
  );
}
