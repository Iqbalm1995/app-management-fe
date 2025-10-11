"use client";

import { Suspense } from "react";
import AddTeamViewPage from "./addTeamForm";

export default function AddTeamPage() {
  return (
    <Suspense>
      <AddTeamViewPage />
    </Suspense>
  );
}
