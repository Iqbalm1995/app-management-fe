"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";

const VendorDetailView = dynamic(() => import("./VendorDetailView"), { ssr: false });

function VendorDetailPage() {
  useEffect(() => {
    document.title = "bjb aPPs - Vendor Detail";
  }, []);

  return (
    <Suspense>
      <VendorDetailView />
    </Suspense>
  );
}

export default VendorDetailPage;
