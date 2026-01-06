"use client";

import LayoutLanding from "@/app/components/layoutLanding";
import RealTimeClock from "@/app/components/realtimeClock";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { useAuth } from "@/app/context/AuthContext";
import { truncateText, truncateToTwoWords } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AppsDataInterface, DATA_APPS } from "@/app/types/appsInterface";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
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
import { useState, useEffect } from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { FaHeart, FaInfo, FaPlay } from "react-icons/fa6";
import logoBjbFile from "../../json/bjb_loading_v01.json";
import { FiCode } from "react-icons/fi";
import { TiFlowMerge } from "react-icons/ti";

// Removed Text to fix hydration issues

interface HighlightTextLandingProps {
  title: string;
  desc: string;
  color: string;
}

interface AbstractUIDesignProps {
  width: string;
  color: string;
}

const HighlightTextLanding: HighlightTextLandingProps[] = [
  {
    title: "Team Collaboration",
    desc: "Real-time collaboration tools and workflows that foster strong teamwork and help members work together toward shared goals.",
    color: "blue",
  },
  {
    title: "Performance & Productivity Focus",
    desc: "Enables the improvement of both individual and team performance through productivity-enhancing features.",
    color: "purple",
  },
  {
    title: "Dynamic yet Structured",
    desc: "Prioritizes flexibility in project management while maintaining an organized and well-structured system.",
    color: "pink",
  },
  {
    title: "Analytics & Reports",
    desc: "Advanced insights and performance tracking",
    color: "green",
  },
];

const AbstractUIDesign: AbstractUIDesignProps[] = [
  { width: "85%", color: "blue.500" },
  { width: "70%", color: "purple.500" },
  { width: "95%", color: "pink.500" },
  { width: "60%", color: "cyan.500" },
];

function LandingPage() {
  useDocumentTitle("Login");
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLaunchApp = () => {
    const authData = localStorage.getItem("authData");
    const tokenData = localStorage.getItem("tokenData");

    if (!authData || !tokenData) {
      showToast({
        description: "Kamu harus login",
        statusToast: "error",
      });
      return;
    }

    window.location.href = "/workspace";
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <LayoutLanding>
        <Flex
          w={"full"}
          minH={"95vh"}
          bg="gray.50"
          align="center"
          justify="center"
        >
          <VStack spacing={4}>
            <Box
              w="60px"
              h="60px"
              border="4px solid"
              borderColor="blue.100"
              borderTopColor="blue.500"
              rounded="full"
              animation="spin 1s linear infinite"
            />
            <Text
              fontSize="lg"
              fontWeight="medium"
              color="gray.600"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
            >
              Please wait...
            </Text>
            <style jsx>{`
              @keyframes spin {
                to {
                  transform: rotate(360deg);
                }
              }
            `}</style>
          </VStack>
        </Flex>
      </LayoutLanding>
    );
  }

  return (
    <LayoutLanding>
      <Flex w={"full"} minH={"95vh"}>
        <Flex
          w={"full"}
          minH={"35vh"}
          bgGradient={colorMode == "light" ? "white" : "gray.900"}
        >
          <VStack w={"full"} spacing={5}>
            <Grid templateColumns="repeat(12, 1fr)" gap={0} w={"full"}>
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}
                w={"full"}
                minH={"95vh"}
                display="flex"
                alignItems="center"
                justifyContent="flex-start"
                px={{ base: 5, sm: 5, md: 20, lg: 20 }}
                py={10}
                mt={8}
              >
                <VStack
                  spacing={10}
                  textAlign="left"
                  color={colorMode === "light" ? "white" : "gray.100"}
                  alignItems="flex-start"
                  w={"full"}
                >
                  <VStack spacing={6} alignItems="flex-start" w={"full"}>
                    <Box
                      fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                      fontWeight="bold"
                      lineHeight="1.1"
                      bgGradient={
                        colorMode === "light"
                          ? "linear(to-r, secondary.500, secondary.900)"
                          : "linear(to-r, secondary.800, secondary.500)"
                      }
                      bgClip="text"
                    >
                      Application Performance
                      <br />
                      Productivity Projects
                    </Box>

                    <Box
                      fontSize={{ base: "md", md: "xl" }}
                      fontWeight="medium"
                      color={colorMode === "light" ? "gray.700" : "gray.300"}
                      lineHeight="1.4"
                      display="flex"
                      alignItems="center"
                      gap={3}
                    >
                      <TiFlowMerge size="28px" />
                      <Text>
                        Build, manage, and deploy powerful project applications
                        with our comprehensive suite
                      </Text>
                    </Box>
                  </VStack>

                  {/* Enhanced Feature Cards */}
                  <VStack spacing={2} alignItems="flex-start" w="full">
                    {HighlightTextLanding.map((feature, index) => (
                      <Box key={index} w="full">
                        <Box
                          px={4}
                          py={1}
                          backdropFilter={"blur(20px)"}
                          rounded="xl"
                          // border="1px solid"
                          // borderColor={
                          //   colorMode === "light"
                          //     ? "blackAlpha.200"
                          //     : "whiteAlpha.100"
                          // }
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
                                fontSize="md"
                                fontWeight="bold"
                                color={
                                  colorMode === "light" ? "gray.800" : "white"
                                }
                              >
                                {feature.title}
                              </Text>
                              <Text
                                fontSize="xs"
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
                      </Box>
                    ))}
                  </VStack>

                  {/* Enhanced CTA Section */}
                  <VStack spacing={4} alignItems="flex-start">
                    <Box>
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
                        onClick={handleLaunchApp}
                      >
                        Launch Your Project Apps
                      </Button>
                    </Box>
                  </VStack>
                </VStack>
              </GridItem>
              <GridItem
                colSpan={{ base: 12, sm: 12, md: 6, lg: 6 }}
                w={"full"}
                minH={"95vh"}
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
                    {AbstractUIDesign.map((bar, index) => (
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
