"use client";

import React from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  Badge,
  List,
  ListItem,
  ListIcon,
  useColorMode,
} from "@chakra-ui/react";
import { FiCheck, FiStar, FiZap, FiAward } from "react-icons/fi";
import LayoutAdmin from "../../components/layoutAdmin";

const PricingPage = () => {
  const { colorMode } = useColorMode();

  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "Perfect for small teams getting started",
      features: [
        "Up to 5 projects",
        "Basic kanban boards",
        "Team collaboration",
        "Email support",
        "5GB storage",
      ],
      color: "blue",
      icon: FiStar,
      popular: false,
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "Best for growing teams and businesses",
      features: [
        "Unlimited projects",
        "Advanced kanban & calendar",
        "Team management",
        "Priority support",
        "50GB storage",
        "Advanced analytics",
        "Custom workflows",
      ],
      color: "purple",
      icon: FiZap,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For large organizations with advanced needs",
      features: [
        "Everything in Professional",
        "Unlimited storage",
        "Advanced security",
        "SSO integration",
        "24/7 phone support",
        "Custom integrations",
        "Dedicated account manager",
      ],
      color: "orange",
      icon: FiAward,
      popular: false,
    },
  ];

  return (
    <LayoutAdmin>
      <Container maxW="7xl" py={10}>
        <VStack spacing={12} align="stretch">
          {/* Header */}
          <VStack spacing={6} textAlign="center">
            <Badge
              colorScheme="purple"
              fontSize="sm"
              px={4}
              py={2}
              rounded="full"
            >
              Pricing Plans
            </Badge>
            <Heading
              size="2xl"
              bgGradient="linear(to-r, purple.600, blue.600)"
              bgClip="text"
            >
              Choose Your Perfect Plan
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl" mx="auto">
              Scale your project management with our flexible pricing options.
              Start free and upgrade as you grow.
            </Text>
          </VStack>

          {/* Pricing Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {plans.map((plan, index) => (
              <Box
                key={index}
                bg={colorMode === "light" ? "white" : "gray.800"}
                rounded="3xl"
                shadow={plan.popular ? "2xl" : "xl"}
                p={8}
                position="relative"
                border="2px"
                borderColor={
                  plan.popular
                    ? `${plan.color}.500`
                    : colorMode === "light"
                    ? "gray.100"
                    : "gray.700"
                }
                transform={plan.popular ? "scale(1.05)" : "scale(1)"}
                transition="all 0.3s"
                _hover={{ transform: "scale(1.02)" }}
              >
                {plan.popular && (
                  <Badge
                    position="absolute"
                    top="-12px"
                    left="50%"
                    transform="translateX(-50%)"
                    colorScheme={plan.color}
                    fontSize="sm"
                    px={6}
                    py={2}
                    rounded="full"
                  >
                    Most Popular
                  </Badge>
                )}

                <VStack spacing={6} align="stretch">
                  {/* Plan Header */}
                  <VStack spacing={4}>
                    <Box
                      w={16}
                      h={16}
                      bg={`${plan.color}.500`}
                      rounded="2xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <plan.icon size={32} color="white" />
                    </Box>
                    <VStack spacing={2}>
                      <Heading size="lg" color={`${plan.color}.600`}>
                        {plan.name}
                      </Heading>
                      <Text color="gray.600" textAlign="center">
                        {plan.description}
                      </Text>
                    </VStack>
                  </VStack>

                  {/* Price */}
                  <VStack spacing={1}>
                    <HStack align="baseline">
                      <Text
                        fontSize="4xl"
                        fontWeight="bold"
                        color={colorMode === "light" ? "gray.800" : "white"}
                      >
                        {plan.price}
                      </Text>
                      <Text color="gray.500">{plan.period}</Text>
                    </HStack>
                  </VStack>

                  {/* Features */}
                  <List spacing={3}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex}>
                        <ListIcon as={FiCheck} color={`${plan.color}.500`} />
                        <Text as="span" color="gray.700">
                          {feature}
                        </Text>
                      </ListItem>
                    ))}
                  </List>

                  {/* CTA Button */}
                  <Button
                    colorScheme={plan.color}
                    size="lg"
                    rounded="xl"
                    variant={plan.popular ? "solid" : "outline"}
                    _hover={{
                      transform: "translateY(-2px)",
                      shadow: "lg",
                    }}
                    transition="all 0.2s"
                  >
                    {plan.popular ? "Get Started" : "Choose Plan"}
                  </Button>
                </VStack>
              </Box>
            ))}
          </SimpleGrid>

          {/* FAQ Section */}
          <VStack spacing={8} pt={12}>
            <Heading size="lg" textAlign="center">
              Frequently Asked Questions
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} w="full">
              <Box
                p={6}
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                rounded="xl"
              >
                <Heading size="md" mb={3}>
                  Can I change plans anytime?
                </Heading>
                <Text color="gray.600">
                  Yes, you can upgrade or downgrade your plan at any time.
                  Changes take effect immediately.
                </Text>
              </Box>
              <Box
                p={6}
                bg={colorMode === "light" ? "gray.50" : "gray.700"}
                rounded="xl"
              >
                <Heading size="md" mb={3}>
                  Is there a free trial?
                </Heading>
                <Text color="gray.600">
                  All plans come with a 14-day free trial. No credit card
                  required to get started.
                </Text>
              </Box>
            </SimpleGrid>
          </VStack>
        </VStack>
      </Container>
    </LayoutAdmin>
  );
};

export default PricingPage;
