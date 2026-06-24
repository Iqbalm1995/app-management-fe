"use client";
import { Suspense } from "react";
import AppsAssessmentDetailView from "./appsAssessmentDetailView";

export default function AppsAssessmentDetailPage() {
  return <Suspense fallback={<div>Loading...</div>}><AppsAssessmentDetailView /></Suspense>;
}
