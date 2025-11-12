"use client";

import { HeaderContentProps } from "@/app/components/headerContent";
import LayoutAdminWorkspace from "@/app/components/layoutAdminWorkspace";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { MasterBoardTaskResponse } from "@/app/services/useMasterBoardTask";
import { ProjectDataResponse } from "@/app/services/useProjects";
import { TaskViewModel } from "@/app/services/useTasks";
import { Flex, Heading, useColorMode } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Workspace",
  breadCrumb: ["Home", "Project Development", "Workspace"],
};

// main view compoenents
function ProjectWorkspaceView() {
  const showToast = useToastHelper();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const [HeaderContentState, setHeaderContentState] =
    useState<HeaderContentProps>(HeaderDataContent);

  // Auth Setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) setTokenData(token);
  }, [DataAuth]);

  // Project ID from URL (no backlogId needed)
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    const projId = searchParams.get("projectId");
    if (projId) {
      setProjectId(projId);
    }
  }, [searchParams]);
  

  return (
    <LayoutAdminWorkspace>
      <Flex w={"full"} minH={"60vh"} justifyContent={"center"}>
        <Heading as="h2" size="xl">
          Working Space
        </Heading>
      </Flex>
    </LayoutAdminWorkspace>
  );
}


export default ProjectWorkspaceView;