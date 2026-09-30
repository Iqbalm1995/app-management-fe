import { Suspense } from "react";
import CreateEnvironmentView from "../../create-environment/createEnvironmentView";

export default function CreateEnvironmentDetailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateEnvironmentView />
    </Suspense>
  );
}
