"use client";

import React, { Suspense } from "react";
import AssessmentWizardView from "./AssessmentWizardView";
import { Flex, Spinner, Text, VStack } from "@chakra-ui/react";

export default function AssessmentWizardPage() {
  return (
    <Suspense
      fallback={
        <Flex justify="center" align="center" minH="500px">
          <VStack spacing={4}>
            <Spinner size="xl" color="secondary.500" thickness="3px" />
            <Text fontSize="sm" color="gray.500">
              Loading Assessment Wizard...
            </Text>
          </VStack>
        </Flex>
      }
    >
      <AssessmentWizardView />
    </Suspense>
  );
}
