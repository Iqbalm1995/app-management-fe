"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import ProjectFeatureView from "../projectFeaturesView";

interface FeaturesTabProps {
  DataProject: ProjectDataResponse | null;
}

const FeaturesTab = ({ DataProject }: FeaturesTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
      <Suspense fallback={<LoadingMiniSignature />}>
        <ProjectFeatureView DataProject={DataProject} viewType="backlogs" />
      </Suspense>
    </TabPanel>
  );
};

export default FeaturesTab;
