"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import ProjectFeatureView from "../projectFeaturesView";

interface FeaturesTabProps {
  DataProject: ProjectDataResponse | null;
  projectId: string | null;
}

const FeaturesTab = ({ DataProject, projectId }: FeaturesTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
      <Suspense fallback={<LoadingMiniSignature />}>
        <ProjectFeatureView DataProject={DataProject} />
      </Suspense>
    </TabPanel>
  );
};

export default FeaturesTab;
