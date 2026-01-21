"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel } from "@chakra-ui/react";
import { Suspense } from "react";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import ProjectInfoPreview from "../components/ProjectInfoPreview";

interface DetailsTabPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const DetailsTabPreview = ({ DataProject }: DetailsTabPreviewProps) => {
  return (
    <TabPanel>
      <Suspense fallback={<LoadingMiniSquare />}>
        <ProjectInfoPreview DataProject={DataProject} />
      </Suspense>
    </TabPanel>
  );
};

export default DetailsTabPreview;
