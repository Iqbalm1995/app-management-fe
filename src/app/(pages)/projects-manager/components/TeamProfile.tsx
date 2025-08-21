"use client";

import { useEffect, useState, memo, useCallback } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Container,
  Flex,
  Heading,
  Image,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useTeams, { TeamsResponse } from "@/app/services/useTeams";
import { UsersResponse } from "@/app/services/useUsers";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { buildUrlPort } from "@/app/helper/MasterHelper";
import {
  DELAY_MEDIUM,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  MAX_SIZE_TABLE,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { PaggingListPayloadCustom } from "@/app/types/masterTypes";

const TeamProfile = memo(() => {
  const showToast = useToastHelper();
  const { GetDetailById, ListMembers } = useTeams();
  
  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [DataTeam, setDataTeam] = useState<TeamsResponse | null>(null);
  const [DataTeamMembers, setDataTeamMembers] = useState<UsersResponse[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(true);
  const [image, setImage] = useState("/img/placeholder-header-sm.png");

  const delay = useCallback((ms: number) => 
    new Promise((resolve) => setTimeout(resolve, ms)), []);

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, []); // Empty dependency array - run only once

  useEffect(() => {
    setIsLoadingProcess(true);
    if (DataAuth && DataAuth.team && DataAuth.team.id) {
      const teamId = DataAuth.team.id;

      const GetDataTeam = async () => {
        // Check if team data exists in localStorage and is not expired
        const storedTeamData = localStorage.getItem(`teamData_${teamId}`);
        const storedTeamTimestamp = localStorage.getItem(
          `teamData_${teamId}_timestamp`
        );
        const currentTime = new Date().getTime();
        const CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes in milliseconds

        // Check if we have valid cached data
        if (
          storedTeamData &&
          storedTeamTimestamp &&
          currentTime - parseInt(storedTeamTimestamp) < CACHE_EXPIRATION &&
          RefreshData === 0
        ) {
          try {
            const parsedTeamData: TeamsResponse = JSON.parse(storedTeamData);
            setDataTeam(parsedTeamData);

            if (parsedTeamData.teamPict != null) {
              setImage(
                buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) +
                  parsedTeamData.teamPict
              );
            }
            console.log("Team data loaded from localStorage");
            setIsLoadingProcess(false);
          } catch (error) {
            console.error("Error parsing team data from localStorage:", error);
            await fetchTeamDataFromAPI();
          }
        } else {
          await fetchTeamDataFromAPI();
        }
      };

      const fetchTeamDataFromAPI = async () => {
        const requestData = await GetDetailById(teamId, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          console.log("Team data fetched from API");
          await delay(DELAY_MEDIUM);
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: TeamsResponse = requestData.data as TeamsResponse;

          // Save to localStorage with timestamp
          try {
            localStorage.setItem(
              `teamData_${teamId}`,
              JSON.stringify(itemsData)
            );
            localStorage.setItem(
              `teamData_${teamId}_timestamp`,
              new Date().getTime().toString()
            );
          } catch (error) {
            console.error("Error saving team data to localStorage:", error);
          }

          setDataTeam(itemsData);
          setIsLoadingProcess(false);
          if (itemsData.teamPict != null) {
            setImage(
              buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) +
                itemsData.teamPict
            );
          }
        }
      };

      const PayloadList: PaggingListPayloadCustom = {
        search: "",
        teamId: teamId,
        limit: 0,
        page: MAX_SIZE_TABLE,
        filterWhere: [],
        fieldOrder: ["nama"],
        orderDir: "asc",
      };

      const GetDataList = async () => {
        const requestData = await ListMembers(PayloadList, tokenData);
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          return;
        } else {
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            return;
          }

          const itemsData: UsersResponse[] =
            requestData.data as UsersResponse[];
          setDataTeamMembers(itemsData);
        }
      };

      GetDataTeam();
      GetDataList();
    } else {
      setIsLoadingProcess(false);
      console.warn("Team data is not available in auth context");
    }
  }, [DataAuth, RefreshData, tokenData]);

  return (
    <Flex pb={2}>
      <Box w={"full"}>
        <Box
          zIndex={1}
          pos={"relative"}
          h={"190px"}
          w={"full"}
          bgGradient={"linear(to-r, #1b517e, #063154)"}
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          backgroundSize="cover"
          backgroundImage={`url(/img/currency-bg.png)`}
          objectFit="cover"
          boxShadow={"md"}
          rounded={radiusStyle}
        >
          <Box
            rounded={radiusStyle}
            pos={"absolute"}
            top="0"
            left="0"
            w="full"
            h="full"
            bgGradient="linear(to-b, blackAlpha.200 0%, blackAlpha.800 100%)"
          ></Box>
        </Box>
        <Flex justify={"center"} mt={"-120px"} zIndex={2}>
          <Flex
            w={"full"}
            zIndex={2}
            px={{ base: 3, sm: 3, md: 8, lg: 8 }}
            justifyContent={"start"}
          >
            <Container maxW={"8xl"}>
              <Flex as={Stack} direction={"row"} spacing={5}>
                <Box
                  w={"160px"}
                  h={"160px"}
                  borderRadius={"full"}
                  overflow={"hidden"}
                  boxShadow={"lg"}
                >
                  <Image
                    src={image}
                    draggable={false}
                    w={"full"}
                    h={"full"}
                  />
                </Box>
                <Flex
                  alignItems={"start"}
                  color={"white"}
                  as={Stack}
                  pt={5}
                  spacing={1}
                >
                  <Heading as="h2" size="xl">
                    {DataTeam?.teamName}
                  </Heading>
                  <Flex
                    alignItems={"start"}
                    color={"white"}
                    as={Stack}
                    spacing={0}
                  >
                    <Text
                      fontWeight={600}
                      fontSize={"md"}
                      textStyle={"italic"}
                      as={"i"}
                      lineHeight={1}
                    >
                      {DataTeam?.division.orgName}
                    </Text>
                    <Text
                      fontWeight={500}
                      fontSize={"md"}
                      textStyle={"italic"}
                      as={"i"}
                      lineHeight={1.5}
                    >
                      {DataTeam?.group.orgName}
                    </Text>
                  </Flex>
                </Flex>
                <Spacer />
                <Flex>
                  <AvatarGroup size="md" max={4}>
                    {DataTeamMembers.map((dt, index) => (
                      <Avatar key={index} name={`${dt.nama}`} />
                    ))}
                  </AvatarGroup>
                </Flex>
              </Flex>
            </Container>
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
});

TeamProfile.displayName = "TeamProfile";

export default TeamProfile;
