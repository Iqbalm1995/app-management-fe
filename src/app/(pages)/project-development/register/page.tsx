"use client";

import { Suspense } from "react";
import FormRegisterProjectView from "./formRegisterProject";

export default function ProjectRegisterPage() {
  return (
    <Suspense>
      <FormRegisterProjectView />
    </Suspense>
  );
}
