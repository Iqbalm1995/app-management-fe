"use client";

import { Suspense } from "react";
import RegisterRequirementFormPage from "../../register-form/formRegsiterRequirements";

export default function ReqRFCRegisterPage() {
  return (
    <Suspense>
      <RegisterRequirementFormPage type_req_param={"RFC"} />
    </Suspense>
  );
}
