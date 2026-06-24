"use client";
import { Suspense } from "react";
import AppsAssessmentsDetailView from "./appsAssessmentsDetailView";

export default function AppsAssessmentsDetailPage() {
  return <Suspense fallback={<div>Loading...</div>}><AppsAssessmentsDetailView /></Suspense>;
}
