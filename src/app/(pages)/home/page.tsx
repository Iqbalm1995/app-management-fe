"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";

// Dynamically load the Chart component to prevent it from being imported server-side
const HomePageView = dynamic(() => import("./HomePageView"), { ssr: false });

function HomePage() {
  useEffect(() => {
    document.title = "KOBRA - Project Management Apps | Dashboard";
  }, []);
  
  return (
    <Suspense>
      <HomePageView />
    </Suspense>
  );
}

export default HomePage;
