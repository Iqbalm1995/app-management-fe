"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { Box, Heading } from "@chakra-ui/react";

export default function DashboardPortfolioPage() {
  const headerProps: HeaderContentProps = {
    titleName: "Dashboard Portfolio",
    breadCrumb: ["Home", "Reports", "Dashboard Portfolio"],
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...headerProps} />
      <Box p={6}>
        <Heading size="lg" mb={4}>
          Dashboard Portfolio
        </Heading>
      </Box>
    </LayoutAdmin>
  );
}
