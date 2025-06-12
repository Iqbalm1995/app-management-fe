"use client";

import SignatureLineColor from "@/app/components/signatureStyle";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { RequirementsResponse } from "@/app/services/useRequirements";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
  useColorMode,
  Wrap,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FiCheck, FiRefreshCcw, FiX } from "react-icons/fi";

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
        <GridItem colSpan={{ base: 2, sm: 2, md: 2, lg: 2 }} w={"full"}>
          <Card
            rounded={radiusStyle}
            boxShadow={"md"}
            // bgGradient={"linear(to-br, secondary.500, secondary.800)"}
            // color={"white"}
            minH={"10vh"}
          >
            <CardHeader
              pb={1}
              fontWeight={600}
              bgGradient={"linear(to-br, secondary.600, secondary.900)"}
              roundedTop={radiusStyle}
              color={"white"}
            >
              <Flex w={"full"} justifyContent={"center"} pb={4}>
                <Heading as="h3" size="lg">
                  Approval
                </Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex
                w={"full"}
                justifyContent={"center"}
                alignContent={"center"}
                as={Stack}
                spacing={1}
                textAlign={"center"}
                py={8}
              >
                <Text>
                  Apakah anda yakin akan mensetujui Requirement{" "}
                  {ReqData.requirementType}
                </Text>
                <Text fontWeight={600} fontSize={"larger"}>
                  Nomor. {ReqData.reqNumber}
                </Text>
                <Text fontWeight={600} as={"i"} fontSize={"larger"}>
                  "{ReqData.reqNarative}" ?
                </Text>
                <Flex
                  w={"full"}
                  as={HStack}
                  spacing={8}
                  pt={8}
                  justifyContent={"center"}
                  alignContent={"center"}
                >
                  <Button
                    rounded={radiusStyle}
                    colorScheme={"green"}
                    size={"lg"}
                    boxShadow={"md"}
                    leftIcon={<FiCheck />}
                  >
                    Setuju
                  </Button>
                  <Button
                    rounded={radiusStyle}
                    colorScheme={"red"}
                    size={"lg"}
                    boxShadow={"md"}
                    leftIcon={<FiX />}
                  >
                    Tolak
                  </Button>
                </Flex>
              </Flex>
              <SignatureLineColor />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem colSpan={{ base: 2, sm: 2, md: 2, lg: 2 }} w={"full"}>
          <Card
            rounded={radiusStyle}
            boxShadow={"md"}
            // bgGradient={"linear(to-br, secondary.500, secondary.800)"}
            // color={"white"}
            minH={"10vh"}
          >
            <CardHeader
              pb={1}
              fontWeight={600}
              bgGradient={"linear(to-br, green.400, green.700)"}
              roundedTop={radiusStyle}
              color={"white"}
            >
              <Flex w={"full"} justifyContent={"center"} pb={4}>
                <Heading as="h3" size="lg">
                  Approval
                </Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex
                w={"full"}
                justifyContent={"center"}
                alignContent={"center"}
                as={Stack}
                spacing={1}
                textAlign={"center"}
                py={8}
              >
                <Text>Requirement {ReqData.requirementType}</Text>
                <Text fontWeight={600} fontSize={"larger"}>
                  Nomor. {ReqData.reqNumber}
                </Text>
                <Text fontWeight={600} as={"i"} fontSize={"larger"}>
                  "{ReqData.reqNarative}" ?
                </Text>
                <Text>Telah direview dan disetujui oleh :</Text>
                <Flex w={"full"} align={"center"} as={Stack} spacing={2} py={5}>
                  <Avatar size={"lg"} />
                  <Text fontWeight={600} fontSize={"larger"}>
                    Approver Name
                  </Text>
                  <Text fontWeight={500} fontSize={"medium"} lineHeight={0.5}>
                    Approver Role
                  </Text>
                </Flex>
                <Heading as="h2" size="xl" color={"green.500"}>
                  Disetujui
                </Heading>
                <Text>Pada : ...</Text>
              </Flex>
              <SignatureLineColor />
            </CardBody>
          </Card>
        </GridItem>
        <GridItem colSpan={{ base: 2, sm: 2, md: 2, lg: 2 }} w={"full"}>
          <Card
            rounded={radiusStyle}
            boxShadow={"md"}
            // bgGradient={"linear(to-br, secondary.500, secondary.800)"}
            // color={"white"}
            minH={"10vh"}
          >
            <CardHeader
              pb={1}
              fontWeight={600}
              bgGradient={"linear(to-br, red.400, red.700)"}
              roundedTop={radiusStyle}
              color={"white"}
            >
              <Flex w={"full"} justifyContent={"center"} pb={4}>
                <Heading as="h3" size="lg">
                  Approval
                </Heading>
              </Flex>
            </CardHeader>
            <CardBody>
              <Flex
                w={"full"}
                justifyContent={"center"}
                alignContent={"center"}
                as={Stack}
                spacing={1}
                textAlign={"center"}
                py={8}
              >
                <Text>Requirement {ReqData.requirementType}</Text>
                <Text fontWeight={600} fontSize={"larger"}>
                  Nomor. {ReqData.reqNumber}
                </Text>
                <Text fontWeight={600} as={"i"} fontSize={"larger"}>
                  "{ReqData.reqNarative}" ?
                </Text>
                <Text>Telah direview dan ditolak oleh :</Text>
                <Flex w={"full"} align={"center"} as={Stack} spacing={2} py={5}>
                  <Avatar size={"lg"} />
                  <Text fontWeight={600} fontSize={"larger"}>
                    Approver Name
                  </Text>
                  <Text fontWeight={500} fontSize={"medium"} lineHeight={0.5}>
                    Approver Role
                  </Text>
                </Flex>
                <Heading as="h2" size="xl" color={"red.500"}>
                  Ditolak
                </Heading>
                <Text>Pada : ...</Text>
                <Text>Alasan :</Text>
                <Text>
                  Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                  Perferendis voluptatem temporibus ut veritatis ullam id ad?
                  Aut, saepe vel incidunt ipsa dolorum tempore fugit dolores
                  quaerat, distinctio consequatur obcaecati doloremque!
                </Text>
              </Flex>
              <SignatureLineColor />
            </CardBody>
          </Card>
        </GridItem>
      </Grid>

      {/* <Box
        overflowY={"auto"}
        w={"full"}
        maxH={"250px"}
        p={2}
        rounded={radiusStyle}
        bgColor={"gray.300"}
      >
        <pre>{JSON.stringify(ReqData, null, 2)}</pre>
      </Box> */}
    </Flex>
  );
};

export default RequirementApprovalSection;
