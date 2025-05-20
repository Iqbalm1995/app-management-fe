"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically load the Chart component to prevent it from being imported server-side
const HomePageView = dynamic(() => import("./HomePageView"), { ssr: false });

function HomePage() {
  return (
    <Suspense>
      <HomePageView />
    </Suspense>
  );
}

export default HomePage;
