"use client";
import { Suspense } from "react";
import CriteriaInsertView from "./criteriaInsertView";

export default function CriteriaNewPage() {
  return <Suspense fallback={<div>Loading...</div>}><CriteriaInsertView /></Suspense>;
}
