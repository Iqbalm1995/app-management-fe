"use client";

import React from "react";
import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
  ENABLE_UIM_SSO_BRANDING,
} from "@/app/constants/applicationConstants";
import { loginReturn, useAuth } from "@/app/context/AuthContext";
import { encryptAES } from "@/app/helper/HashHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useAuthentications, {
  AuthDataResponse,
} from "@/app/services/useAuthentications";
import useSysModuleGroup from "@/app/services/useSysModuleGroup";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useBreakpointValue,
  useDisclosure,
  Switch,
  HStack,
  StackDivider,
  Container,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Grid,
  GridItem,
  VStack,
  Center,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Spacer,
  Image,
  ButtonGroup,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorMode,
  Badge,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLogIn, FiLayers, FiCheckSquare, FiShield, FiLock, FiCheck } from "react-icons/fi";
import * as Yup from "yup";
import { DEV_THEME } from "@/app/(pages)/dev/constants/devThemeConstants";

interface AuthCorporateUserModel {
  username: string;
  password: string;
}

const initialValueAuthEx: AuthCorporateUserModel = {
  username: "",
  password: "",
};

const FormSchema = Yup.object().shape({
  username: Yup.string().required("Required"),
  password: Yup.string().required("Required"),
});

const AuthPanelModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const [isDevMode, setIsDevMode] = useState(false);
  const isCentered = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    lg: true,
  });

  return (
    <>
      <Button
        colorScheme={"secondary"}
        px={8}
        bgGradient={
          colorMode === "light"
            ? "linear(to-r, secondary.500, secondary.900)"
            : "linear(to-r, secondary.800, secondary.500)"
        }
        color="white"
        _hover={{
          // bg: colorMode === "light" ? "blue.700" : "blue.600",
          transform: "translateY(-3px)",
          shadow: "xl",
        }}
        onClick={onOpen}
        boxShadow={"md"}
        rounded={radiusStyle}
      >
        Login
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={"4xl"}
        isCentered={isCentered}
      >
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent
          rounded={radiusStyle}
          m={{ base: 3, sm: 3, md: 0, lg: 0 }}
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          {/* <ModalHeader>Login Otentikasi</ModalHeader> */}
          <ModalCloseButton />
          <ModalBody p={0}>
            <Grid
              templateColumns="repeat(2, 1fr)"
              gap={0}
              p={0}
              h={{ base: "65vh", sm: "65vh", md: "620px", lg: "620px" }}
            >
              <GridItem
                colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                w={"full"}
                h={"full"}
                roundedLeft={radiusStyle}
                display={{ base: "none", sm: "none", md: "flex", lg: "flex" }}
                overflow="hidden"
              >
                <Flex
                  roundedLeft={radiusStyle}
                  w={"full"}
                  h={"full"}
                  bgGradient={
                    isDevMode
                      ? DEV_THEME.gradients.panel
                      : "linear(to-br, #1e3a8a, #3b82f6, #06b6d4)"
                  }
                  transition="all 0.4s ease-in-out"
                  pos={"relative"}
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* Left Side Content & Visuals */}
                  {isDevMode ? (
                    <>
                      {/* Subtle Static Developer Blueprint Dot Grid */}
                      <Box
                        pos="absolute"
                        top="0"
                        left="0"
                        w="full"
                        h="full"
                        opacity={0.18}
                        pointerEvents="none"
                        backgroundImage="radial-gradient(rgba(255, 255, 255, 0.7) 1px, transparent 1px)"
                        backgroundSize="20px 20px"
                      />

                      <style jsx>{`
                        @keyframes simpleFloat {
                          0%, 100% {
                            transform: translateY(0px);
                          }
                          50% {
                            transform: translateY(-8px);
                          }
                        }
                      `}</style>

                      {/* Developer Workspace Content */}
                      <VStack
                        spacing={5}
                        zIndex={2}
                        color="white"
                        textAlign="center"
                        px={6}
                        w="full"
                      >
                        <VStack spacing={2}>
                          <Badge
                            colorScheme="pink"
                            variant="solid"
                            fontSize="xs"
                            px={3}
                            py={0.5}
                            rounded="full"
                            textTransform="uppercase"
                            letterSpacing="wider"
                          >
                            Developer Workspace
                          </Badge>
                          <Text fontSize="2xl" fontWeight="bold" letterSpacing="-0.02em">
                            Focus Mode
                          </Text>
                          <Text fontSize="xs" opacity={0.85} maxW="280px">
                            Sign in to access project boards, backlog & sprint kanban
                          </Text>
                        </VStack>

                        {/* Simple Clean Developer Sprint Card with Smooth Floating Animation */}
                        <Box
                          w="full"
                          maxW="300px"
                          p={4}
                          borderRadius="xl"
                          bg="rgba(15, 10, 30, 0.65)"
                          backdropFilter="blur(16px)"
                          border="1px solid rgba(255, 255, 255, 0.16)"
                          textAlign="left"
                          boxShadow="0 16px 36px rgba(0, 0, 0, 0.3), 0 0 24px rgba(139, 92, 246, 0.2)"
                          style={{ animation: "simpleFloat 4.5s ease-in-out infinite" }}
                        >
                          {/* Card Top: Sprint / Project Info */}
                          <HStack justify="space-between" mb={3}>
                            <HStack spacing={2.5}>
                              <Flex
                                w="32px"
                                h="32px"
                                borderRadius="lg"
                                bg="whiteAlpha.150"
                                border="1px solid rgba(255, 255, 255, 0.2)"
                                align="center"
                                justify="center"
                                color="purple.200"
                              >
                                <FiLayers size={16} />
                              </Flex>
                              <VStack align="start" spacing={0}>
                                <Text fontSize="xs" fontWeight={700} color="white" lineHeight="shorter">
                                  Sprint 14 · Active
                                </Text>
                                <Text fontSize="3xs" color="whiteAlpha.600" fontFamily="mono">
                                  PROJ-KOBRA
                                </Text>
                              </VStack>
                            </HStack>
                            <Badge
                              colorScheme="pink"
                              variant="solid"
                              fontSize="3xs"
                              px={2}
                              py={0.5}
                              borderRadius="full"
                              letterSpacing="wider"
                            >
                              DEV
                            </Badge>
                          </HStack>

                          {/* Mini Kanban Task Progress */}
                          <Box
                            p={3}
                            borderRadius="lg"
                            bg="blackAlpha.300"
                            border="1px solid rgba(255, 255, 255, 0.08)"
                            mb={3}
                          >
                            <HStack justify="space-between" mb={1.5}>
                              <Text fontSize="xs" fontWeight={600} color="white" noOfLines={1}>
                                Kanban & Backlog Workflow
                              </Text>
                              <Text fontSize="3xs" color="purple.200" fontFamily="mono" fontWeight={600}>
                                80%
                              </Text>
                            </HStack>
                            <Box w="full" h="4px" bg="whiteAlpha.200" borderRadius="full" overflow="hidden">
                              <Box
                                w="80%"
                                h="full"
                                bgGradient="linear(to-r, pink.400, purple.400)"
                                borderRadius="full"
                              />
                            </Box>
                          </Box>

                          {/* Card Footer: Metadata */}
                          <HStack justify="space-between" fontSize="2xs" color="whiteAlpha.700">
                            <HStack spacing={1.5}>
                              <FiCheckSquare size={13} color="#a78bfa" />
                              <Text fontSize="3xs">4 of 5 Tasks Done</Text>
                            </HStack>
                            <HStack spacing={1}>
                              <Box w="5px" h="5px" borderRadius="full" bg="green.400" />
                              <Text fontSize="3xs" fontFamily="mono" color="green.300">
                                In Progress
                              </Text>
                            </HStack>
                          </HStack>
                        </Box>
                      </VStack>
                    </>
                  ) : (
                    <>
                      <Box
                        pos="absolute"
                        top="0"
                        left="0"
                        w="full"
                        h="full"
                        overflow="hidden"
                      >
                        <style jsx>{`
                          @keyframes wave1 {
                            0%, 100% { transform: translateX(0) translateY(0); }
                            50% { transform: translateX(-25%) translateY(-10%); }
                          }
                          @keyframes wave2 {
                            0%, 100% { transform: translateX(0) translateY(0); }
                            50% { transform: translateX(25%) translateY(10%); }
                          }
                          @keyframes wave3 {
                            0%, 100% { transform: translateX(0) translateY(0); }
                            50% { transform: translateX(-15%) translateY(15%); }
                          }
                          @keyframes float {
                            0%, 100% { transform: translateY(0px); }
                            50% { transform: translateY(-20px); }
                          }
                        `}</style>

                        {/* Wave 1 */}
                        <svg
                          style={{
                            position: 'absolute',
                            top: '10%',
                            left: '-10%',
                            width: '120%',
                            height: '100%',
                            opacity: 0.15,
                            animation: 'wave1 20s ease-in-out infinite'
                          }}
                          viewBox="0 0 1200 600"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0,100 Q300,50 600,100 T1200,100 L1200,0 L0,0 Z"
                            fill="white"
                          />
                          <path
                            d="M0,200 Q300,150 600,200 T1200,200"
                            stroke="white"
                            strokeWidth="3"
                            fill="none"
                          />
                        </svg>

                        {/* Wave 2 */}
                        <svg
                          style={{
                            position: 'absolute',
                            top: '30%',
                            left: '-5%',
                            width: '110%',
                            height: '100%',
                            opacity: 0.1,
                            animation: 'wave2 15s ease-in-out infinite'
                          }}
                          viewBox="0 0 1200 600"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0,150 Q400,100 800,150 T1200,150"
                            stroke="white"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            d="M0,250 Q400,200 800,250 T1200,250"
                            stroke="white"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>

                        {/* Wave 3 */}
                        <svg
                          style={{
                            position: 'absolute',
                            bottom: '0',
                            left: '0',
                            width: '100%',
                            height: '50%',
                            opacity: 0.2,
                            animation: 'wave3 25s ease-in-out infinite'
                          }}
                          viewBox="0 0 1200 300"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0,100 Q300,50 600,100 T1200,100 L1200,300 L0,300 Z"
                            fill="white"
                          />
                        </svg>

                        {/* Floating Circles */}
                        <Box
                          pos="absolute"
                          top="20%"
                          right="15%"
                          w="80px"
                          h="80px"
                          borderRadius="full"
                          border="2px solid"
                          borderColor="whiteAlpha.300"
                          style={{ animation: 'float 6s ease-in-out infinite' }}
                        />
                        <Box
                          pos="absolute"
                          bottom="25%"
                          left="10%"
                          w="60px"
                          h="60px"
                          borderRadius="full"
                          border="2px solid"
                          borderColor="whiteAlpha.200"
                          style={{ animation: 'float 8s ease-in-out infinite 1s' }}
                        />
                        <Box
                          pos="absolute"
                          top="50%"
                          right="25%"
                          w="40px"
                          h="40px"
                          borderRadius="full"
                          bg="whiteAlpha.200"
                          style={{ animation: 'float 7s ease-in-out infinite 2s' }}
                        />
                      </Box>

                      {/* Content Overlay */}
                      <VStack
                        spacing={4}
                        zIndex={2}
                        color="white"
                        textAlign="center"
                        px={8}
                      >
                        {ENABLE_UIM_SSO_BRANDING && (
                          <HStack
                            spacing={2}
                            px={3.5}
                            py={1.5}
                            borderRadius="full"
                            bg="rgba(255, 255, 255, 0.16)"
                            backdropFilter="blur(16px)"
                            border="1px solid rgba(255, 255, 255, 0.3)"
                            boxShadow="0 8px 24px rgba(0, 0, 0, 0.15)"
                          >
                            <Box
                              w="7px"
                              h="7px"
                              borderRadius="full"
                              bg="green.400"
                              boxShadow="0 0 8px #4ade80"
                            />
                            <Icon as={FiShield} boxSize={3.5} color="white" />
                            <Text
                              fontSize="2xs"
                              fontWeight={700}
                              letterSpacing="0.08em"
                              textTransform="uppercase"
                            >
                              Bank bjb UIM Integrated
                            </Text>
                          </HStack>
                        )}
                        <Text fontSize="3xl" fontWeight="bold">
                          Welcome Back
                        </Text>
                        <Text fontSize="md" opacity={0.9}>
                          Sign in to continue to your dashboard
                        </Text>
                      </VStack>
                    </>
                  )}
                </Flex>
              </GridItem>
              <GridItem
                colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}
                w={"full"}
                h={"full"}
                roundedRight={"xl"}
              >
                <Flex
                  w={"full"}
                  h={"full"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  p={8}
                  overflowY={"auto"}
                >
                  <AuthForm isDevMode={isDevMode} setIsDevMode={setIsDevMode} />
                  {/* <CaptchaGoogleComps /> */}
                </Flex>
              </GridItem>
            </Grid>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

interface AuthFormProps {
  isDevMode: boolean;
  setIsDevMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthForm: React.FC<AuthFormProps> = ({ isDevMode, setIsDevMode }) => {
  const showToast = useToastHelper();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const { colorMode } = useColorMode();

  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [IsError, setIsError] = useState(false);
  const { goLogin } = useAuth();
  const { Login, GetAuth, isLoading, error } = useAuthentications();
  const { GetMyAccess } = useSysModuleGroup();
  const [LupaPassText, setLupaPassText] = useState(false);

  const formik = useFormik({
    initialValues: initialValueAuthEx,
    validationSchema: FormSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setIsLoadingProcess(true);
      await AuthAction(values);
    },
  });

  useEffect(() => {
    setIsError(false);
  }, [formik.values]);

  const AuthAction = async (values: AuthCorporateUserModel) => {
    setIsLoadingProcess(true);

    const encryptedPassword = encryptAES(values.password);

    const response = await Login({
      username: values.username,
      password: encryptedPassword,
      uim: false,
    });

    const isErrorResponse = response?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !response) {
      showToast({
        description: response?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsError(true);
      setIsLoadingProcess(false);
      return;
    } else {
      if (response.data == null) {
        showToast({
          description: "Data return error",
          statusToast: "error",
        });
        setIsError(true);
        setIsLoadingProcess(false);
        return;
      }



      showToast({
        description: "Login Success, Loading user data...",
        statusToast: "info",
      });

      const authDataToken: loginReturn = response.data as loginReturn;

      // Get user data
      const getDataUser: AuthDataResponse | null = await GetDataUser(
        response.data.apiKey
      );

      if (getDataUser == null) {
        setIsLoadingProcess(false);
        return;
      }

      // Get user access data
      const accessResponse = await GetMyAccess(response.data.apiKey);

      if (accessResponse?.statusCode === RES_CODE_OK && accessResponse.data) {
        // Store access data in localStorage
        localStorage.setItem("accessData", JSON.stringify(accessResponse.data));
      }

      // Proceed with login
      if (isDevMode) {
        localStorage.setItem("dev_mode", "true");
      } else {
        localStorage.removeItem("dev_mode");
      }
      await goLogin(getDataUser, authDataToken);
      setIsError(false);
      setIsLoadingProcess(false);
    }
  };

  const GetDataUser = async (
    token: string
  ): Promise<AuthDataResponse | null> => {
    const response = await GetAuth(token);

    const isErrorResponse = response?.statusCode !== RES_CODE_OK;

    if (isErrorResponse || !response) {
      showToast({
        description: response?.message || RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
      setIsError(true);
      return null;
    } else {
      // await goLogin(values);
      setIsError(false);
      return response.data;
    }
  };

  return (
    <VStack width={"full"} spacing={3} align="stretch">
      {/* Brand & UIM Integration Header Card */}
      {ENABLE_UIM_SSO_BRANDING && (
        <Box
          p={3}
          borderRadius="xl"
          bg={
            isDevMode
              ? "rgba(24, 12, 48, 0.65)"
              : colorMode === "light"
              ? "linear-gradient(135deg, rgba(239, 246, 255, 0.92), rgba(240, 253, 250, 0.8))"
              : "linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.35))"
          }
          border="1px solid"
          borderColor={
            isDevMode
              ? "rgba(168, 85, 247, 0.3)"
              : colorMode === "light"
              ? "rgba(59, 130, 246, 0.22)"
              : "rgba(59, 130, 246, 0.3)"
          }
          boxShadow={
            isDevMode
              ? "0 4px 16px rgba(168, 85, 247, 0.15)"
              : colorMode === "light"
              ? "0 4px 16px rgba(37, 99, 235, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.9)"
              : "0 4px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
          }
          mb={1}
        >
          <Flex align="center" justify="space-between">
            {/* Left: Bank bjb Brand Logo */}
            <Flex width={"75px"} py={0.5}>
              <Image src={"/img/logo-bjb.png"} alt="Bank bjb" />
            </Flex>

            <Divider
              orientation="vertical"
              h="32px"
              mx={2}
              borderColor={colorMode === "light" ? "gray.300" : "whiteAlpha.300"}
            />

            {/* Right: Graphic UIM SSO Logo Emblem */}
            <HStack spacing={2.5} align="center">
              {/* Logo Emblem Squircle */}
              <Box pos="relative">
                <Flex
                  w="34px"
                  h="34px"
                  borderRadius="lg"
                  bgGradient={
                    isDevMode
                      ? "linear(to-br, #a855f7, #6366f1, #ec4899)"
                      : "linear(to-br, #1e40af, #2563eb, #06b6d4)"
                  }
                  align="center"
                  justify="center"
                  color="white"
                  boxShadow={
                    isDevMode
                      ? "0 4px 10px rgba(168, 85, 247, 0.4)"
                      : "0 4px 10px rgba(37, 99, 235, 0.35)"
                  }
                >
                  <Icon as={FiShield} boxSize="17px" />
                </Flex>
                {/* Active Pulsing Live Indicator */}
                <Box
                  pos="absolute"
                  bottom="-1px"
                  right="-1px"
                  w="9px"
                  h="9px"
                  borderRadius="full"
                  bg="green.400"
                  border="2px solid"
                  borderColor={colorMode === "light" ? "white" : "gray.900"}
                  boxShadow="0 0 6px #22c55e"
                />
              </Box>

              <VStack align="start" spacing={0}>
                <HStack spacing={1.5} align="center">
                  <Text
                    fontSize="xs"
                    fontWeight={800}
                    letterSpacing="0.04em"
                    color={
                      isDevMode
                        ? "purple.200"
                        : colorMode === "light"
                        ? "blue.800"
                        : "blue.100"
                    }
                    lineHeight="shorter"
                  >
                    UIM SSO
                  </Text>
                  <Badge
                    fontSize="3xs"
                    colorScheme="green"
                    variant="solid"
                    borderRadius="full"
                    px={1.5}
                    py={0.1}
                    letterSpacing="wider"
                  >
                    ACTIVE
                  </Badge>
                </HStack>
                <Text
                  fontSize="3xs"
                  fontWeight={500}
                  color={
                    isDevMode
                      ? "purple.300"
                      : colorMode === "light"
                      ? "gray.500"
                      : "gray.400"
                  }
                  letterSpacing="0.02em"
                  lineHeight="shorter"
                >
                  Unified Identity Management
                </Text>
              </VStack>
            </HStack>
          </Flex>
        </Box>
      )}

      <Box>
        <HStack justify="space-between" align="center">
          <Text fontWeight={600} fontSize={"20px"}>
            {isDevMode ? "Developer Workspace" : "Welcome"}
          </Text>
        </HStack>
        <Text
          color={
            isDevMode
              ? colorMode === "light"
                ? "purple.600"
                : "purple.300"
              : "gray.500"
          }
          fontSize="xs"
          mt={0.5}
          transition="color 0.3s ease"
        >
          {ENABLE_UIM_SSO_BRANDING
            ? "Use your User ID and Email/PC Password (UIM Authentication)"
            : "Use your User ID and Password to sign in"}
        </Text>
      </Box>
      <Box>
        {/* FORM AUTH */}
        <form onSubmit={formik.handleSubmit}>
          <VStack>
            <FormControl
              id="username"
              isInvalid={formik.errors.username ? true : false}
              isRequired
            >
              <FormLabel my={0}>User ID</FormLabel>
              <Input
                id="username"
                name="username"
                type="text"
                variant="flushed"
                onChange={formik.handleChange}
                value={formik.values.username}
                focusBorderColor={isDevMode ? "purple.400" : "secondary.500"}
              />
              <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
            </FormControl>
            <FormControl
              id="password"
              isInvalid={formik.errors.password ? true : false}
              isRequired
            >
              <FormLabel my={0}>Password</FormLabel>
              <InputGroup size="md">
                <Input
                  id="password"
                  name="password"
                  variant="flushed"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  type={show ? "text" : "password"}
                  focusBorderColor={isDevMode ? "purple.400" : "secondary.500"}
                />
                <InputRightElement>
                  <Button
                    variant={"ghost"}
                    h="1.75rem"
                    size="sm"
                    onClick={handleClick}
                  >
                    {show ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
            </FormControl>
            <Box w={"full"}>
              <Flex justify="flex-end">
                <Button
                  size={"sm"}
                  variant={"link"}
                  onClick={() => setLupaPassText(!LupaPassText)}
                >
                  Forgot password?
                </Button>
              </Flex>
            </Box>
            {/* <HStack justify="space-between" w="full" py={1}>
              <HStack spacing={2}>
                <Switch
                  id="dev-mode-toggle"
                  colorScheme="purple"
                  isChecked={isDevMode}
                  onChange={(e) => setIsDevMode(e.target.checked)}
                  size="sm"
                />
                <FormLabel
                  htmlFor="dev-mode-toggle"
                  mb={0}
                  fontSize="sm"
                  cursor="pointer"
                  userSelect="none"
                  color={colorMode === "light" ? "gray.700" : "gray.300"}
                >
                  Developer Mode
                </FormLabel>
              </HStack>
              {isDevMode && (
                <Badge
                  colorScheme="purple"
                  bgGradient={DEV_THEME.gradients.brand}
                  color="white"
                  fontSize="2xs"
                  px={2}
                  py={0.5}
                  rounded="md"
                >
                  DEV
                </Badge>
              )}
            </HStack> */}
            <Button
              rightIcon={<FiLogIn />}
              colorScheme={isDevMode ? "purple" : "secondary"}
              px={8}
              bgGradient={
                isDevMode
                  ? DEV_THEME.gradients.brand
                  : colorMode === "light"
                  ? "linear(to-r, secondary.500, secondary.900)"
                  : "linear(to-r, secondary.800, secondary.500)"
              }
              color="white"
              _hover={{
                bgGradient: isDevMode
                  ? DEV_THEME.gradients.brandHover
                  : undefined,
                transform: "translateY(-3px)",
                shadow: isDevMode
                  ? DEV_THEME.glows.purple
                  : "xl",
              }}
              type={"submit"}
              w={"full"}
              h={"50px"}
              isLoading={IsLoadingProcess}
              transition="all 0.3s ease"
            >
              {isDevMode ? "Sign In as Developer" : "Sign In"}
            </Button>
            <Text
              fontSize={"smaller"}
              color={"gray.600"}
              pt={1}
              display={LupaPassText ? "box" : "none"}
            >
              To reset your password, please submit a request through the User ID Management (UIM) application{" "}
              <Link href={"#"}>
                <Text as={"span"} fontWeight={600} color={"secondary.600"}>
                  Website UIM
                </Text>
              </Link>{" "}
              atau Jika membutuhkan panduan silahkan menghubungi IT Helpdesk di
              Extension{" "}
              <Text as={"span"} fontWeight={600}>
                5101 – 5119
              </Text>
            </Text>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
};

export default AuthPanelModal;
