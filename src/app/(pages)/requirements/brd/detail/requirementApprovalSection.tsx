"use client";

import { radiusStyle } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { RequirementsResponse } from "@/app/services/useRequirements";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  Stack,
  useColorMode,
  Wrap,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiRefreshCcw } from "react-icons/fi";

interface RequirementApprovalProps {
  RefreshAction: () => void;
  RefreshData: number;
  ReqData: RequirementsResponse;
}

const RequirementApprovalSection = ({
  ReqData,
  RefreshData,
  RefreshAction,
}: RequirementApprovalProps) => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  return (
    <Flex w={"full"} as={Stack} spacing={4}>
      <Heading as="h5" size="md" w={"full"}>
        Review Approval {ReqData.requirementType}
      </Heading>

      <Grid templateColumns="repeat(2, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 2, sm: 2, md: 2, lg: 2 }} w={"full"}>
          {/* BUTTON ACTION */}
          <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
            <Button
              size={"sm"}
              leftIcon={<FiRefreshCcw />}
              //   isLoading={ActionLoading}
              //   onClick={() => RefreshActionLocale()}
            >
              Refresh
            </Button>
          </Flex>
        </GridItem>
      </Grid>

      <Box
        overflowY={"auto"}
        w={"full"}
        maxH={"250px"}
        p={2}
        rounded={radiusStyle}
        bgColor={"gray.300"}
      >
        <pre>{JSON.stringify(ReqData, null, 2)}</pre>
      </Box>
    </Flex>
  );
};

export default RequirementApprovalSection;
