"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel, useColorMode } from "@chakra-ui/react";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import ProjectDocumentationSection from "../components/ProjectDocumentationSection";

interface DocumentationTabProps {
  DataProject: ProjectDataResponse | null;
  projectId: string | null;
}

const DocumentationTab = ({ DataProject, projectId }: DocumentationTabProps) => {
  const { colorMode } = useColorMode();

  return (
    <TabPanel
      p={8}
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      roundedBottom={radiusStyle}
    >
      <Suspense fallback={<LoadingMiniSignature />}>
        <ProjectDocumentationSection projectId={projectId} />
      </Suspense>
    </TabPanel>
  );
};

export default DocumentationTab;
