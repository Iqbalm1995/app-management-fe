"use client";

import { Suspense } from "react";
import VendorContractDetailView from "./VendorContractDetailView";
import { Flex, Spinner } from "@chakra-ui/react";

export default function VendorContractDetailPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" align="center" minH="500px">
          <Spinner size="xl" color="secondary.500" thickness="4px" />
        </Flex>
      }
    >
      <VendorContractDetailView />
    </Suspense>
  );
}
