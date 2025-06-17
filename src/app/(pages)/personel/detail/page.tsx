"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Image,
  Input,
  Spacer,
  Stack,
  Text,
  Textarea,
  useColorMode,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AreaDataSetProps, RadarChart } from "../../home/charts/radarChart";
import { getRandomNumberInclusive } from "@/app/helper/MasterHelper";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Detail Personel",
  breadCrumb: ["Home", "Personel", "Detail"],
};

interface SkillValueProps {
  label: string;
  value: number;
}

function SettingsPage() {
  const { colorMode } = useColorMode();

  const [DataStatisticView, setDataStatisticView] = useState<
    AreaDataSetProps[]
  >([]);
  const [DataSkill, setDataSkill] = useState<string[]>([
    "SYSTEM ANALYS",
    "BUSINESS ANALYS",
    "TECH LEAD",
    "FRONTEND ENGINEER",
    "BACKEND ENGINEER",
    "MOBILE ENGINEER",
    "UI/UX",
    "DEVS OPS",
    "TECH WRITER",
    "QA",
  ]);
  const [RefreshData, setRefreshData] = useState<number>(0);

  useEffect(() => {
    const DataTaskMonitor: AreaDataSetProps[] = [
      {
        name: "PERFORMENCE",
        data: [
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
          getRandomNumberInclusive(0, 99),
        ],
      },
    ];
    setDataStatisticView(DataTaskMonitor);
  }, [RefreshData]);

  // ////////////////////////

  const [log, setLog] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [msg, setMsg] = useState("");
  const toast = useToast();

  const appendLog = (message: string) => {
    setLog((prev) => [...prev, message]);
  };

  const connect = () => {
    const ws = new WebSocket(`ws://192.168.239.117:6666/ws`);

    ws.onopen = () => {
      appendLog("✅ Connected to WebSocket");
      ws.send("Hello from Chakra client!");
      toast({
        title: "Connected",
        description: "WebSocket connection established.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    };

    ws.onmessage = (e) => {
      appendLog("📨 " + e.data);
    };

    ws.onclose = () => {
      appendLog("❌ Disconnected from server");
      toast({
        title: "Disconnected",
        description: "WebSocket connection closed.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
    };

    ws.onerror = () => {
      appendLog("💥 WebSocket error");
      toast({
        title: "Error",
        description: "Failed to connect to WebSocket server.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    };

    setSocket(ws);
  };

  const sendMsg = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(msg);
      setMsg("");
    } else {
      toast({
        title: "Not connected",
        description: "Connect to WebSocket before sending a message.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      <Flex as={Stack} pb={2}>
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
                    border={"4px"}
                    borderColor={"white"}
                  >
                    <Image
                      src={"/img/36550193.png"}
                      draggable={false} // Prevent image from being draggable
                      w={"full"}
                      h={"full"}
                    />
                  </Box>
                  <Flex
                    //   bg={"red"}
                    //   maxW={"280px"}
                    alignItems={"start"}
                    color={"white"}
                    as={Stack}
                    pt={6}
                    spacing={1}
                  >
                    <Heading as="h2" size="xl">
                      Developer full setak
                    </Heading>
                    <Text
                      fontWeight={550}
                      fontSize={"xl"}
                      textStyle={"italic"}
                      as={"i"}
                    >
                      #SetakPisanNjir
                    </Text>
                  </Flex>
                  <Spacer />
                  {/* <Flex>
                        {DataTeam && DataTeam.teamUserMembers.length > 0 && (
                          <AvatarGroup size="md" max={4}>
                            {DataTeam.teamUserMembers.map((dt, index) => (
                              <Avatar
                                key={index}
                                name={`${dt.userFirstName} ${dt.userLastName}`}
                              />
                            ))}
                          </AvatarGroup>
                        )}
                      </Flex> */}
                </Flex>
              </Container>
            </Flex>
          </Flex>

          {/* <pre>{JSON.stringify(DataTeam?.teamUserMembers, null, 2)}</pre> */}
        </Box>

        <Flex as={Stack}>
          <Grid templateColumns="repeat(12, 1fr)" gap={4} w={"full"}>
            <GridItem colSpan={{ base: 12, sm: 6, md: 6, lg: 4 }}>
              <Flex
                w={"full"}
                minH={"200px"}
                rounded={radiusStyle}
                bgColor={colorMode == "light" ? "white" : "gray.800"}
                boxShadow={"md"}
                alignItems={"center"}
                justifyContent={"center"}
              >
                {/* <RadarChart
                  data={DataStatisticView}
                  categories={DataSkill}
                  height={"400px"}
                /> */}
                <Box p={6} maxW="600px" mx="auto">
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">🧪 WebSocket Test (Chakra UI)</Heading>

                    <Button colorScheme="blue" onClick={connect}>
                      Join Room
                    </Button>

                    <Textarea
                      value={log.join("\n")}
                      readOnly
                      placeholder="Connection log..."
                      height="200px"
                      fontFamily="mono"
                    />

                    <HStack>
                      <Input
                        placeholder="Type a message..."
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                      />
                      <Button onClick={sendMsg} colorScheme="green">
                        Send
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </Flex>
            </GridItem>
          </Grid>
        </Flex>
      </Flex>
    </LayoutAdmin>
  );
}

export default SettingsPage;
