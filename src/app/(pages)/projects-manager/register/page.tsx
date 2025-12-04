"use client";

import { Suspense } from "react";
import FormRegisterProjectView from "./formRegisterProject";
import { PROJECT_TYPE_INTERNAL_DEVELOPMENT } from "@/app/constants/applicationConstants";
import ProjectRegisterView from "../../projects/register/ProjectRegisterDraftView";

const PRJ_TYPE_REGISTER: string = PROJECT_TYPE_INTERNAL_DEVELOPMENT;

export default function ProjectRegisterPage() {
  return (
    <Suspense>
      <ProjectRegisterView projectTypeRegister={PRJ_TYPE_REGISTER} />
    </Suspense>
  );
}
