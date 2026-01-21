"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import WorkflowStagePreview from "../components/WorkflowStagePreview";

interface WorkstageTabPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const WorkstageTabPreview = ({ DataProject }: WorkstageTabPreviewProps) => {
  return (
    <TabPanel roundedBottom={radiusStyle}>
      <Suspense fallback={<LoadingMiniSignature />}>
        <WorkflowStagePreview DataProject={DataProject} />
      </Suspense>
    </TabPanel>
  );
};

export default WorkstageTabPreview;
