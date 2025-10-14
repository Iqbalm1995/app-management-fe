"use client";

import { Suspense } from "react";
import TeamDetailView from "./teamDetailView";

export default function TeamDetailPage() {
  return (
    <Suspense>
      <TeamDetailView />
    </Suspense>
  );
}
