"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProjectRegisterView from "../../projects/register/ProjectRegsiterView";
import { PROJECT_TYPE_INTERNAL_DEVELOPMENT } from "@/app/constants/applicationConstants";

const PRJ_TYPE_REGISTER: string = PROJECT_TYPE_INTERNAL_DEVELOPMENT;

function ProjectRegisterPageContent() {
  const searchParams = useSearchParams();
  const reqType = searchParams.get("reqType");

  return (
    <ProjectRegisterView projectTypeRegister={PRJ_TYPE_REGISTER} reqType={reqType} />
  );
}

export default function ProjectRegisterPage() {
  return (
    <Suspense>
      <ProjectRegisterPageContent />
    </Suspense>
  );
}
