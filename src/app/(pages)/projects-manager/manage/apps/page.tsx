import { Suspense } from "react";
import AppsManageDetail from "./appManageDetail";

export default function AppManagePage() {
  return (
    <Suspense>
      <AppsManageDetail />
    </Suspense>
  );
}
