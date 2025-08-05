"use client";

import { Suspense } from "react";
import RegsiterRequirementViewPage from "../../registerForm/formRegsiterRequirements";

export default function ReqRFCRegisterPage() {
  return (
    <Suspense>
      <RegsiterRequirementViewPage type_req_param={"RFC"} />
    </Suspense>
  );
}
