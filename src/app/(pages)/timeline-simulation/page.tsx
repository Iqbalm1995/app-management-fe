import { Suspense } from "react";
import TimelineSimulationView from "./TimelineSimulationView";

export default function TimelineSimulationPage() {
  return (
    <Suspense>
      <TimelineSimulationView />
    </Suspense>
  );
}
