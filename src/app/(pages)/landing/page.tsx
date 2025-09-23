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
  Grid,
  GridItem,
  Heading,
  HStack,
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
  useColorMode,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import Lottie from "lottie-react";
import { useState } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaHeart, FaInfo, FaPlay } from "react-icons/fa6";
import logoBjbFile from "../../json/bjb_loading_v01.json";
import { motion } from "framer-motion";
import { FiCode } from "react-icons/fi";
import { TiFlowMerge } from "react-icons/ti";

const MotionText = motion(Text);

// Card Component
const LandingCard = ({ index }: { index: number }) => {
  const offsetX = index * 25; // Straight diagonal to right
  const offsetY = index * 25; // Straight diagonal down
  const cardRotation = 15; // All cards slanted at same angle

  return (
    <Box
      bg="blue.500"
      rounded="lg"
      minH="120px"
      w="180px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight="semibold"
      _hover={{
        bg: "blue.600",
        transform: `translateX(${offsetX}px) translateY(${offsetY}px) rotate(${cardRotation}deg) scale(1.05)`,
        zIndex: 20,
      }}
      transition="all 0.3s ease"
      cursor="pointer"
      transform={`translateX(${offsetX}px) translateY(${offsetY}px) rotate(${cardRotation}deg)`}
      position="absolute"
      zIndex={9 - index}
      boxShadow="xl"
    >
      Card {index + 1}
    </Box>
  );
};

