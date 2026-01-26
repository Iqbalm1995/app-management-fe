"use client";

import {
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
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
  useColorMode,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLogIn } from "react-icons/fi";
import * as Yup from "yup";

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
                  bgGradient={"linear(to-br, #1e3a8a, #3b82f6, #06b6d4)"}
                  pos={"relative"}
                  alignItems="center"
                  justifyContent="center"
                >
                  {/* Animated Wave Lines */}
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
                    <Text fontSize="3xl" fontWeight="bold">
                      Welcome Back
                    </Text>
                    <Text fontSize="md" opacity={0.9}>
                      Sign in to continue to your dashboard
                    </Text>
                  </VStack>
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
                  <AuthForm />
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

const AuthForm = () => {
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
      // showToast({
      //   description: "Proses Login",
      //   statusToast: "loading",
      // });

      setIsLoadingProcess(true);
      await AuthAction(values);
    },
  });

  useEffect(() => {
    setIsError(false);
  }, [formik.values]);

  const AuthAction = async (values: AuthCorporateUserModel) => {
    setIsLoadingProcess(true);
    
    // Check if using default password
    const encryptedPassword = encryptAES(values.password);
    if (encryptedPassword === "sJTLr62VFATzZr7e3jmwNA==") {
      showToast({
        description: "Anda masih menggunakan kata sandi default. Silakan ganti kata sandi untuk melanjutkan.",
        statusToast: "warning",
      });
      
      // Show success message before redirect
      setTimeout(() => {
        showToast({
          description: "Mengalihkan ke halaman Ganti Kata Sandi…",
          statusToast: "success",
        });
        
        // Store userId temporarily for change password page
        localStorage.setItem("tempUserId", values.username);
        
        // Redirect after short delay
        setTimeout(() => {
          router.push("/change-password");
        }, 1500);
      }, 1000);
      
      setIsLoadingProcess(false);
      return;
    }
    
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
      <Box>
        <Center>
          <Flex width={"80px"} py={2}>
            <Image src={"/img/logo-bjb.png"} alt="Bank bjb" />
          </Flex>
        </Center>
      </Box>
      <Box>
        <Text fontWeight={600} fontSize={"20px"}>
          Welcome
        </Text>
      </Box>
      <Box>
        <Text>Use your User ID and Email/PC Password</Text>
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
              <FormLabel my={0}>User ID / E-mail</FormLabel>
              <Input
                id="username"
                name="username"
                type="text"
                variant="flushed"
                onChange={formik.handleChange}
                value={formik.values.username}
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
              <Flex>
                <Link href="/change-password">
                  <Button
                    size={"sm"}
                    variant={"link"}
                    color={"secondary.600"}
                  >
                    Change Password
                  </Button>
                </Link>
                <Spacer />
                <Link href="#">
                  <Button
                    size={"sm"}
                    variant={"link"}
                    onClick={() => setLupaPassText(!LupaPassText)}
                  >
                    Forgot password?
                  </Button>
                </Link>
              </Flex>
            </Box>
            <Button
              rightIcon={<FiLogIn />}
              colorScheme={"secondary"}
              px={8}
              bgGradient={
                colorMode === "light"
                  ? "linear(to-r, secondary.500, secondary.900)"
                  : "linear(to-r, secondary.800, secondary.500)"
              }
              color="white"
              _hover={{
                transform: "translateY(-3px)",
                shadow: "xl",
              }}
              type={"submit"}
              w={"full"}
              h={"50px"}
              isLoading={IsLoadingProcess}
            >
              Sign In
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
