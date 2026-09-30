import { Suspense } from "react";
import CreateEnvironmentView from "./createEnvironmentView";

export default function CreateEnvironmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateEnvironmentView />
    </Suspense>
  );
}
