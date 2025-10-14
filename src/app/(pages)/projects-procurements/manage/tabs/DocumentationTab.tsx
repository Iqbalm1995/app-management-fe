"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import ProjectDocumentationSection from "../components/ProjectDocumentationSection";

interface DocumentationTabProps {
  DataProject: ProjectDataResponse | null;
}

const DocumentationTab = ({ DataProject }: DocumentationTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel roundedBottom={radiusStyle}>
      <Suspense fallback={<LoadingMiniSignature />}>
        <ProjectDocumentationSection DataProject={DataProject} />
      </Suspense>
    </TabPanel>
  );
};

export default DocumentationTab;
