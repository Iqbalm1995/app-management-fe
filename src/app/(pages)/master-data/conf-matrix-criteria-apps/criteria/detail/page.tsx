"use client";
import { Suspense } from "react";
import CriteriaDetailView from "./criteriaDetailView";

export default function CriteriaDetailPage() {
  return <Suspense fallback={<div>Loading...</div>}><CriteriaDetailView /></Suspense>;
}
