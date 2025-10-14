"use client";

import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Text,
  Center,
  Flex,
  Image,
  useColorMode,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useFormik } from "formik";
import { useState } from "react";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import * as Yup from "yup";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { encryptAES } from "@/app/helper/HashHelper";
import { RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import useUsers from "@/app/services/useUsers";

interface ChangePasswordModel {
  userId: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialValues: ChangePasswordModel = {
  userId: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ValidationSchema = Yup.object().shape({
  userId: Yup.string().required("User ID wajib diisi"),
  oldPassword: Yup.string().required("Password lama wajib diisi"),
  newPassword: Yup.string()
    .min(6, "Password minimal 6 karakter")
    .required("Password baru wajib diisi"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Konfirmasi password tidak cocok")
    .required("Konfirmasi password wajib diisi"),
});

export default function ChangePasswordPage() {
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const { EditUserPassword } = useUsers();
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik<ChangePasswordModel>({
    initialValues: initialValues,
    validationSchema: ValidationSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleChangePassword(values);
    },
  });

  const handleChangePassword = async (values: ChangePasswordModel) => {
    setIsLoading(true);
    
    try {
      const response = await EditUserPassword(
        values.userId,
        encryptAES(values.oldPassword),
        encryptAES(values.newPassword)
      );

      const isErrorResponse = response?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !response) {
        showToast({
          description: response?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        return;
      }

      showToast({
        description: "Password berhasil diubah",
        statusToast: "success",
      });

      // Reset form
      formik.resetForm();
    } catch (error) {
      showToast({
        description: "Terjadi kesalahan saat mengubah password",
        statusToast: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bg={colorMode === "light" ? "gray.50" : "gray.900"}
      py={8}
    >
      <Container maxW="md">
        <VStack spacing={6}>
          {/* Header */}
          <Box textAlign="center">
            <Center mb={4}>
              <Flex width={"80px"}>
                <Image src={"/img/logo-bjb.png"} alt="Bank bjb" />
              </Flex>
            </Center>
            <Heading size="lg" mb={2}>
              Ganti Password
            </Heading>
            <Text color="gray.600">
              Masukkan User ID dan password lama untuk mengubah password
            </Text>
          </Box>

          {/* Form Card */}
          <Card w="full" shadow="lg">
            <CardBody>
              <form onSubmit={formik.handleSubmit}>
                <VStack spacing={4}>
                  <FormControl
                    isInvalid={!!formik.errors.userId}
                    isRequired
                  >
                    <FormLabel>User ID</FormLabel>
                    <Input
                      name="userId"
                      type="text"
                      placeholder="Masukkan User ID Anda"
                      onChange={formik.handleChange}
                      value={formik.values.userId}
                    />
                    <FormErrorMessage>{formik.errors.userId}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={!!formik.errors.oldPassword}
                    isRequired
                  >
                    <FormLabel>Password Lama</FormLabel>
                    <InputGroup>
                      <Input
                        name="oldPassword"
                        type={showOldPassword ? "text" : "password"}
                        placeholder="Masukkan password lama"
                        onChange={formik.handleChange}
                        value={formik.values.oldPassword}
                      />
                      <InputRightElement>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowOldPassword(!showOldPassword)}
                        >
                          {showOldPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{formik.errors.oldPassword}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={!!formik.errors.newPassword}
                    isRequired
                  >
                    <FormLabel>Password Baru</FormLabel>
                    <InputGroup>
                      <Input
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Masukkan password baru"
                        onChange={formik.handleChange}
                        value={formik.values.newPassword}
                      />
                      <InputRightElement>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{formik.errors.newPassword}</FormErrorMessage>
                  </FormControl>

                  <FormControl
                    isInvalid={!!formik.errors.confirmPassword}
                    isRequired
                  >
                    <FormLabel>Konfirmasi Password Baru</FormLabel>
                    <InputGroup>
                      <Input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Ulangi password baru"
                        onChange={formik.handleChange}
                        value={formik.values.confirmPassword}
                      />
                      <InputRightElement>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                        </Button>
                      </InputRightElement>
                    </InputGroup>
                    <FormErrorMessage>{formik.errors.confirmPassword}</FormErrorMessage>
                  </FormControl>

                  <Alert status="info" rounded="md">
                    <AlertIcon />
                    <Text fontSize="sm">
                      Password baru minimal 6 karakter dan harus berbeda dari password lama
                    </Text>
                  </Alert>

                  <VStack w="full" spacing={3}>
                    <Button
                      type="submit"
                      colorScheme="secondary"
                      size="lg"
                      w="full"
                      rightIcon={<FiSave />}
                      isLoading={isLoading}
                      loadingText="Mengubah Password..."
                    >
                      Ubah Password
                    </Button>

                    <Link href="/">
                      <Button
                        variant="outline"
                        size="lg"
                        w="full"
                        leftIcon={<FiArrowLeft />}
                      >
                        Kembali ke Login
                      </Button>
                    </Link>
                  </VStack>
                </VStack>
              </form>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
