"use client";

import { Suspense } from "react";
import ProjectRegisterView from "../../projects/register/ProjectRegsiterView";
import { PROJECT_TYPE_PROCUREMENT } from "@/app/constants/applicationConstants";

const PRJ_TYPE_REGISTER: string = PROJECT_TYPE_PROCUREMENT;

export default function ProcurementRegisterPage() {
  return (
    <Suspense>
      <ProjectRegisterView projectTypeRegister={PRJ_TYPE_REGISTER} />
    </Suspense>
  );
}
