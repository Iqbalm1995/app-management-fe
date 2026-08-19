"use client";

import { Suspense } from "react";
import VendorContractRegisterView from "./VendorContractRegisterView";

export default function VendorContractRegisterPage() {
  return (
    <Suspense>
      <VendorContractRegisterView />
    </Suspense>
  );
}
