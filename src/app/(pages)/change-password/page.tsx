"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Center, Spinner, Text, VStack } from "@chakra-ui/react";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function ChangePasswordPage() {
  useDocumentTitle("Change Password");
  const router = useRouter();

  useEffect(() => {
    // Password changes are handled centrally via Bank bjb UIM
    router.replace("/");
  }, [router]);

  return (
    <Center h="100vh" bg="gray.50" _dark={{ bg: "gray.900" }}>
      <VStack spacing={3}>
        <Spinner size="xl" color="blue.500" thickness="3px" />
        <Text fontSize="sm" color="gray.500">
          Redirecting to home...
        </Text>
      </VStack>
    </Center>
  );
}
