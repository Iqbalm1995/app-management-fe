"use client";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";

export default function MasterLanguagePage() {
  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Master Programming Language"
        breadCrumb={["Home", "Master Data", "Programming Language"]}
      />
      
      <Box p={6}>
        <Card shadow="lg" borderRadius={radiusStyle}>
          <CardHeader>
            <Heading size="md">Master Programming Language</Heading>
            <Text fontSize="sm" color="gray.600" mt={2}>
              Manage programming languages and technologies
            </Text>
          </CardHeader>
          
          <CardBody>
            <VStack spacing={4} align="center" py={8}>
              <Text fontSize="lg" color="gray.500">
                Master Programming Language page is under development
              </Text>
              <Text fontSize="sm" color="gray.400">
                This page will contain programming language management functionality
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}
