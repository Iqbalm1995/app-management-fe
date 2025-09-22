"use client";

import { ReactNode, useEffect, useState } from "react";
import { DELAY_MEDIUM } from "../constants/applicationConstants";
import {
  Box,
  Container,
  Flex,
  HStack,
  Image,
  Spacer,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { LoadingOverlay } from "./loadingOverlay";
import TopNavigationLanding from "./landingTopNavigation";
import SignatureLineColor from "./signatureStyle";
import Head from "next/head";
import { usePathname } from "next/navigation";

const LayoutLanding = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { colorMode } = useColorMode();

  useEffect(() => {
    // Show loading on route change
    setLoading(true);

    // Simulate loading time for landing pages
    const timer = setTimeout(() => setLoading(false), DELAY_MEDIUM);
    return () => clearTimeout(timer);
  }, [pathname]); // Re-run when pathname changes

  return (
    <>
      <Box position="relative" minHeight="100vh">
        <Head>
          <title>KOBRA - Applications Management</title>
        </Head>

        <LoadingOverlay isLoading={loading} />

        <Box
          opacity={loading ? 0.5 : 1}
          pointerEvents={loading ? "none" : "auto"}
          transition="opacity 0.3s ease"
        >
          <TopNavigationLanding />
          {children}
          <FooterAdminPanel />
          <SignatureLineColor />
        </Box>
      </Box>
    </>
  );
};

export const FooterAdminPanel = () => {
  const { colorMode } = useColorMode();
  return (
    <Box
      bg={colorMode == "light" ? "primary.800" : "gray.900"}
      color={"white"}
      px={3}
      py={3}
    >
      <Container as={Stack} maxW={"container.xl"} py={2}>
        <Box>
          <HStack spacing={6}>
            <Box>
              <Flex width={"60px"}>
                <Image src={"/img/ojk.png"} alt={"Bank bjb"} />
              </Flex>
            </Box>
            <Box>
              <Flex width={"60px"}>
                <Image src={"/img/lps.png"} alt={"Bank bjb"} />
              </Flex>
            </Box>
            <Box>
              <Text fontSize={"small"}>
                bank bjb Berizin dan Diawasi oleh OJK | bank bjb merupakan
                peserta penjamin LPS
              </Text>
            </Box>
            <Spacer />
            <Box>
              <Text fontSize={"small"}>Copyright © 2025 bank bjb</Text>
            </Box>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
};

export default LayoutLanding;
