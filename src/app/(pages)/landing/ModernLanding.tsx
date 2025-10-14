"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Card,
  CardBody,
  Grid,
  GridItem,
  Icon,
} from "@chakra-ui/react";
import { FaPlay, FaShieldAlt, FaUsers, FaChartLine } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

const MotionBox = motion(Box);
const MotionText = motion(Text);

function ModernLanding() {
  const bgGradient = useColorModeValue(
    "linear(to-br, blue.50, white, gray.50)",
    "linear(to-br, gray.900, gray.800, gray.700)"
  );
  
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Box minH="100vh" bg={bgGradient}>
      {/* Hero Section */}
      <Container maxW="7xl" pt={20} pb={16}>
        <VStack spacing={8} textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Heading
              size="2xl"
              fontWeight="bold"
              bgGradient="linear(to-r, blue.600, purple.600)"
              bgClip="text"
              mb={4}
            >
              Enterprise Project Management
            </Heading>
            <Text fontSize="xl" color={textColor} maxW="2xl" mx="auto">
              Streamline your workflow with our comprehensive project management solution
              designed for modern enterprises.
            </Text>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <HStack spacing={4}>
              <Button
                as={Link}
                href="/home"
                size="lg"
                colorScheme="blue"
                leftIcon={<FaPlay />}
                px={8}
                py={6}
                fontSize="lg"
                _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                transition="all 0.2s"
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                colorScheme="blue"
                px={8}
                py={6}
                fontSize="lg"
                _hover={{ transform: "translateY(-2px)", shadow: "md" }}
                transition="all 0.2s"
              >
                Learn More
              </Button>
            </HStack>
          </MotionBox>
        </VStack>
      </Container>

      {/* Features Section */}
      <Container maxW="7xl" py={16}>
        <VStack spacing={12}>
          <Heading size="xl" textAlign="center" color={useColorModeValue("gray.700", "white")}>
            Why Choose Our Platform
          </Heading>
          
          <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={8} w="full">
            <FeatureCard
              icon={FaUsers}
              title="Team Collaboration"
              description="Seamless collaboration tools for distributed teams"
              color="blue"
            />
            <FeatureCard
              icon={FaChartLine}
              title="Analytics & Insights"
              description="Real-time analytics and performance insights"
              color="green"
            />
            <FeatureCard
              icon={FaShieldAlt}
              title="Enterprise Security"
              description="Bank-grade security for your sensitive data"
              color="purple"
            />
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
}

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color 
}: {
  icon: any;
  title: string;
  description: string;
  color: string;
}) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.100", "gray.700");

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
    >
      <Card
        bg={cardBg}
        border="1px solid"
        borderColor={borderColor}
        shadow="md"
        _hover={{ shadow: "lg" }}
        transition="all 0.3s"
        h="full"
      >
        <CardBody p={8}>
          <VStack spacing={4} align="start">
            <Box
              p={3}
              bg={`${color}.50`}
              borderRadius="lg"
              display="inline-block"
            >
              <Icon as={icon} w={6} h={6} color={`${color}.500`} />
            </Box>
            <Heading size="md" color={useColorModeValue("gray.700", "white")}>
              {title}
            </Heading>
            <Text color={useColorModeValue("gray.600", "gray.300")}>
              {description}
            </Text>
          </VStack>
        </CardBody>
      </Card>
    </MotionBox>
  );
};

export default ModernLanding;
