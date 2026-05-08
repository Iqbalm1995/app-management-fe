"use client";

import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import PerformancePortfolioView from "../../shared/PerformancePortfolioView";

export default function DivisionDetailPage() {
  return (
    <Suspense fallback={<LoadingMiniSignature />}>
      <PerformancePortfolioView mode="division" />
    </Suspense>
  );
}
