"use client";

import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import PerformancePortfolioView from "../../shared/PerformancePortfolioView";

export default function TeamDetailPage() {
  return (
    <Suspense fallback={<LoadingMiniSignature />}>
      <PerformancePortfolioView mode="team" />
    </Suspense>
  );
}
