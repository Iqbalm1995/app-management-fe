"use client";
import { Suspense } from "react";
import ReportingPeriodDetailView from "./reportingPeriodDetailView";

export default function ReportingPeriodDetailPage() {
  return <Suspense fallback={<div>Loading...</div>}><ReportingPeriodDetailView /></Suspense>;
}
