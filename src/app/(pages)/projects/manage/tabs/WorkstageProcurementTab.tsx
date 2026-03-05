"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle, PROJECT_TYPE_PROCUREMENT } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import ProjectFeatureView from "../projectFeaturesView";
import { ProjectProcurementSection } from "../components";

interface WorkstageProcurementTabProps {
  DataProject: ProjectDataResponse | null;
  onRefreshProject?: () => void;
}

const WorkstageProcurementTab = ({ DataProject, onRefreshProject }: WorkstageProcurementTabProps) => {
  const { colorMode } = useColorMode();

  // Show ProjectProcurementSection if procurement project and no stages assigned
  const showAssignmentSection = DataProject?.projectType === PROJECT_TYPE_PROCUREMENT && 
    (!DataProject?.projectWorkflowProjectData || DataProject?.projectWorkflowProjectData.length === 0);

  return (
    <TabPanel roundedBottom={radiusStyle}>
      <Suspense fallback={<LoadingMiniSignature />}>
        {showAssignmentSection ? (
          <ProjectProcurementSection 
            DataProject={DataProject} 
            onAssignSuccess={onRefreshProject}
          />
        ) : (
          <ProjectFeatureView DataProject={DataProject} viewType="workflow" />
        )}
      </Suspense>
    </TabPanel>
  );
};

export default WorkstageProcurementTab;
