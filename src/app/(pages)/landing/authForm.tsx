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
  useColorModeValue,
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
} from "@chakra-ui/react";
import { HttpStatusCode } from "axios";
import { hash } from "crypto";
import { useFormik } from "formik";
import Link from "next/link";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef, useState } from "react";
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
  const isCentered = useBreakpointValue({
    base: false,
    sm: false,
    md: true,
    lg: true,
  });

  return (
    <>
      <Button
        colorScheme={"primary"}
        onClick={onOpen}
        boxShadow={"md"}
        rounded={radiusStyle}
      >
        Masuk
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
          bg={useColorModeValue("white", "gray.900")}
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
                // bg="blue.500"
                roundedLeft={radiusStyle}
                display={{ base: "none", sm: "none", md: "flex", lg: "flex" }}
              >
                <Flex
                  roundedLeft={radiusStyle}
                  w={"full"}
                  h={"full"}
                  bgGradient={"linear(to-r, #1b517e, #063154)"}
                  backgroundPosition="center"
                  backgroundRepeat="no-repeat"
                  backgroundSize="cover"
                  backgroundImage={`url(./img/currency-bg.png)`}
                  pos={"relative"}
                  zIndex={1}
                >
                  <Box
                    roundedLeft={radiusStyle}
                    pos={"absolute"}
                    top="0"
                    left="0"
                    w="full"
                    h="full"
                    bgGradient="linear(to-b, rgba(17, 17, 17, 5%) 0%, rgba(17, 17, 17, 1) 80%)"
                    // bg={"red"}
                  ></Box>
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
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [IsError, setIsError] = useState(false);
  const { goLogin } = useAuth();
  const { Login, GetAuth, isLoading, error } = useAuthentications();

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
    const response = await Login({
      username: values.username,
      password: encryptAES(values.password),
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
        description: "Login Success, Redirecting",
        statusToast: "info",
      });
      const authDataToken: loginReturn = response.data as loginReturn;
      const getDataUser: AuthDataResponse | null = await GetDataUser(
        response.data.apiKey
      );
      console.log(getDataUser);
      if (getDataUser != null) {
        await goLogin(getDataUser, authDataToken);
      }
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
          Selamat Datang
        </Text>
      </Box>
      <Box>
        <Text>Gunakan akun Kobra bjb untuk masuk aplikasi.</Text>
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
              <FormLabel my={0}>Username</FormLabel>
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
                  // pr="4.5rem"
                  type={show ? "text" : "password"}
                  // placeholder="Isi Password..."
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
                <Spacer />
                <Link href="#">
                  <Button size={"sm"} variant={"link"}>
                    Lupa password?
                  </Button>
                </Link>
              </Flex>
            </Box>
            <Button
              rightIcon={<FiLogIn />}
              variant={"solid"}
              type={"submit"}
              w={"full"}
              h={"50px"}
              colorScheme={"primary"}
              isLoading={IsLoadingProcess}
            >
              Masuk
            </Button>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
};

export default AuthPanelModal;
