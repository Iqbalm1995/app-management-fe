"use client";
import { Suspense } from "react";
import AppsAssessmentsView from "./appsAssessmentsView";

export default function AppsAssessmentsPage() {
  return <Suspense fallback={<div>Loading...</div>}><AppsAssessmentsView /></Suspense>;
}
