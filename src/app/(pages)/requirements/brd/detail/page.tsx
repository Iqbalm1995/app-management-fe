"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function BrdDetailRedirectComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const reqId = searchParams.get("reqId");
    const newUrl = `/requirements/detail?reqId=${reqId}&type=BRD`;
    router.replace(newUrl);
  }, [router, searchParams]);

  return <div>Redirecting...</div>;
}

export default function BrdDetailRedirect() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrdDetailRedirectComponent />
    </Suspense>
  );
}
