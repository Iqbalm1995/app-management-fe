"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import ProjectInfoSection from "../components/ProjectInfoSection";

interface DetailsTabProps {
  DataProject: ProjectDataResponse | null;
  projectId: string | null;
}

const DetailsTab = ({ DataProject, projectId }: DetailsTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
      <Suspense fallback={<LoadingMiniSignature />}>
        <ProjectInfoSection projectId={projectId} />
      </Suspense>
    </TabPanel>
  );
};

export default DetailsTab;
