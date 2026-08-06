"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";

const AdditionalMenusView = dynamic(() => import("./AdditionalMenusView"), { ssr: false });

function AdditionalMenusPage() {
  useEffect(() => {
    document.title = "bjb aPPs - Menu Lainnya";
  }, []);

  return (
    <Suspense>
      <AdditionalMenusView />
    </Suspense>
  );
}

export default AdditionalMenusPage;
