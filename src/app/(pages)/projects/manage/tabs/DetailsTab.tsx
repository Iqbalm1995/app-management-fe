"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import ProjectInfoSection from "../components/ProjectInfoSection";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";

interface DetailsTabProps {
  DataProject: ProjectDataResponse | null;
}

const DetailsTab = ({ DataProject }: DetailsTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
      <Suspense fallback={<LoadingMiniSquare />}>
        <ProjectInfoSection DataProject={DataProject} />
      </Suspense>
    </TabPanel>
  );
};

export default DetailsTab;
