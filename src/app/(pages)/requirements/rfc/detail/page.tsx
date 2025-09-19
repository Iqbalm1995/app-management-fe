"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function RfcDetailRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const reqId = searchParams.get("reqId");
    const newUrl = `/requirements/detail?reqId=${reqId}&type=RFC`;
    router.replace(newUrl);
  }, [router, searchParams]);

  return <div>Redirecting...</div>;
}
