"use client";

import { Suspense } from "react";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import AdminRequirementEditView from "./AdminRequirementEditView";

export default function AdminRequirementEditPage() {
  return (
    <Suspense
      fallback={
        <Center minH="70vh">
          <VStack spacing={3}>
            <Spinner size="xl" color="blue.500" thickness="3px" />
            <Text fontSize="sm" color="gray.500">
              Memuat Admin Requirement Editor...
            </Text>
          </VStack>
        </Center>
      }
    >
      <AdminRequirementEditView />
    </Suspense>
  );
}
