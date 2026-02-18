"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProjectRegisterView from "../../projects/register/ProjectRegsiterView";
import { PROJECT_TYPE_PROCUREMENT } from "@/app/constants/applicationConstants";

const PRJ_TYPE_REGISTER: string = PROJECT_TYPE_PROCUREMENT;

function ProcurementRegisterPageContent() {
  const searchParams = useSearchParams();
  const reqTypeParam = searchParams.get("reqType");
  const reqType = reqTypeParam?.toUpperCase();

  return (
    <ProjectRegisterView projectTypeRegister={PRJ_TYPE_REGISTER} reqType={reqType} />
  );
}

export default function ProcurementRegisterPage() {
  return (
    <Suspense>
      <ProcurementRegisterPageContent />
    </Suspense>
  );
}
