"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import {
  CardBody,
  Grid,
  GridItem,
  Heading,
  useColorMode,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const HeaderDataContent: HeaderContentProps = {
  titleName: `Master Data Workflow`,
  breadCrumb: ["Home", "Master Data", "Workflow"],
};

// Motion-enhanced version of CardBody
const MotionCardBody = motion(CardBody);

function MasterDataConstantPage() {
  // SetUp auth data on current page
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />
      <Grid templateColumns="repeat(12, 1fr)" gap={5} w={"full"}>
        <GridItem colSpan={{ base: 12, sm: 12, md: 12, lg: 12 }} w={"full"}>
          <Heading as="h2" size="xl">
            {HeaderDataContent.titleName + " Page"}
          </Heading>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
}

export default MasterDataConstantPage;
