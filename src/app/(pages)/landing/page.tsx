"use client";

import LayoutLanding from "@/app/components/layoutLanding";
import RealTimeClock from "@/app/components/realtimeClock";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { useAuth } from "@/app/context/AuthContext";
import { truncateText, truncateToTwoWords } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AppsDataInterface, DATA_APPS } from "@/app/types/appsInterface";
import { Search2Icon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  SimpleGrid,
  Stack,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import Lottie from "lottie-react";
import { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaHeart, FaInfo, FaPlay } from "react-icons/fa6";
import logoBjbFile from "../../json/bjb_loading_v01.json";
import { motion } from "framer-motion";

const MotionText = motion(Text);

function LandingPage() {
  const [RefreshData, setRefreshData] = useState(0);
  const { isAuthenticated, authData } = useAuth();
  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };
  const [SearchChannels, setSearchChannels] = useState<string>("");

  const ModalForm = useDisclosure();

  return (
    <LayoutLanding>
      <Flex w={"full"} minH={"92vh"}>
        <Flex
          zIndex={1}
          w={"full"}
          minH={"35vh"}
          bgGradient={"linear(to-r, primary.500, secondary.500, yellow.500)"}
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          backgroundSize="cover"
          backgroundImage={`url(./img/bjb-head-image.jpg)`}
          // rounded={radiusStyle}
          boxShadow={"md"}
        >
          <Flex
            w="full"
            minH={"35vh"}
            bgGradient="linear(to-b, rgba(0, 89, 144, 0.1) 0%, rgba(17, 17, 17, 1) 110%)"
            // rounded={radiusStyle}
            justifyContent={"center"}
            alignItems={"start"}
            p={5}
          >
            <VStack w={"full"} spacing={5} pt={"8vh"}>
              {/* <SimpleGrid columns={2} spacing={2} w={"full"}>
                <Flex as={Stack} w={"full"} spacing={0}>
                  <Text color={"white"} fontSize={"smaller"}>
                    Selamat Datang,
                  </Text>
                  <Text color={"white"}>
                    {truncateToTwoWords("Mohamad Iqbal Musyaffa")}
                  </Text>
                </Flex>
                <Flex w={"full"} justifyContent={"end"}>
                  <Heading as="h4" size="md" color={"white"}>
                    SQUAD KOBRA
                  </Heading>
                </Flex>
              </SimpleGrid> */}
              <RealTimeClock />

              <InputGroup
                w={{ base: "full", sm: "full", md: "60%", lg: "60%" }}
              >
                <InputLeftElement pointerEvents="none" boxSize={12} h={"full"}>
                  <Search2Icon color={"primary.500"} />
                </InputLeftElement>
                <Input
                  type="text"
                  placeContent={"center"}
                  placeholder="Cari Apps"
                  rounded={"3xl"}
                  bg={useColorModeValue("white", "gray.800")}
                  size={"lg"}
                  value={SearchChannels}
                  onChange={(e) => setSearchChannels(e.target.value)}
                />
              </InputGroup>

              {/* LIST CONTENT */}

              <Container
                as={Stack}
                maxW={"container.xl"}
                mt={"60px"}
                spacing={5}
              >
                <Flex as={Stack} rounded={radiusStyle} w={"full"} spacing={4}>
                  <Flex
                    as={Stack}
                    rounded={radiusStyle}
                    w={"full"}
                    p={4}
                    spacing={4}
                  >
                    <Heading as="h4" size="md" color={"white"}>
                      SQUAD IBC APPS
                    </Heading>
                    <Box overflowX="auto" whiteSpace="nowrap" py={6}>
                      <Box display="inline-flex" gap={4}>
                        {DATA_APPS.filter(
                          (x) =>
                            x.appName &&
                            x.appName
                              .toLocaleLowerCase()
                              .includes(SearchChannels.toLocaleLowerCase())
                        ).map((item, idx) => (
                          <AppsDrawSquareV2
                            key={idx}
                            data={{
                              dataProduct: item,
                              refreshAction: RefreshAction,
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Flex>
                </Flex>
                {/* <Box color={"white"}>
                  <pre>{JSON.stringify(authData, null, 2)}</pre>
                </Box> */}
              </Container>
            </VStack>
          </Flex>
        </Flex>
      </Flex>
    </LayoutLanding>
  );
}

interface AppsDrawSquareProps {
  dataProduct: AppsDataInterface;
  refreshAction: () => void;
}

const AppsDrawSquareV2 = ({ data }: { data: AppsDrawSquareProps }) => {
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const showToast = useToastHelper();
  const [isHovered, setIsHovered] = useState(false);
  // const { isOpen, onOpen, onClose } = useDisclosure();
  const ModalAuth = useDisclosure();
  const ModalLoadingLauncher = useDisclosure();
  const { authData } = useAuth();

  const [LoadingProcess, setLoadingProcess] = useState<boolean>(false);
  const [TextLoading, setTextLoading] = useState<string>("Starting...");

  const [DirectUrl, setDirectUrl] = useState<string | null>(null);

  const runAppsGenerateLink = async () => {
    await showLadingApps();
  };

  const showLadingApps = async () => {
    ModalLoadingLauncher.onOpen();
    setTextLoading("Starting...");
    await delay(2000);
    // window.open(DirectUrl, "_blank");
    ModalLoadingLauncher.onClose();
    ModalAuth.onClose();
    setTextLoading("");
  };

  return (
    <>
      <Tooltip
        hasArrow
        label={data.dataProduct.appName}
        bg={"secondary.800"}
        color={"white"}
        borderRadius={radiusStyle}
      >
        <Flex
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          py={6}
          px={3}
          rounded={radiusStyle}
          bgGradient={
            isHovered && data.dataProduct.appsStatus == "ACTIVE"
              ? "linear(to-br, primary.500, secondary.500)" // when hovered and active
              : useColorModeValue(
                  "linear(to-br, white, gray.50)", // for light mode when not active
                  "linear(to-br, gray.800, gray.900)" // for dark mode when not active
                )
          }
          boxShadow={"lg"}
          _hover={
            data.dataProduct.appsStatus == "ACTIVE"
              ? {
                  bgGradient: "linear(to-br, secondary.500, secondary.400)",
                  color: "white",
                  cursor: "pointer",
                }
              : {
                  opacity: 0.7, // Reduce opacity on hover
                  cursor: "not-allowed", // Change cursor to indicate it's not clickable
                }
          }
          _active={
            data.dataProduct.appsStatus == "ACTIVE"
              ? {
                  bgGradient: "linear(to-br, primary.500, secondary.500)",
                  transform: "scale(0.99)", // Slightly scale down on click
                  boxShadow: "0 0 15px rgba(0, 139, 255, 0.5)", // Optionally add a shadow for depth
                }
              : {}
          }
          color={useColorModeValue("gray.600", "gray.100")}
          transition="transform 0.2s ease-in-out, background-color 0.2s ease, box-shadow 0.2s ease-in-out" // Animate transform and box-shadow
          transform={
            isHovered && data.dataProduct.appsStatus == "ACTIVE"
              ? "translateY(-10px)"
              : "translateY(0)"
          }
          justifyContent={"center"}
          alignItems={"center"}
          h={"190px"}
          w={"180px"}
          onClick={
            data.dataProduct.appsStatus == "ACTIVE"
              ? ModalAuth.onOpen
              : ModalAuth.onClose
          }
        >
          <Flex as={VStack} spacing={0} w={"full"} pt={4}>
            <Flex
              pos={"relative"}
              w={"100px"}
              h={"100px"}
              borderRadius={radiusStyle}
              overflow={"hidden"}
              zIndex={0}
              boxShadow={"md"}
            >
              <Image
                pos={"absolute"}
                src={
                  data.dataProduct.iconApps != null
                    ? data.dataProduct.iconApps
                    : "/img/default-apps.jpg"
                }
                // rounded={"3xl"}
                filter={
                  data.dataProduct.appsStatus == "ACTIVE"
                    ? "grayscale(0%)"
                    : "grayscale(100%)"
                }
                draggable={false} // Prevent image from being draggable
                w={"full"}
                h={"full"}
                zIndex={0}
              />
            </Flex>
            <Flex
              w={"full"}
              h={"45px"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Text
                textAlign={"center"}
                fontWeight={600}
                userSelect="none" // Prevent text from being selectable
              >
                {truncateText(data.dataProduct.appShortName, 50)}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Tooltip>
      <Modal
        size={"2xl"}
        isOpen={ModalAuth.isOpen}
        onClose={ModalAuth.onClose}
        isCentered
        key={"ModalAuth"}
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={useColorModeValue("white", "gray.900")}
        >
          {/* <ModalHeader>Launch Apps</ModalHeader> */}
          <ModalCloseButton color={"white"} />
          <ModalBody p={0}>
            <Flex minH={"40vh"}>
              <Box overflow={"hidden"} w={"full"}>
                <Box
                  zIndex={-1}
                  pos={"relative"}
                  h={"240px"}
                  w={"full"}
                  bgGradient={"linear(to-r, #1b517e, #063154)"}
                  backgroundPosition="center"
                  backgroundRepeat="no-repeat"
                  backgroundSize="cover"
                  backgroundImage={`url(./img/currency-bg.png)`}
                  objectFit="cover"
                  boxShadow={"md"}
                  roundedTop={radiusStyle}
                >
                  <Box
                    // rounded={"xl"}
                    roundedTop={radiusStyle}
                    pos={"absolute"}
                    top="0"
                    left="0"
                    w="full"
                    h="full"
                    bgGradient="linear(to-b, blackAlpha.200 0%, blackAlpha.800 80%)"
                  ></Box>
                </Box>
                <Flex justify={"center"} mt={"-80px"} zIndex={2}>
                  <Flex
                    w={"full"}
                    zIndex={2}
                    px={5}
                    justifyContent={"start"}
                    // bg={"blue"}
                  >
                    <Container maxW={"8xl"}>
                      <Flex as={Stack} direction={"row"} spacing={5}>
                        <Box
                          w={"120px"}
                          h={"120px"}
                          borderRadius={"3xl"}
                          overflow={"hidden"}
                          boxShadow={"lg"}
                        >
                          <Image
                            src={
                              data.dataProduct.iconApps ||
                              "/img/default-apps.jpg"
                            }
                            // rounded={"3xl"}
                            draggable={false} // Prevent image from being draggable
                            w={"full"}
                            h={"full"}
                          />
                        </Box>
                        <Flex
                          // bg={"red"}
                          maxH={"70px"}
                          maxW={"280px"}
                          alignItems={"end"}
                        >
                          <Text
                            fontWeight={550}
                            fontSize={"larger"}
                            color={"white"}
                          >
                            {data.dataProduct.appName}
                          </Text>
                        </Flex>
                      </Flex>
                    </Container>
                  </Flex>
                </Flex>

                <Box p={6}>
                  <Stack spacing={0} align={"center"} gap={2} mb={5}>
                    {/* <Heading
                      fontSize={"2xl"}
                      fontWeight={600}
                      textAlign={"center"}
                    >
                      {data.dataProduct.appName}
                    </Heading> */}
                    <>
                      {/* <Text color={"gray.500"} fontStyle={"italic"}>
                        Aplikasi sudah terikat SSO
                      </Text> */}
                      <Stack w={"full"} pt={6} spacing={2} direction={"column"}>
                        <Button
                          size={"lg"}
                          w={"full"}
                          colorScheme={"primary"}
                          minH={"60px"}
                          leftIcon={<FaPlay />}
                          onClick={() => {
                            runAppsGenerateLink();
                          }}
                          isLoading={LoadingProcess}
                        >
                          Launch
                        </Button>
                        <Button
                          size={"sm"}
                          w={"full"}
                          colorScheme={"secondary"}
                          variant={"ghost"}
                          leftIcon={<AiOutlineInfoCircle />}
                        >
                          Detail
                        </Button>
                      </Stack>
                    </>
                  </Stack>
                </Box>
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
      <LoginPanel
        key={"loginPanel"}
        isOpenDisc={ModalLoadingLauncher.isOpen}
        onCloseDisc={ModalLoadingLauncher.onClose}
        textLoading={TextLoading}
      />
    </>
  );
};

const LoginPanel = ({
  isOpenDisc,
  onCloseDisc,
  textLoading,
}: {
  isOpenDisc: boolean;
  onCloseDisc: () => void;
  textLoading: string;
}) => {
  return (
    <Modal
      size={"2xl"}
      isOpen={isOpenDisc}
      onClose={onCloseDisc}
      isCentered
      key={"ModalLoadingLauncher"}
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent rounded={"2xl"} m={2}>
        <ModalBody p={0}>
          <Flex
            minH={"30vh"}
            w={"full"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Stack spacing={2}>
              <Flex w={"full"} justifyContent={"center"}>
                <Lottie
                  autoplay
                  loop
                  animationData={logoBjbFile}
                  style={{ height: "10vh", width: "10vh" }}
                />
              </Flex>
              <Flex
                w={"full"}
                justifyContent={"center"}
                alignItems={"center"}
                h={"5vh"}
              >
                <MotionText
                  fontWeight={600}
                  // color={"gray.800"}
                  color={useColorModeValue("gray.800", "gray.50")}
                  initial={{ opacity: 0, y: 20 }} // Start faded out and below
                  animate={{ opacity: 1, y: 0 }} // Animate to fade in and move up
                  exit={{ opacity: 0, y: -20 }} // Optional: animate out when component is removed
                  transition={{ duration: 0.8 }} // Animation duration
                  key={textLoading} // Key ensures a new animation when text changes
                >
                  {textLoading}
                </MotionText>
              </Flex>
            </Stack>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LandingPage;
