"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import ProjectEditSection from "../components/ProjectEditSection";

interface EditTabProps {
  DataProject: ProjectDataResponse | null;
  canMake: boolean;
}

const EditTab = ({ DataProject, canMake }: EditTabProps) => {
  const { colorMode } = useColorMode();

  console.log("EditTab rendering with DataProject:", DataProject?.id);

  return (
    <TabPanel>
      <Suspense fallback={<LoadingMiniSquare />}>
        <ProjectEditSection DataProject={DataProject} canMake={canMake} />
      </Suspense>
    </TabPanel>
  );
};

export default EditTab;
