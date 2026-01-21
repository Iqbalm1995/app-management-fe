"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { TabPanel } from "@chakra-ui/react";
import { Suspense } from "react";
import LoadingMiniSignature from "@/app/components/loadingMini";
import DocumentationListPreview from "../components/DocumentationListPreview";

interface DocumentationTabPreviewProps {
  DataProject: ProjectDataResponse | null;
}

const DocumentationTabPreview = ({ DataProject }: DocumentationTabPreviewProps) => {
  return (
    <TabPanel>
      <Suspense fallback={<LoadingMiniSignature />}>
        <DocumentationListPreview DataProject={DataProject} />
      </Suspense>
    </TabPanel>
  );
};

export default DocumentationTabPreview;
