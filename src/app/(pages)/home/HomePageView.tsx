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
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Text,
  useColorMode,
  VStack,
  SimpleGrid,
  Container,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiTrendingUp,
  FiUsers,
  FiFolder,
  FiCheckCircle,
  FiBarChart,
  FiActivity,
  FiTarget,
  FiZap,
  FiArrowRight,
  FiLayers,
  FiPieChart,
  FiFileText,
} from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Welcome",
  breadCrumb: ["Home"],
};

function HomePageView() {
  const { colorMode } = useColorMode();
  const [userName, setUserName] = useState<string>("");

  const bgColor = useColorModeValue("white", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    if (storedData) {
      const authData = JSON.parse(storedData);
      setUserName(authData?.data?.userFullName || "User");
    }
  }, []);

  const features = [
    {
      icon: FiFolder,
      title: "Project Management",
      description: "Manage and track all your projects in one centralized platform",
      color: "blue.500",
      gradient: "linear(to-br, blue.400, blue.600)",
    },
    {
      icon: FiUsers,
      title: "Team Collaboration",
      description: "Work together seamlessly with your team members",
      color: "green.500",
      gradient: "linear(to-br, green.400, green.600)",
    },
    {
      icon: FiBarChart,
      title: "Analytics & Reports",
      description: "Get insights with comprehensive dashboard and reporting",
      color: "purple.500",
      gradient: "linear(to-br, purple.400, purple.600)",
    },
    {
      icon: FiCheckCircle,
      title: "Task Tracking",
      description: "Monitor progress and ensure timely completion of tasks",
      color: "orange.500",
      gradient: "linear(to-br, orange.400, orange.600)",
    },
    {
      icon: FiFileText,
      title: "Requirements",
      description: "Track BRD/RFC requirements and documentation",
      color: "cyan.500",
      gradient: "linear(to-br, cyan.400, cyan.600)",
    },
    {
      icon: FiPieChart,
      title: "Portfolio Dashboard",
      description: "Visualize project portfolio with interactive charts",
      color: "pink.500",
      gradient: "linear(to-br, pink.400, pink.600)",
    },
  ];

  const stats = [
    { label: "Active Projects", value: "150+", icon: FiFolder, color: "blue" },
    { label: "Team Members", value: "50+", icon: FiUsers, color: "green" },
    { label: "Completed Tasks", value: "1,200+", icon: FiCheckCircle, color: "purple" },
    { label: "Success Rate", value: "95%", icon: FiTrendingUp, color: "orange" },
  ];

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      {/* Hero Section with Animated Background */}
      <Box
        position="relative"
        overflow="hidden"
        bgGradient={useColorModeValue(
          "linear(to-br, secondary.50, cyan.50, secondary.100)",
          "linear(to-br, gray.900, blue.900, purple.900)"
        )}
        py={20}
        px={6}
        rounded={radiusStyle}
        mb={8}
        boxShadow={"md"}
      >
        {/* Animated Wave Background */}
        <Box
          position="absolute"
          top="0"
          left="0"
          w="full"
          h="full"
          overflow="hidden"
          opacity={0.1}
        >
          <svg
            style={{
              position: "absolute",
              top: "0",
              left: "-10%",
              width: "120%",
              height: "100%",
            }}
            viewBox="0 0 1200 600"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,100 Q300,50 600,100 T1200,100 L1200,0 L0,0 Z"
              fill={colorMode === "light" ? "#3182CE" : "#63B3ED"}
            >
              <animate
                attributeName="d"
                dur="10s"
                repeatCount="indefinite"
                values="
                  M0,100 Q300,50 600,100 T1200,100 L1200,0 L0,0 Z;
                  M0,80 Q300,120 600,80 T1200,80 L1200,0 L0,0 Z;
                  M0,100 Q300,50 600,100 T1200,100 L1200,0 L0,0 Z
                "
              />
            </path>
            <path
              d="M0,200 Q400,150 800,200 T1200,200"
              stroke={colorMode === "light" ? "#3795ff" : "#cae3ff"}
              strokeWidth="3"
              fill="none"
            >
              <animate
                attributeName="d"
                dur="8s"
                repeatCount="indefinite"
                values="
                  M0,200 Q400,150 800,200 T1200,200;
                  M0,180 Q400,220 800,180 T1200,180;
                  M0,200 Q400,150 800,200 T1200,200
                "
              />
            </path>
          </svg>
        </Box>

        {/* Floating Circles */}
        <Box
          position="absolute"
          top="10%"
          right="10%"
          w="100px"
          h="100px"
          borderRadius="full"
          border="2px solid"
          borderColor={accentColor}
          opacity={0.2}
        >
          <Box
            as="div"
            animation="float 6s ease-in-out infinite"
            w="full"
            h="full"
          />
        </Box>
        <Box
          position="absolute"
          bottom="15%"
          left="15%"
          w="60px"
          h="60px"
          borderRadius="full"
          bg={accentColor}
          opacity={0.1}
        >
          <Box
            as="div"
            animation="float 8s ease-in-out infinite 1s"
            w="full"
            h="full"
          />
        </Box>

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={6} textAlign="center">
            <Box as="div" animation="fadeInScale 1.2s ease-out">
              <Heading
                fontSize={{ base: "3xl", md: "5xl", lg: "6xl" }}
                fontWeight="bold"
                bgGradient="linear(to-r, secondary.800, secondary.600, secondary.500)"
                bgClip="text"
              >
                Welcome to Project Management
              </Heading>
            </Box>
            <Box as="div" animation="fadeInUp 1s ease-out 0.3s backwards">
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color={textColor}
                maxW="2xl"
                opacity={0.9}
              >
                Streamline your workflow, collaborate with your team, and
                deliver projects successfully
              </Text>
            </Box>
            <Box as="div" animation="fadeInUp 1s ease-out 0.6s backwards">
              <HStack spacing={4} pt={4}>
                <Button
                  size="lg"
                  colorScheme="blue"
                  rightIcon={<FiArrowRight />}
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.3s"
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="blue"
                  _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                  transition="all 0.3s"
                >
                  Learn More
                </Button>
              </HStack>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box mb={8}>
        <VStack spacing={4} mb={12} textAlign="center">
          <Box animation="fadeInUp 1s ease-out">
            <Heading size="xl" color={textColor}>
              Powerful Features
            </Heading>
          </Box>
          <Box animation="fadeInUp 1s ease-out 0.2s backwards">
            <Text
              fontSize="lg"
              color={useColorModeValue("gray.600", "gray.400")}
              maxW="2xl"
            >
              Everything you need to manage projects efficiently and effectively
            </Text>
          </Box>
        </VStack>

        <Grid
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(3, 1fr)",
          }}
          gap={8}
        >
          {features.map((feature, index) => (
            <GridItem key={index}>
              <Card
                bg={cardBg}
                rounded="2xl"
                shadow="xl"
                h="full"
                border="1px solid"
                borderColor={useColorModeValue("gray.100", "gray.700")}
                _hover={{ 
                  transform: "translateY(-8px) scale(1.02)", 
                  shadow: "2xl",
                  borderColor: feature.color,
                }}
                transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                position="relative"
                overflow="hidden"
                animation={`fadeInUp 0.6s ease-out ${index * 0.1}s backwards`}
              >
                {/* Gradient Glow Effect */}
                <Box
                  position="absolute"
                  top="-50%"
                  left="-50%"
                  w="200%"
                  h="200%"
                  bgGradient={feature.gradient}
                  opacity={0}
                  transition="opacity 0.4s"
                  sx={{
                    'div:hover > &': { opacity: 0.1 }
                  }}
                  pointerEvents="none"
                />
                
                <CardBody p={8} position="relative" zIndex={1}>
                  <VStack align="start" spacing={5}>
                    <Flex
                      w="full"
                      justify="space-between"
                      align="center"
                    >
                      <Box
                        p={4}
                        rounded="xl"
                        bgGradient={feature.gradient}
                        shadow="lg"
                        _hover={{ transform: "rotate(10deg) scale(1.15)", shadow: "xl" }}
                        transition="all 0.4s"
                      >
                        <Icon as={feature.icon} boxSize={8} color="white" />
                      </Box>
                    </Flex>
                    <VStack align="start" spacing={3} w="full">
                      <Heading size="md" color={textColor} fontWeight="bold">
                        {feature.title}
                      </Heading>
                      <Text 
                        color={useColorModeValue("gray.600", "gray.400")}
                        fontSize="sm"
                        lineHeight="tall"
                      >
                        {feature.description}
                      </Text>
                    </VStack>
                    <Box
                      w="full"
                      h="1px"
                      bgGradient={feature.gradient}
                      opacity={0.3}
                    />
                  </VStack>
                </CardBody>
              </Card>
            </GridItem>
          ))}
        </Grid>
      </Box>

      {/* CTA Section with Wave Background */}
      <Box
        position="relative"
        overflow="hidden"
        bgGradient={useColorModeValue(
          "linear(to-r, blue.500, purple.600)",
          "linear(to-r, blue.600, purple.700)"
        )}
        py={16}
        px={6}
        rounded={radiusStyle}
        mb={8}
      >
        {/* Bottom Wave */}
        <Box
          position="absolute"
          bottom="0"
          left="0"
          w="full"
          h="100px"
          overflow="hidden"
        >
          <svg
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              width: "100%",
              height: "100%",
            }}
            viewBox="0 0 1200 120"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z"
              fill="rgba(255,255,255,0.1)"
            >
              <animate
                attributeName="d"
                dur="12s"
                repeatCount="indefinite"
                values="
                  M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z;
                  M0,40 Q300,80 600,40 T1200,40 L1200,120 L0,120 Z;
                  M0,60 Q300,20 600,60 T1200,60 L1200,120 L0,120 Z
                "
              />
            </path>
          </svg>
        </Box>

        <Container maxW="container.xl" position="relative" zIndex={1}>
          <VStack spacing={6} textAlign="center" color="white">
            <Icon as={FiZap} boxSize={12} />
            <Heading fontSize={{ base: "2xl", md: "4xl" }}>
              Ready to Get Started?
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} maxW="2xl" opacity={0.9}>
              Join thousands of teams already using our platform to deliver
              successful projects
            </Text>
            <Button
              size="lg"
              bg="white"
              color="blue.600"
              rightIcon={<FiArrowRight />}
              _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
              transition="all 0.3s"
            >
              Start Your Journey
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Inline Keyframes */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes fadeInScale {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(30px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </LayoutAdmin>
  );
}

export default HomePageView;
