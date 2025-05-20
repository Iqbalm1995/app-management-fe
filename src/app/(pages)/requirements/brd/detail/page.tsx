import { Suspense } from "react";
import BrdDetailView from "./brdDetailView";

export default function BrdDetailPage() {
  return (
    <Suspense>
      <BrdDetailView />
    </Suspense>
  );
}
