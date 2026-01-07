"use client";

import { Suspense } from "react";
import AuthorizeGroupDetailView from "./authorizeGroupDetailView";

export default function AuthorizeGroupDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthorizeGroupDetailView />
    </Suspense>
  );
}
