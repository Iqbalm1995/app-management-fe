"use client";

import { ReactNode, useEffect, useState } from "react";
import { DELAY_MEDIUM } from "../constants/applicationConstants";
import {
  Box,
  Container,
  Flex,
  HStack,
  Image,
  Link,
  Spacer,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { LoadingOverlayEnhanced } from "./loadingOverlayEnhanced";
import TopNavigationLanding from "./landingTopNavigation";
import SignatureLineColor from "./signatureStyle";
import Head from "next/head";
import { usePathname } from "next/navigation";

const LayoutLandingEnhanced = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { colorMode } = useColorMode();

  useEffect(() => {
    // Show loading on route change
    setLoading(true);

    // Landing pages typically load faster
    const timer = setTimeout(() => setLoading(false), DELAY_MEDIUM - 200);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Get loading text based on landing page route
  const getLoadingText = (path: string) => {
    if (path === "/" || path === "/landing") return "Loading bjb aPPs...";
    if (path.includes("login")) return "Loading Login...";
    if (path.includes("register")) return "Loading Registration...";
    if (path.includes("about")) return "Loading About...";
    return "Loading Page...";
  };

  return (
    <>
      <Box position="relative" minHeight="90vh">
        <Head>
          <title>bjb aPPs - Applications Management</title>
        </Head>

        <LoadingOverlayEnhanced
          isLoading={loading}
          loadingText={getLoadingText(pathname)}
          showProgress={true}
        />

        <Box
          opacity={loading ? 0.3 : 1}
          pointerEvents={loading ? "none" : "auto"}
          transition="opacity 0.5s ease"
          transform={loading ? "scale(0.98)" : "scale(1)"}
          style={{ transition: "all 0.5s ease" }}
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
                bank bjb Berizin dan Diawasi oleh Otoritas Jasa Keuangan dan
                Bank Indonesia. bank bjb merupakan peserta penjamin LPS.
                Maksimal nilai simpanan dijamin LPS per Nasabah bank adalah
                Rp.2 miliar. Untuk mengetahui Tingkat Bunga Penjamin LPS
                silahkan akses{" "}
                <Link
                  href="https://apps.lps.go.id/BankPesertaLPSRate"
                  isExternal
                  color="cyan.400"
                  textDecoration="underline"
                >
                  disini
                </Link>
                .
              </Text>
            </Box>
            <Spacer />
            <Box><Text fontSize={"small"}>Copyright © 2025 bank bjb</Text></Box>
          </HStack>
        </Box>
      </Container>
    </Box>
  );
};

export default LayoutLandingEnhanced;
