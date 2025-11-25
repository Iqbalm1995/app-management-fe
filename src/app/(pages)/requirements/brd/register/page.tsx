"use client";

import { Suspense } from "react";
import RegsiterRequirementViewPage from "../../registerForm/formRegsiterRequirements";
import RegisterRequirementFormPage from "../../register-form/formRegsiterRequirements";

export default function ReqBRDRegisterPage() {
  return (
    <Suspense>
      {/* <RegsiterRequirementViewPage type_req_param={"BRD"} /> */}
      <RegisterRequirementFormPage type_req_param={"BRD"} />
    </Suspense>
  );
}
