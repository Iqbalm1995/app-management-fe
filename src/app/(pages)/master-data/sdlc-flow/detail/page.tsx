import { Suspense } from "react";
import SdlcFlowDetailView from "./detailSdlcFlowPage";

export default function SdlcFlowDetailPage() {
  return (
    <Suspense>
      <SdlcFlowDetailView />
    </Suspense>
  );
}
