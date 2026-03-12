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

export default function MasterCertificationPage() {
  return (
    <LayoutAdmin>
      <HeaderContent
        titleName="Master Certification"
        breadCrumb={["Home", "Master Data", "Certification"]}
      />
      
      <Box p={6}>
        <Card shadow="lg" borderRadius={radiusStyle}>
          <CardHeader>
            <Heading size="md">Master Certification</Heading>
            <Text fontSize="sm" color="gray.600" mt={2}>
              Manage certifications and professional credentials
            </Text>
          </CardHeader>
          
          <CardBody>
            <VStack spacing={4} align="center" py={8}>
              <Text fontSize="lg" color="gray.500">
                Master Certification page is under development
              </Text>
              <Text fontSize="sm" color="gray.400">
                This page will contain certification management functionality
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </Box>
    </LayoutAdmin>
  );
}
