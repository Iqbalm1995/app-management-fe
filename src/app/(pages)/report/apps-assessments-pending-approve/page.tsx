"use client";
import { Suspense } from "react";
import AppsPendingApproveView from "./appsPendingApproveView";

export default function AppsPendingApprovePage() {
  return <Suspense fallback={<div>Loading...</div>}><AppsPendingApproveView /></Suspense>;
}
