"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import {
  VStack,
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  FormErrorMessage,
  Code,
  Center,
  Image,
  Flex,
  useColorMode,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { FiLogIn, FiCode } from "react-icons/fi";
import { encryptAES } from "@/app/helper/HashHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import useAuthentications, { AuthDataResponse } from "@/app/services/useAuthentications";
import useSysModuleGroup from "@/app/services/useSysModuleGroup";
import {
  STATUS_LOGIN_ON,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { useAuth, type AuthDataModelInterface, type loginReturn } from "@/app/context/AuthContext";

interface AuthCorporateUserModel {
  username: string;
  password: string;
}

const initialValues: AuthCorporateUserModel = {
  username: "",
  password: "",
};

const FormSchema = Yup.object().shape({
  username: Yup.string().required("Required"),
  password: Yup.string().required("Required"),
});

const DevAuthForm = () => {
  const router = useRouter();
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const { goLogin } = useAuth();
  const [show, setShow] = useState(false);
  const [isLoadingProcess, setIsLoadingProcess] = useState(false);

  const { Login, GetAuth } = useAuthentications();
  const { GetMyAccess } = useSysModuleGroup();

  const formik = useFormik({
    initialValues,
    validationSchema: FormSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      setIsLoadingProcess(true);
      await handleDevLogin(values);
    },
  });

  const handleDevLogin = async (values: AuthCorporateUserModel) => {
    try {
      const encryptedPassword = encryptAES(values.password);

      const response = await Login({
        username: values.username,
        password: encryptedPassword,
        uim: false,
      });

      const isErrorResponse = response?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !response || !response.data) {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      showToast({
        description: "Login Success, entering Developer Mode...",
        statusToast: "info",
      });

      const authDataToken: loginReturn = response.data as loginReturn;

      // Get user profile data
      const userRes = await GetAuth(authDataToken.apiKey);
      if (!userRes || userRes.statusCode !== RES_CODE_OK || !userRes.data) {
        showToast({
          description: userRes?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        return;
      }

      const userData: AuthDataResponse = userRes.data;

      // Get user access permissions
      const accessResponse = await GetMyAccess(authDataToken.apiKey);
      if (accessResponse?.statusCode === RES_CODE_OK && accessResponse.data) {
        localStorage.setItem("accessData", JSON.stringify(accessResponse.data));
      }

      // Check default password detection
      if (encryptedPassword === "sJTLr62VFATzZr7e3jmwNA==") {
        showToast({
          description: "Anda menggunakan password default. Silakan ganti password Anda.",
          statusToast: "warning",
        });
      }

      // Set dev_mode flag so AuthContext redirects to /dev and knows we are in dev mode
      localStorage.setItem("dev_mode", "true");

      showToast({
        description: "Welcome to Developer Mode",
        statusToast: "success",
      });

      // Delegate to standard goLogin which sets React state, localStorage authData, tokenData, and redirects
      await goLogin(userData, authDataToken);
    } catch (err) {
      console.error("Developer mode login error:", err);
      showToast({
        description: RES_GENERIC_ERROR_MSG,
        statusToast: "error",
      });
    } finally {
      setIsLoadingProcess(false);
    }
  };

  return (
    <VStack width="full" spacing={3} align="stretch">
      <Box>
        <Center>
          <Flex width="80px" py={2}>
            <Image src="/img/logo-bjb.png" alt="Bank bjb" />
          </Flex>
        </Center>
      </Box>

      <Box>
        <Flex align="center" justify="space-between">
          <Text fontWeight={600} fontSize="20px">
            Developer Mode
          </Text>
          <Code
            fontSize="xs"
            colorScheme="purple"
            px={2}
            py={0.5}
            borderRadius="md"
            fontFamily="mono"
          >
            DEV ACCESS
          </Code>
        </Flex>
        <Text fontSize="sm" color="gray.500" mt={1}>
          Fast-track workspace for developers
        </Text>
      </Box>

      <Box>
        <form onSubmit={formik.handleSubmit}>
          <VStack spacing={4}>
            <FormControl
              id="dev-username"
              isInvalid={!!formik.errors.username}
              isRequired
            >
              <FormLabel my={0} fontSize="sm">
                User ID / E-mail
              </FormLabel>
              <Input
                id="dev-username"
                name="username"
                type="text"
                variant="flushed"
                onChange={formik.handleChange}
                value={formik.values.username}
                placeholder="Enter your User ID"
              />
              <FormErrorMessage>{formik.errors.username}</FormErrorMessage>
            </FormControl>

            <FormControl
              id="dev-password"
              isInvalid={!!formik.errors.password}
              isRequired
            >
              <FormLabel my={0} fontSize="sm">
                Password
              </FormLabel>
              <InputGroup size="md">
                <Input
                  id="dev-password"
                  name="password"
                  variant="flushed"
                  onChange={formik.handleChange}
                  value={formik.values.password}
                  type={show ? "text" : "password"}
                  placeholder="Enter your Password"
                />
                <InputRightElement>
                  <Button
                    variant="ghost"
                    h="1.75rem"
                    size="sm"
                    onClick={() => setShow(!show)}
                  >
                    {show ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{formik.errors.password}</FormErrorMessage>
            </FormControl>

            <Button
              rightIcon={<FiLogIn />}
              leftIcon={<FiCode />}
              colorScheme="purple"
              type="submit"
              w="full"
              h="50px"
              mt={2}
              isLoading={isLoadingProcess}
              loadingText="Entering Developer Mode..."
              borderRadius="md"
            >
              Enter Developer Mode
            </Button>
          </VStack>
        </form>
      </Box>
    </VStack>
  );
};

export default DevAuthForm;
