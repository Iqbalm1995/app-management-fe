"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Icon,
  useColorMode,
  Link,
  HStack,
} from "@chakra-ui/react";
import { FiGlobe, FiPhone, FiMail, FiMessageCircle } from "react-icons/fi";
import LayoutLanding from "@/app/components/layoutLanding";

export default function HubungiKami() {
  const { colorMode } = useColorMode();

  return (
    <LayoutLanding>
      {/* White background for navbar */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="80px"
        bg={colorMode === "light" ? "white" : "gray.800"}
        zIndex={9}
        shadow="sm"
      />

      <Box
        minH="100vh"
        bgGradient={
          colorMode === "light"
            ? "linear(to-br, secondary.500, secondary.900)"
            : "linear(to-br, secondary.800, secondary.500)"
        }
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative circles */}
        <Box
          position="absolute"
          top="-10%"
          right="-5%"
          w="400px"
          h="400px"
          bg="whiteAlpha.100"
          transform="rotate(45deg)"
          rounded="3xl"
        />
        <Box
          position="absolute"
          bottom="-10%"
          left="-5%"
          w="300px"
          h="300px"
          bg="whiteAlpha.100"
          transform="rotate(-30deg)"
          rounded="3xl"
        />

        <Container maxW="container.md" position="relative" zIndex={1}>
          <VStack spacing={12} textAlign="center" color="white" py={20}>
            {/* Header */}
            <VStack spacing={4}>
              <Heading size="2xl" fontWeight="bold">
                Hubungi Kami
              </Heading>
              <Text fontSize="xl" opacity={0.9}>
                Layanan pelaporan insiden dapat dilakukan melalui :
              </Text>
            </VStack>

            {/* Contact Information */}
            <VStack spacing={6} w="full" maxW="xl">
              {/* bjb Hits */}
              <Box
                w="full"
                p={6}
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                rounded="2xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
              >
                <VStack spacing={3}>
                  <HStack spacing={3}>
                    <Icon as={FiGlobe} boxSize={6} />
                    <Text fontWeight="700" fontSize="lg">
                      bjb Hits
                    </Text>
                  </HStack>
                  <VStack spacing={2}>
                    <Link
                      href="https://bjbhits.bankbjb.co.id/login"
                      isExternal
                      fontSize="md"
                      _hover={{ textDecoration: "underline" }}
                    >
                      https://bjbhits.bankbjb.co.id/login
                    </Link>
                    <Text fontSize="sm" opacity={0.8}>
                      atau
                    </Text>
                    <Link
                      href="http://192.168.231.34/login"
                      isExternal
                      fontSize="md"
                      _hover={{ textDecoration: "underline" }}
                    >
                      http://192.168.231.34/login
                    </Link>
                  </VStack>
                </VStack>
              </Box>

              {/* Contact Center */}
              <Box
                w="full"
                p={6}
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                rounded="2xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
              >
                <HStack spacing={3} justify="center">
                  <Icon as={FiPhone} boxSize={6} />
                  <Text fontWeight="700" fontSize="lg">
                    Contact Center :
                  </Text>
                  <Link
                    href="tel:02286032222"
                    fontSize="lg"
                    _hover={{ textDecoration: "underline" }}
                  >
                    022 - 86032222
                  </Link>
                </HStack>
              </Box>

              {/* Email */}
              <Box
                w="full"
                p={6}
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                rounded="2xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
              >
                <HStack spacing={3} justify="center">
                  <Icon as={FiMail} boxSize={6} />
                  <Text fontWeight="700" fontSize="lg">
                    Email :
                  </Text>
                  <Link
                    href="mailto:ithelpdesk@bankbjb.co.id"
                    fontSize="lg"
                    _hover={{ textDecoration: "underline" }}
                  >
                    ithelpdesk@bankbjb.co.id
                  </Link>
                </HStack>
              </Box>

              {/* WhatsApp */}
              <Box
                w="full"
                p={6}
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                rounded="2xl"
                border="2px solid"
                borderColor="whiteAlpha.300"
              >
                <HStack spacing={3} justify="center">
                  <Icon as={FiMessageCircle} boxSize={6} />
                  <Text fontWeight="700" fontSize="lg">
                    Whatsapp :
                  </Text>
                  <Link
                    href="https://wa.me/6281110187878"
                    isExternal
                    fontSize="lg"
                    _hover={{ textDecoration: "underline" }}
                  >
                    0811-1018-7878
                  </Link>
                </HStack>
              </Box>
            </VStack>
          </VStack>
        </Container>
      </Box>
    </LayoutLanding>
  );
}
