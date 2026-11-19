"use client";

import React, { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
  useColorModeValue,
  useToast,
  VStack,
} from "@chakra-ui/react";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiKey,
  FiLock,
  FiShield,
  FiUnlock,
} from "react-icons/fi";
import Link from "next/link";
import {
  AdminConsoleAuthProvider,
  useAdminConsoleAuth,
} from "@/app/context/AdminConsoleAuthContext";

function ConfGatekeeper({ children }: { children: React.ReactNode }) {
  const toast = useToast();
  const { isUnlocked, isVerifyingKey, passkeyError, unlockConsole, clearPasskeyError } =
    useAdminConsoleAuth();

  const [passkeyInput, setPasskeyInput] = useState<string>("");
  const [showPasskey, setShowPasskey] = useState<boolean>(false);

  // Dynamic theme colors for lock screen
  const pageBg = useColorModeValue("gray.50", "gray.950");
  const cardBg = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("blue.200", "blue.800");

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passkeyInput.trim()) {
      toast({
        title: "Perhatian",
        description: "Masukkan security passkey terlebih dahulu.",
        status: "warning",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const success = unlockConsole(passkeyInput);
    if (success) {
      toast({
        title: "Akses Diberikan",
        description: "Konsol konfigurasi sistem terbuka.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setPasskeyInput("");
    } else {
      toast({
        title: "Akses Ditolak",
        description: "Security passkey tidak valid. Silakan periksa kembali.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // If locked: STRICT ZERO BACKGROUND EXECUTION
  // Child pages do NOT mount or run network queries while locked
  if (!isUnlocked) {
    return (
      <Flex
        minH="100vh"
        bg={pageBg}
        align="center"
        justify="center"
        p={4}
        position="relative"
      >
        <Card
          maxW="450px"
          w="full"
          bg={cardBg}
          border="1px"
          borderColor={borderColor}
          shadow="2xl"
          rounded="3xl"
          p={7}
          position="relative"
          overflow="hidden"
        >
          {/* Top Gradient Accent Bar */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            h="4px"
            bgGradient="linear(to-r, blue.500, purple.500, cyan.400)"
          />

          <VStack spacing={5} align="stretch">
            <VStack spacing={2} textAlign="center">
              <Flex
                w={14}
                h={14}
                rounded="2xl"
                bgGradient="linear(to-tr, blue.500, purple.600)"
                color="white"
                align="center"
                justify="center"
                shadow="lg"
              >
                <Icon as={FiShield} boxSize={7} />
              </Flex>
              <Heading as="h4" size="md" letterSpacing="tight">
                Admin Console Gatekeeper
              </Heading>
              <Badge
                colorScheme="purple"
                variant="subtle"
                fontSize="2xs"
                px={2.5}
                py={0.5}
                rounded="full"
              >
                RESTRICTED AREA • PASSKEY REQUIRED
              </Badge>
              <Text fontSize="xs" color="gray.500">
                Area konfigurasi dan administrasi data sistem ini diproteksi khusus supervisor.
                Masukkan passkey resmi untuk mengakses seluruh suite konsol.
              </Text>
            </VStack>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <Box>
                  <Text fontSize="2xs" fontWeight="bold" color="gray.500" mb={1.5} textTransform="uppercase">
                    Security Passkey
                  </Text>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={FiKey} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showPasskey ? "text" : "password"}
                      placeholder="Masukkan Passkey..."
                      value={passkeyInput}
                      onChange={(e) => {
                        setPasskeyInput(e.target.value);
                        if (passkeyError) clearPasskeyError();
                      }}
                      autoFocus
                      rounded="xl"
                      borderColor={passkeyError ? "red.400" : undefined}
                    />
                    <InputRightElement>
                      <IconButton
                        aria-label="Toggle Passkey"
                        icon={showPasskey ? <FiEyeOff /> : <FiEye />}
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPasskey(!showPasskey)}
                      />
                    </InputRightElement>
                  </InputGroup>
                  {passkeyError && (
                    <Text fontSize="2xs" color="red.500" mt={1}>
                      {passkeyError}
                    </Text>
                  )}
                </Box>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="md"
                  rounded="xl"
                  leftIcon={<FiUnlock />}
                  isLoading={isVerifyingKey}
                  loadingText="Memverifikasi..."
                  w="full"
                  shadow="md"
                >
                  Buka Kunci Akses Console
                </Button>
              </VStack>
            </form>

            <Divider borderColor={useColorModeValue("gray.200", "gray.800")} />

            <Flex justify="center">
              <Link href="/">
                <Button size="xs" variant="ghost" leftIcon={<FiArrowLeft />}>
                  Kembali ke Beranda
                </Button>
              </Link>
            </Flex>
          </VStack>
        </Card>
      </Flex>
    );
  }

  // Once unlocked, render children seamlessly
  return <>{children}</>;
}

export default function ConfLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminConsoleAuthProvider>
      <ConfGatekeeper>{children}</ConfGatekeeper>
    </AdminConsoleAuthProvider>
  );
}
