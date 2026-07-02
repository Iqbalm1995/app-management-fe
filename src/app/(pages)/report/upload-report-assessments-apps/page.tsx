"use client";
import { Suspense } from "react";
import UploadReportAssessmentsView from "./uploadReportAssessmentsView";

export default function UploadReportAssessmentsPage() {
  return <Suspense fallback={<div>Loading...</div>}><UploadReportAssessmentsView /></Suspense>;
}
