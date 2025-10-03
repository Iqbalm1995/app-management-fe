"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
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
  Badge,
  Avatar,
  Progress,
  Divider,
  Container,
  Image,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { useEffect, useState } from "react";
import {
  FiStar,
  FiTrendingUp,
  FiUsers,
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiTarget,
  FiActivity,
  FiBarChart,
  FiCalendar,
  FiArrowRight,
  FiGift,
  FiZap,
  FiHeart,
  FiAward,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import {
  MdOutlineRocket,
  MdOutlineAutoAwesome,
  MdOutlineWorkspacePremium,
} from "react-icons/md";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Project Management Dashboard",
  breadCrumb: ["Home", "Dashboard"],
};

// Animation keyframes
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
  100% { transform: translateY(0px) rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

function HomePageView() {
  const { colorMode } = useColorMode();

  // Auth setup
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [currentTime, setCurrentTime] = useState(new Date());

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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getGreetingIcon = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return FiSun;
    if (hour < 17) return FiSun;
    return FiMoon;
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      {/* Hero Section */}
      <Box
        position="relative"
        overflow="hidden"
        bgGradient={
          colorMode === "light"
            ? "linear(135deg, secondary.400, secondary.700, yellow.400)"
            : "linear(135deg, secondary.600, secondary.800, yellow.600)"
        }
        color="white"
        py={16}
        px={6}
        mx={4}
        mt={6}
        rounded="2xl"
        shadow="2xl"
      >
        {/* Animated Background Elements */}
        <Box
          position="absolute"
          top="10%"
          right="10%"
          w={20}
          h={20}
          bg="whiteAlpha.100"
          rounded="full"
          animation={`${float} 6s ease-in-out infinite`}
        />
        <Box
          position="absolute"
          bottom="15%"
          left="8%"
          w={16}
          h={16}
          bg="whiteAlpha.150"
          transform="rotate(45deg)"
          rounded="lg"
          animation={`${float} 8s ease-in-out infinite reverse`}
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          w={32}
          h={32}
          bg="whiteAlpha.50"
          rounded="full"
          transform="translate(-50%, -50%)"
          animation={`${pulse} 4s ease-in-out infinite`}
        />

        {/* Main Content */}
        <Container maxW="6xl" position="relative" zIndex={2}>
          <VStack spacing={8} align="center" textAlign="center">
            {/* Welcome Message */}
            <VStack spacing={4} animation={`${fadeInUp} 1s ease-out`}>
              <HStack spacing={3}>
                <Icon as={getGreetingIcon()} boxSize={8} />
                <Heading size="2xl" fontWeight="800">
                  {getGreeting()}, {DataAuth?.nama || "Welcome"}!
                </Heading>
              </HStack>

              <Text fontSize="xl" opacity={0.9} maxW="2xl">
                Welcome to your comprehensive Project Management Dashboard.
                We're building something amazing for you!
              </Text>

              <HStack spacing={2} fontSize="lg" opacity={0.8}>
                <Icon as={FiClock} />
                <Text>
                  {currentTime.toLocaleDateString()} •{" "}
                  {currentTime.toLocaleTimeString()}
                </Text>
              </HStack>
            </VStack>

            {/* Coming Soon Badge */}
            <Badge
              colorScheme="yellow"
              variant="solid"
              px={6}
              py={2}
              rounded="full"
              fontSize="lg"
              fontWeight="bold"
              animation={`${pulse} 2s ease-in-out infinite`}
            >
              🚀 Coming Soon
            </Badge>

            {/* Feature Preview Cards */}
            <SimpleGrid
              columns={{ base: 1, md: 3 }}
              spacing={6}
              w="full"
              maxW="4xl"
            >
              <FeatureCard
                icon={MdOutlineRocket}
                title="Advanced Analytics"
                description="Real-time project insights and performance metrics"
                delay="0.2s"
              />
              <FeatureCard
                icon={MdOutlineAutoAwesome}
                title="Smart Automation"
                description="AI-powered task management and workflow optimization"
                delay="0.4s"
              />
              <FeatureCard
                icon={MdOutlineWorkspacePremium}
                title="Team Collaboration"
                description="Enhanced communication and project coordination tools"
                delay="0.6s"
              />
            </SimpleGrid>

            {/* CTA Button */}
            <Button
              size="lg"
              bg="whiteAlpha.200"
              color="white"
              _hover={{
                bg: "whiteAlpha.300",
                transform: "translateY(-2px)",
                shadow: "xl",
              }}
              rightIcon={<FiArrowRight />}
              rounded="full"
              px={8}
              py={6}
              fontSize="lg"
              fontWeight="bold"
              transition="all 0.3s ease"
              animation={`${fadeInUp} 1s ease-out 0.8s both`}
            >
              Explore Features
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Stats Preview Section */}
      <Container maxW="6xl" py={12}>
        <VStack spacing={8}>
          <VStack spacing={2} textAlign="center">
            <Heading
              size="lg"
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              What's Coming Next
            </Heading>
            <Text color="gray.500" fontSize="lg">
              Get ready for these powerful features
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} w="full">
            <StatsCard
              icon={FiFolder}
              label="Projects"
              value="25+"
              color="blue"
              description="Active projects to manage"
            />
            <StatsCard
              icon={FiUsers}
              label="Team Members"
              value="50+"
              color="green"
              description="Collaborative team size"
            />
            <StatsCard
              icon={FiCheckCircle}
              label="Tasks Completed"
              value="500+"
              color="purple"
              description="Successful deliveries"
            />
            <StatsCard
              icon={FiTrendingUp}
              label="Success Rate"
              value="98%"
              color="orange"
              description="Project completion rate"
            />
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Timeline Section */}
      <Box
        bg={colorMode === "light" ? "gray.50" : "gray.900"}
        py={12}
        mx={4}
        rounded="2xl"
      >
        <Container maxW="4xl">
          <VStack spacing={8}>
            <VStack spacing={2} textAlign="center">
              <Heading
                size="lg"
                color={colorMode === "light" ? "gray.800" : "white"}
              >
                Development Roadmap
              </Heading>
              <Text color="gray.500">
                Track our progress as we build your perfect dashboard
              </Text>
            </VStack>

            <VStack spacing={6} align="stretch">
              <TimelineItem
                icon={FiCheckCircle}
                title="Project Setup & Authentication"
                description="User authentication and basic project structure"
                status="completed"
                date="Phase 1"
              />
              <TimelineItem
                icon={FiActivity}
                title="Dashboard Foundation"
                description="Core dashboard layout and navigation system"
                status="in-progress"
                date="Phase 2"
              />
              <TimelineItem
                icon={FiBarChart}
                title="Analytics & Reporting"
                description="Advanced charts, metrics, and performance insights"
                status="upcoming"
                date="Phase 3"
              />
              <TimelineItem
                icon={FiTarget}
                title="Advanced Features"
                description="AI automation, integrations, and premium tools"
                status="upcoming"
                date="Phase 4"
              />
            </VStack>
          </VStack>
        </Container>
      </Box>

      {/* Footer Message */}
      <Container maxW="4xl" py={8}>
        <Card
          bg={colorMode === "light" ? "white" : "gray.800"}
          shadow="lg"
          rounded="xl"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <CardBody p={8} textAlign="center">
            <VStack spacing={4}>
              <Icon
                as={FiHeart}
                boxSize={12}
                color="red.400"
                animation={`${pulse} 2s ease-in-out infinite`}
              />
              <Heading
                size="md"
                color={colorMode === "light" ? "gray.800" : "white"}
              >
                Built with Love for Project Management
              </Heading>
              <Text color="gray.500" maxW="2xl">
                We're crafting every detail to ensure you have the best project
                management experience. Stay tuned for updates and new features!
              </Text>
              <HStack spacing={4} pt={4}>
                <Badge
                  colorScheme="blue"
                  variant="subtle"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  🎯 User-Focused
                </Badge>
                <Badge
                  colorScheme="green"
                  variant="subtle"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  ⚡ High Performance
                </Badge>
                <Badge
                  colorScheme="purple"
                  variant="subtle"
                  px={3}
                  py={1}
                  rounded="full"
                >
                  🎨 Beautiful Design
                </Badge>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </LayoutAdmin>
  );
}

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: any;
  title: string;
  description: string;
  delay: string;
}) => {
  const { colorMode } = useColorMode();

  return (
    <Card
      bg="whiteAlpha.100"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor="whiteAlpha.200"
      rounded="xl"
      _hover={{
        bg: "whiteAlpha.200",
        transform: "translateY(-4px)",
        shadow: "xl",
      }}
      transition="all 0.3s ease"
      animation={`${fadeInUp} 1s ease-out ${delay} both`}
    >
      <CardBody p={6} textAlign="center">
        <VStack spacing={4}>
          <Box
            p={3}
            bg="whiteAlpha.200"
            rounded="lg"
            animation={`${pulse} 3s ease-in-out infinite`}
          >
            <Icon as={icon} boxSize={8} color="white" />
          </Box>
          <VStack spacing={2}>
            <Heading size="sm" color="white">
              {title}
            </Heading>
            <Text fontSize="sm" opacity={0.9} lineHeight="tall">
              {description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Stats Card Component
const StatsCard = ({
  icon,
  label,
  value,
  color,
  description,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
  description: string;
}) => {
  const { colorMode } = useColorMode();

  return (
    <Card
      bg={colorMode === "light" ? "white" : "gray.800"}
      shadow="lg"
      rounded="xl"
      border="1px"
      borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      _hover={{
        transform: "translateY(-4px)",
        shadow: "xl",
      }}
      transition="all 0.3s ease"
    >
      <CardBody p={6} textAlign="center">
        <VStack spacing={4}>
          <Box p={3} bg={`${color}.100`} rounded="lg">
            <Icon as={icon} boxSize={8} color={`${color}.500`} />
          </Box>
          <VStack spacing={1}>
            <Text fontSize="2xl" fontWeight="bold" color={`${color}.500`}>
              {value}
            </Text>
            <Text
              fontWeight="medium"
              color={colorMode === "light" ? "gray.800" : "white"}
            >
              {label}
            </Text>
            <Text fontSize="sm" color="gray.500" textAlign="center">
              {description}
            </Text>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

// Timeline Item Component
const TimelineItem = ({
  icon,
  title,
  description,
  status,
  date,
}: {
  icon: any;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "upcoming";
  date: string;
}) => {
  const { colorMode } = useColorMode();

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "green";
      case "in-progress":
        return "blue";
      case "upcoming":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <HStack spacing={4} align="start">
      <Box
        p={3}
        bg={`${getStatusColor()}.100`}
        rounded="lg"
        border="2px solid"
        borderColor={`${getStatusColor()}.200`}
      >
        <Icon as={icon} boxSize={6} color={`${getStatusColor()}.500`} />
      </Box>
      <VStack align="start" spacing={1} flex={1}>
        <HStack justify="space-between" w="full">
          <Heading
            size="sm"
            color={colorMode === "light" ? "gray.800" : "white"}
          >
            {title}
          </Heading>
          <Badge colorScheme={getStatusColor()} variant="subtle" rounded="full">
            {date}
          </Badge>
        </HStack>
        <Text color="gray.500" fontSize="sm">
          {description}
        </Text>
        <Progress
          value={
            status === "completed" ? 100 : status === "in-progress" ? 60 : 0
          }
          colorScheme={getStatusColor()}
          size="sm"
          w="full"
          rounded="full"
          mt={2}
        />
      </VStack>
    </HStack>
  );
};

export default HomePageView;
