"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  Stack,
  Container,
  Box,
  Heading,
  Text,
  VStack,
  useColorMode,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { QuartalSnapshotGroup } from "./components/QuartalSnapshotGroup";
import { EvaluationSnapshotGroup } from "./components/EvaluationSnapshotGroup";
import { ProgressionUpdateGroup } from "./components/ProgressionUpdateGroup";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Master Report Snapshot",
  breadCrumb: ["Home", "Reports", "Master Report Snapshot"],
};

export default function MasterReportSnapshotPage() {
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
  }, [DataAuth]);

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Introduction Section */}
          <Box
            p={6}
            bg={colorMode === "light" ? "blue.50" : "blue.900"}
            borderRadius="lg"
            borderLeft="4px"
            borderColor="blue.500"
          >
            <Heading size="md" mb={2}>
              📊 Report Snapshot Management
            </Heading>
            <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
              Execute comprehensive report snapshots to capture current project and requirement data. 
              Each snapshot creates a point-in-time record for historical tracking and analysis.
            </Text>
          </Box>

          {/* Groups */}
          <Stack spacing={8}>
            <QuartalSnapshotGroup />
            <EvaluationSnapshotGroup />
            <ProgressionUpdateGroup />
          </Stack>
        </VStack>
      </Container>
    </LayoutAdmin>
  );
}
