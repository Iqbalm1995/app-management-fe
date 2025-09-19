"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RfcDetailRedirectComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const reqId = searchParams.get("reqId");
    const newUrl = `/requirements/detail?reqId=${reqId}&type=RFC`;
    router.replace(newUrl);
  }, [router, searchParams]);

  return <div>Redirecting...</div>;
}

export default function RfcDetailRedirect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RfcDetailRedirectComponent />
    </Suspense>
  );
}
