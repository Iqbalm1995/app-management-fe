"use client";

import { Suspense } from "react";
import RequirementsBRDRegisterView from "./formRegsiterBRD";

export default function ReqBRDRegisterPage() {
  return (
    <Suspense>
      <RequirementsBRDRegisterView />
    </Suspense>
  );
}
