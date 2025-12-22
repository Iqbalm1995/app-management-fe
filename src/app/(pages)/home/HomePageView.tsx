"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import useWorkspace, { WorkspaceStatsViewModel } from "@/app/services/useWorkspace";
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
  Container,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState, useMemo } from "react";
import {
  FiUsers,
  FiFolder,
  FiCheckCircle,
  FiBarChart,
  FiTarget,
  FiZap,
  FiArrowRight,
  FiPieChart,
  FiFileText,
} from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Welcome",
  breadCrumb: ["Home"],
};

// Animated Globe Component
const AnimatedGlobe = () => {
  const { colorMode } = useColorMode();

  useEffect(() => {
    const canvas = document.getElementById("globe-canvas") as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 400;

    const centerX = 200;
    const centerY = 200;
    const radius = 150;
    let rotation = 0;
    let animationId: number;

    // Generate points on sphere
    const points: Array<{ x: number; y: number; z: number }> = [];
    const numPoints = 600;

    for (let i = 0; i < numPoints; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      points.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      });
    }

    const colors = { base: "255, 255, 255", glow: "255, 255, 255" };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, 400, 400);
      rotation += 0.003;

      points.forEach((point) => {
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        const rotatedX = point.x * cosR - point.z * sinR;
        const rotatedZ = point.x * sinR + point.z * cosR;

        if (rotatedZ > -45) {
          const scale = 200 / (200 + rotatedZ);
          const x2d = rotatedX * scale + centerX;
          const y2d = point.y * scale + centerY;
          const opacity = (rotatedZ + radius) / 300;
          const size = scale * 1.5;

          ctx.beginPath();
          ctx.arc(x2d, y2d, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${colors.base}, ${opacity * 0.7})`;
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, [colorMode]);

  return (
    <Box
      position="relative"
      w="400px"
      h="400px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <canvas id="globe-canvas" style={{ maxWidth: "100%", height: "auto" }} />
    </Box>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, color }: { value: number; color: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <Text fontSize="4xl" fontWeight="bold" color={color}>
      {count}
    </Text>
  );
};

function HomePageView() {
  const { colorMode } = useColorMode();
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState<WorkspaceStatsViewModel | null>(null);
  const { GetWorkspaceStats } = useWorkspace();

  const accentColor = useColorModeValue("blue.300", "blue.300");
  const textColor = useColorModeValue("gray.800", "white");
  const cardBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData");
    if (storedData) {
      const { dataLogin } = JSON.parse(storedData);
      const name = dataLogin?.nama || "User";
      setUserName(name.replace(/\b\w/g, (c: string) => c.toUpperCase()));
    }
    if (token) {
      GetWorkspaceStats(token).then((res) => {
        if (res?.data) setStats(res.data);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = useMemo(
    () => [
      {
        icon: FiFolder,
        title: "Project Management",
        description:
          "Manage and track all your projects in one centralized platform",
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
    ],
    []
  );

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      {/* Hero Section with Animated Background */}
      <Box
        position="relative"
        overflow="hidden"
        bgGradient={useColorModeValue(
          "linear(to-br, secondary.800, secondary.700, secondary.600)",
          "linear(to-br, gray.900, secondary.900, gray.900)"
        )}
        py={20}
        px={6}
        rounded={radiusStyle}
        mb={8}
        boxShadow={"md"}
        minH={"72vh"}
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
              fill={"#63B3ED"}
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
              stroke={"#cae3ff"}
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
          <Grid
            templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
            gap={8}
            alignItems="center"
          >
            {/* Left: Welcome Message */}
            <VStack
              spacing={6}
              textAlign={{ base: "center", lg: "left" }}
              align={{ base: "center", lg: "start" }}
            >
              <Box as="div" animation="fadeInScale 1.2s ease-out">
                <Text
                  fontSize="lg"
                  color={accentColor}
                  fontWeight="semibold"
                  mb={2}
                >
                  Welcome back, {userName}!
                </Text>
                <Heading
                  fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                  fontWeight="bold"
                  bgGradient="linear(to-r, purple.200, purple.400, pink.500)"
                  bgClip="text"
                  lineHeight="shorter"
                >
                  Ready to manage your projects?
                </Heading>
              </Box>
              <Box as="div" animation="fadeInUp 1s ease-out 0.3s backwards">
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  color={"white"}
                  opacity={0.9}
                >
                  Streamline your workflow, collaborate with your team, and
                  deliver projects successfully
                </Text>
              </Box>
              <Box as="div" animation="fadeInUp 1s ease-out 0.6s backwards">
                <HStack spacing={4} pt={4}>
                  <Button
                    as="a"
                    href="/workspace"
                    size="lg"
                    bgColor={"white"}
                    color={"secondary.600"}
                    rightIcon={<FiArrowRight />}
                    _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    transition="all 0.3s"
                  >
                    Go to Workspace
                  </Button>
                  <Button
                    as="a"
                    href="/reports/dashboard-portfolio"
                    size="lg"
                    variant="outline"
                    bgColor={"transparent"}
                    borderColor={"white"}
                    color={"secondary.100"}
                    _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    transition="all 0.3s"
                  >
                    View Reports
                  </Button>
                </HStack>
              </Box>

              {/* Stats inside hero */}
              {stats && (
                <Box as="div" animation="fadeInUp 1s ease-out 0.8s backwards" pt={8}>
                  <Grid templateColumns="repeat(4, 1fr)" gap={8}>
                    <VStack spacing={1}>
                      <AnimatedCounter value={stats.totalProjects} color="blue.300" />
                      <Text fontSize="sm" color="white" opacity={0.8}>Total Projects</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <AnimatedCounter value={stats.activeProjects} color="green.300" />
                      <Text fontSize="sm" color="white" opacity={0.8}>Active Projects</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <AnimatedCounter value={stats.totalTasks} color="purple.300" />
                      <Text fontSize="sm" color="white" opacity={0.8}>Total Tasks</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <AnimatedCounter value={stats.overdueTasks} color="orange.300" />
                      <Text fontSize="sm" color="white" opacity={0.8}>Overdue Tasks</Text>
                    </VStack>
                  </Grid>
                </Box>
              )}
            </VStack>

            {/* Right: Animated Globe */}
            <Box
              display={{ base: "none", lg: "block" }}
              animation="fadeInUp 1s ease-out 0.4s backwards"
            >
              <AnimatedGlobe />
            </Box>
          </Grid>
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
                    "div:hover > &": { opacity: 0.1 },
                  }}
                  pointerEvents="none"
                />

                <CardBody p={8} position="relative" zIndex={1}>
                  <VStack align="start" spacing={5}>
                    <Flex w="full" justify="space-between" align="center">
                      <Box
                        p={4}
                        rounded="xl"
                        bgGradient={feature.gradient}
                        shadow="lg"
                        _hover={{
                          transform: "rotate(10deg) scale(1.15)",
                          shadow: "xl",
                        }}
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
