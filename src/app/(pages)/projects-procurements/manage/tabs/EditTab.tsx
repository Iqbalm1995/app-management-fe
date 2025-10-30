"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import ProjectEditSection from "../components/ProjectEditSection";

interface EditTabProps {
  DataProject: ProjectDataResponse | null;
}

const EditTab = ({ DataProject }: EditTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
      <Suspense fallback={<LoadingMiniSquare />}>
        <ProjectEditSection DataProject={DataProject} />
      </Suspense>
    </TabPanel>
  );
};

export default EditTab;