function LandingPage() {
  const [RefreshData, setRefreshData] = useState(0);
  const { colorMode } = useColorMode();
  const { isAuthenticated, authData } = useAuth();
  const RefreshAction = () => {
    setRefreshData(RefreshData + 1);
  };
  const [SearchChannels, setSearchChannels] = useState<string>("");

  const ModalForm = useDisclosure();

  return (
    <LayoutLanding>
      <Flex w={"full"} minH={"95vh"}>
        <Flex
          // zIndex={1}
          w={"full"}
          minH={"35vh"}
          // bgGradient={"linear(to-r, primary.500, secondary.500)"}
          bgGradient={colorMode == "light" ? "white" : "gray.900"}
          // backgroundPosition="center"
          // backgroundRepeat="no-repeat"
          // backgroundSize="cover"
          // backgroundImage={`url(./img/bjb-head-image.jpg)`}
          // rounded={radiusStyle}
          // boxShadow={"md"}
        >
          <VStack w={"full"} spacing={5}>
            {/* <RealTimeClock /> */}
            <Grid templateColumns="repeat(12, 1fr)" gap={0} w={"full"}>
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}
                w={"full"}
                minH={"95vh"}
                // bg={colorMode === "light" ? "gradient.primary" : "gray.900"}
                // bgGradient={colorMode === "light"
                //   ? "linear(135deg, blue.500, purple.600, pink.500)"
                //   : "linear(135deg, gray.800, gray.900, black)"
                // }
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                px={{ base: 5, sm: 5, md: 20, lg: 20 }}
              >
                <VStack
                  spacing={10}
                  textAlign="left"
                  color={colorMode === "light" ? "white" : "gray.100"}
                  alignItems="flex-start"
                  w={"full"}
                >
                  <VStack spacing={6} alignItems="flex-start" w={"full"}>
                    <MotionText
                      fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                      fontWeight="bold"
                      lineHeight="1.1"
                      bgGradient={
                        colorMode === "light"
                          ? "linear(to-r, secondary.500, secondary.900)"
                          : "linear(to-r, secondary.800, secondary.500)"
                      }
                      bgClip="text"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                    >
                      Project Management
                      <br />
                      Apps Platform
                    </MotionText>

                    <MotionText
                      fontSize={{ base: "xl", md: "2xl" }}
                      fontWeight="medium"
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                      lineHeight="1.4"
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      display="flex"
                      alignItems="center"
                      gap={3}
                    >
                      <TiFlowMerge size="28px" />
                      <span>
                        Build, manage, and deploy powerful project applications
                        with our comprehensive suite
                      </span>
                    </MotionText>
                  </VStack>

                  {/* Enhanced Feature Cards */}
                  <VStack spacing={2} alignItems="flex-start" w="full">
                    {[
                      {
                        title: "App Development",
                        desc: "Create custom project management applications",
                        color: "blue",
                      },
                      {
                        title: "Team Collaboration",
                        desc: "Real-time collaboration tools and workflows",
                        color: "purple",
                      },
                      {
                        title: "Analytics & Reports",
                        desc: "Advanced insights and performance tracking",
                        color: "pink",
                      },
                    ].map((feature, index) => (
                      <MotionText
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                        w="full"
                      >
                        <Box
                          px={4}
                          py={4}
                          backdropFilter={"blur(20px)"}
                          // bg={
                          //   colorMode === "light" ? "gray.100" : "whiteAlpha.50"
                          // }
                          rounded="xl"
                          border="1px solid"
                          borderColor={
                            colorMode === "light"
                              ? "blackAlpha.200"
                              : "whiteAlpha.100"
                          }
                          _hover={{
                            bg:
                              colorMode === "light"
                                ? "whiteAlpha.200"
                                : "whiteAlpha.100",
                            transform: "translateX(10px)",
                          }}
                          transition="all 0.3s ease"
                          cursor="pointer"
                        >
                          <HStack spacing={4}>
                            <Box
                              w="12px"
                              h="12px"
                              bg={`${feature.color}.500`}
                              rounded="full"
                            />
                            <VStack align="start" spacing={0}>
                              <Text
                                fontSize="lg"
                                fontWeight="bold"
                                color={
                                  colorMode === "light" ? "gray.800" : "white"
                                }
                              >
                                {feature.title}
                              </Text>
                              <Text
                                fontSize="sm"
                                color={
                                  colorMode === "light"
                                    ? "gray.600"
                                    : "gray.400"
                                }
                              >
                                {feature.desc}
                              </Text>
                            </VStack>
                          </HStack>
                        </Box>
                      </MotionText>
                    ))}
                  </VStack>

                  {/* Enhanced CTA Section */}
                  <VStack spacing={4} alignItems="flex-start">
                    <MotionText
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.8 }}
                    >
                      <Button
                        size={"md"}
                        bgGradient={
                          colorMode === "light"
                            ? "linear(to-r, secondary.500, secondary.900)"
                            : "linear(to-r, secondary.800, secondary.500)"
                        }
                        color="white"
                        _hover={{
                          // bg: colorMode === "light" ? "blue.700" : "blue.600",
                          transform: "translateY(-3px)",
                          shadow: "xl",
                        }}
                        _active={{ transform: "translateY(-1px)" }}
                        transition="all 0.3s ease"
                        fontWeight="bold"
                        px={10}
                        py={8}
                        fontSize="lg"
                        rounded="2xl"
                        onClick={() => {
                          window.location.href = "/home";
                        }}
                      >
                        Launch Your Project Apps
                      </Button>
                    </MotionText>

                    <MotionText
                      fontSize="md"
                      color={colorMode === "light" ? "gray.600" : "gray.400"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 1 }}
                    >
                      Join thousands of teams building better project management
                      solutions
                    </MotionText>
                  </VStack>
                </VStack>
              </GridItem>
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}
                w={"full"}
                minH={"95vh"}
                // bg={colorMode === "light" ? "gray.50" : "gray.900"}
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="relative"
                overflow="hidden"
              >
                {/* Large Background Gradient */}
                <Box
                  position="absolute"
                  top="0"
                  right="0"
                  w="100%"
                  h="100%"
                  bgGradient={
                    colorMode === "light"
                      ? "linear(to-r, transparent, transparent, secondary.500)"
                      : "linear(to-r, transparent, transparent, secondary.500)"
                  }
                  opacity="0.1"
                />

                {/* Main Content */}
                <VStack spacing={12} zIndex={2}>
                  {/* Large Floating Dashboard */}
                  <Box
                    w="400px"
                    h="250px"
                    bg={colorMode === "light" ? "white" : "gray.800"}
                    rounded="2xl"
                    shadow="2xl"
                    p={8}
                    transform="rotate(-5deg)"
                    _hover={{ transform: "rotate(-2deg) scale(1.02)" }}
                    transition="all 0.4s ease"
                    cursor="pointer"
                    border="1px solid"
                    borderColor={
                      colorMode === "light" ? "gray.200" : "gray.700"
                    }
                  >
                    <VStack spacing={4} align="start">
                      <HStack spacing={3}>
                        <Box w="60px" h="8px" bg="blue.500" rounded="full" />
                        <Box w="40px" h="8px" bg="purple.400" rounded="full" />
                        <Box w="30px" h="8px" bg="pink.400" rounded="full" />
                      </HStack>
                      <SimpleGrid columns={3} spacing={4} w="full">
                        {Array.from({ length: 6 }, (_, i) => (
                          <Box
                            key={i}
                            h="40px"
                            bg={colorMode === "light" ? "gray.100" : "gray.700"}
                            rounded="lg"
                          />
                        ))}
                      </SimpleGrid>
                      <Box w="full" h="60px" bg="blue.100" rounded="xl" />
                    </VStack>
                  </Box>

                  {/* Large Geometric Shapes */}
                  <HStack spacing={8}>
                    <Box
                      w="120px"
                      h="120px"
                      bg="blue.500"
                      rounded="3xl"
                      transform="rotate(45deg)"
                      _hover={{ transform: "rotate(50deg) scale(1.1)" }}
                      transition="all 0.3s ease"
                      cursor="pointer"
                      opacity="0.8"
                    />
                    <Box
                      w="100px"
                      h="100px"
                      border="8px solid"
                      borderColor="purple.500"
                      rounded="full"
                      _hover={{
                        borderColor: "purple.600",
                        transform: "scale(1.1)",
                      }}
                      transition="all 0.3s ease"
                      cursor="pointer"
                    />
                    <Box
                      w="80px"
                      h="140px"
                      bg="pink.500"
                      rounded="full"
                      transform="rotate(-15deg)"
                      _hover={{ transform: "rotate(-10deg) scale(1.1)" }}
                      transition="all 0.3s ease"
                      cursor="pointer"
                      opacity="0.9"
                    />
                  </HStack>

                  {/* Large Progress Bars */}
                  <VStack spacing={6} w="350px">
                    {[
                      { width: "85%", color: "blue.500" },
                      { width: "70%", color: "purple.500" },
                      { width: "95%", color: "pink.500" },
                      { width: "60%", color: "cyan.500" },
                    ].map((bar, index) => (
                      <Box key={index} w="full">
                        <Box
                          w="full"
                          h="12px"
                          bg={colorMode === "light" ? "gray.200" : "gray.700"}
                          rounded="full"
                          overflow="hidden"
                        >
                          <Box
                            w={bar.width}
                            h="full"
                            bg={bar.color}
                            rounded="full"
                            transition="all 1s ease"
                            _hover={{ w: "100%" }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </VStack>
                </VStack>

                {/* Large Floating Elements */}
                <Box
                  position="absolute"
                  top="10%"
                  left="10%"
                  w="40px"
                  h="40px"
                  bg="blue.500"
                  rounded="full"
                  opacity="0.6"
                />
                <Box
                  position="absolute"
                  bottom="15%"
                  right="15%"
                  w="30px"
                  h="30px"
                  bg="purple.500"
                  rounded="full"
                  opacity="0.7"
                />
                <Box
                  position="absolute"
                  top="50%"
                  right="5%"
                  w="25px"
                  h="25px"
                  bg="pink.500"
                  rounded="full"
                  opacity="0.5"
                />
              </GridItem>
            </Grid>
          </VStack>
        </Flex>
      </Flex>
    </LayoutLanding>
  );
}

export default LandingPage;
