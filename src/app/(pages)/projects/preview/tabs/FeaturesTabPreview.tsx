"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel } from "@chakra-ui/react";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import BacklogListPreview from "../components/BacklogListPreview";

interface FeaturesTabPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const FeaturesTabPreview = ({ DataProject }: FeaturesTabPreviewProps) => {
  return (
    <TabPanel>
      <Suspense fallback={<LoadingMiniSignature />}>
        <BacklogListPreview DataProject={DataProject} />
      </Suspense>
    </TabPanel>
  );
};

export default FeaturesTabPreview;
