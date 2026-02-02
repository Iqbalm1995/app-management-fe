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
import { useState, useEffect } from "react";
import { FiSave, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { encryptAES } from "@/app/helper/HashHelper";
import { RES_CODE_OK, RES_GENERIC_ERROR_MSG } from "@/app/constants/applicationConstants";
import useUsers from "@/app/services/useUsers";
import { AuthDataModelInterface, useAuth } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";

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
  useDocumentTitle("Change Password");
  const { colorMode } = useColorMode();
  const showToast = useToastHelper();
  const router = useRouter();
  const { EditUserPassword } = useUsers();
  const { goLogout } = useAuth();
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);

  // Check if user is logged in and auto-fill userId
  useEffect(() => {
    // Check for temporary userId from login (default password scenario)
    const tempUserId = localStorage.getItem("tempUserId");
    if (tempUserId) {
      formik.setFieldValue("userId", tempUserId);
      setIsDefaultPassword(true);
      localStorage.removeItem("tempUserId");
      return;
    }
    
    // Check if user is logged in
    const storedData = localStorage.getItem("authData");
    if (storedData) {
      try {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
        if (UserData?.userId) {
          formik.setFieldValue("userId", UserData.userId);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Error parsing auth data:", error);
      }
    }
  }, []);

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
      const encryptedOld = encryptAES(values.oldPassword);
      const encryptedNew = encryptAES(values.newPassword);
      
      // Check if new password is same as old password
      if (encryptedOld === encryptedNew) {
        showToast({
          description: "Password baru tidak boleh sama dengan password lama",
          statusToast: "warning",
        });
        setIsLoading(false);
        return;
      }
      
      // Check if new password is the default password
      if (encryptedNew === "sJTLr62VFATzZr7e3jmwNA==") {
        showToast({
          description: "Password baru tidak boleh menggunakan password default",
          statusToast: "warning",
        });
        setIsLoading(false);
        return;
      }
      
      const response = await EditUserPassword(
        values.userId,
        encryptedOld,
        encryptedNew
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

      showToast({
        description: "Silakan login kembali dengan password baru",
        statusToast: "info",
      });
      
      // Use goLogout to properly destroy session and update navbar
      setTimeout(() => {
        goLogout();
      }, 2000);
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
      bgGradient="linear(to-br, #1e3a8a, #3b82f6, #06b6d4)"
      py={8}
      position="relative"
      overflow="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      {/* Animated Wave Background Pattern */}
      <Box
        pos="absolute"
        top="0"
        left="0"
        w="full"
        h="full"
        overflow="hidden"
        opacity={0.1}
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
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(5deg); }
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
            animation: 'wave1 20s ease-in-out infinite'
          }}
          viewBox="0 0 1200 600"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,100 Q300,50 600,100 T1200,100 L1200,0 L0,0 Z"
            fill="white"
          />
        </svg>

        {/* Wave 2 */}
        <svg
          style={{
            position: 'absolute',
            bottom: '0',
            left: '0',
            width: '100%',
            height: '50%',
            animation: 'wave2 25s ease-in-out infinite'
          }}
          viewBox="0 0 1200 300"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,100 Q300,50 600,100 T1200,100 L1200,300 L0,300 Z"
            fill="white"
          />
        </svg>

        {/* Floating BJB Logo Pattern */}
        <Box
          pos="absolute"
          top="20%"
          right="10%"
          w="150px"
          h="150px"
          opacity={0.3}
          style={{ animation: 'float 6s ease-in-out infinite' }}
        >
          <Image src="/img/logo-bjb.png" alt="BJB" />
        </Box>
        <Box
          pos="absolute"
          bottom="20%"
          left="5%"
          w="100px"
          h="100px"
          opacity={0.2}
          style={{ animation: 'float 8s ease-in-out infinite 2s' }}
        >
          <Image src="/img/logo-bjb.png" alt="BJB" />
        </Box>
      </Box>

      <Container maxW="2xl" position="relative" zIndex={1}>
        <VStack spacing={6}>
          {/* Form Card */}
          <Box
            w="full"
            maxW="800px"
            bg="white"
            borderRadius="3xl"
            boxShadow="0 20px 60px rgba(0,0,0,0.3)"
            p={10}
            position="relative"
            _before={{
              content: '""',
              position: "absolute",
              top: "-2px",
              left: "-2px",
              right: "-2px",
              bottom: "-2px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))",
              borderRadius: "3xl",
              zIndex: -1,
            }}
          >
            {/* Header inside form */}
            <Box textAlign="center" mb={8}>
              <Center mb={4}>
                <Flex width={"80px"}>
                  <Image src={"/img/logo-bjb.png"} alt="Bank bjb" />
                </Flex>
              </Center>
              <Heading size="lg" mb={2} color="gray.800">
                Ganti Password
              </Heading>
              <Text color="gray.600" fontWeight="500">
                Masukkan User ID dan password lama untuk mengubah password
              </Text>
            </Box>

            {isDefaultPassword && (
              <Alert 
                status="warning" 
                mb={6} 
                borderRadius="2xl" 
                bg="orange.50"
                border="2px solid"
                borderColor="orange.200"
                py={4}
              >
                <AlertIcon color="orange.500" boxSize={5} />
                <Box>
                  <Text fontSize="sm" fontWeight="600" color="orange.800" mb={1}>
                    Password Default Terdeteksi
                  </Text>
                  <Text fontSize="xs" color="orange.700">
                    Silakan ganti password untuk keamanan akun Anda.
                  </Text>
                </Box>
              </Alert>
            )}
            
            <form onSubmit={formik.handleSubmit}>
              <VStack spacing={6}>
                <FormControl
                  isInvalid={!!formik.errors.userId}
                  isRequired
                >
                  <FormLabel fontWeight="700" fontSize="sm" color="gray.700" mb={2}>
                    User ID
                  </FormLabel>
                  <Input
                    name="userId"
                    type="text"
                    placeholder="Masukkan User ID Anda"
                    onChange={formik.handleChange}
                    value={formik.values.userId}
                    isReadOnly={isLoggedIn || isDefaultPassword}
                    size="lg"
                    h="56px"
                    borderRadius="xl"
                    bg="gray.50"
                    border="2px solid"
                    borderColor="gray.200"
                    fontSize="md"
                    fontWeight="500"
                    _hover={{ borderColor: "secondary.300", bg: "white" }}
                    _focus={{ 
                      borderColor: "secondary.500", 
                      bg: "white",
                      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" 
                    }}
                    _readOnly={{ bg: "gray.100", cursor: "not-allowed" }}
                    transition="all 0.2s"
                  />
                  <FormErrorMessage fontSize="xs" mt={2}>{formik.errors.userId}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={!!formik.errors.oldPassword}
                  isRequired
                >
                  <FormLabel fontWeight="700" fontSize="sm" color="gray.700" mb={2}>
                    Password Lama
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      name="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={formik.handleChange}
                      value={formik.values.oldPassword}
                      h="56px"
                      borderRadius="xl"
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.200"
                      fontSize="md"
                      fontWeight="500"
                      _hover={{ borderColor: "secondary.300", bg: "white" }}
                      _focus={{ 
                        borderColor: "secondary.500", 
                        bg: "white",
                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" 
                      }}
                      transition="all 0.2s"
                    />
                    <InputRightElement h="56px">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        color="gray.500"
                        _hover={{ color: "secondary.500", bg: "transparent" }}
                      >
                        {showOldPassword ? <ViewOffIcon boxSize={5} /> : <ViewIcon boxSize={5} />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage fontSize="xs" mt={2}>{formik.errors.oldPassword}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={!!formik.errors.newPassword}
                  isRequired
                >
                  <FormLabel fontWeight="700" fontSize="sm" color="gray.700" mb={2}>
                    Password Baru
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={formik.handleChange}
                      value={formik.values.newPassword}
                      h="56px"
                      borderRadius="xl"
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.200"
                      fontSize="md"
                      fontWeight="500"
                      _hover={{ borderColor: "secondary.300", bg: "white" }}
                      _focus={{ 
                        borderColor: "secondary.500", 
                        bg: "white",
                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" 
                      }}
                      transition="all 0.2s"
                    />
                    <InputRightElement h="56px">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        color="gray.500"
                        _hover={{ color: "secondary.500", bg: "transparent" }}
                      >
                        {showNewPassword ? <ViewOffIcon boxSize={5} /> : <ViewIcon boxSize={5} />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage fontSize="xs" mt={2}>{formik.errors.newPassword}</FormErrorMessage>
                </FormControl>

                <FormControl
                  isInvalid={!!formik.errors.confirmPassword}
                  isRequired
                >
                  <FormLabel fontWeight="700" fontSize="sm" color="gray.700" mb={2}>
                    Konfirmasi Password Baru
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      onChange={formik.handleChange}
                      value={formik.values.confirmPassword}
                      h="56px"
                      borderRadius="xl"
                      bg="gray.50"
                      border="2px solid"
                      borderColor="gray.200"
                      fontSize="md"
                      fontWeight="500"
                      _hover={{ borderColor: "secondary.300", bg: "white" }}
                      _focus={{ 
                        borderColor: "secondary.500", 
                        bg: "white",
                        boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" 
                      }}
                      transition="all 0.2s"
                    />
                    <InputRightElement h="56px">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        color="gray.500"
                        _hover={{ color: "secondary.500", bg: "transparent" }}
                      >
                        {showConfirmPassword ? <ViewOffIcon boxSize={5} /> : <ViewIcon boxSize={5} />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage fontSize="xs" mt={2}>{formik.errors.confirmPassword}</FormErrorMessage>
                </FormControl>

                <Alert 
                  status="info" 
                  borderRadius="xl" 
                  bg="blue.50"
                  border="1px solid"
                  borderColor="blue.100"
                  py={3}
                >
                  <AlertIcon color="blue.500" boxSize={4} />
                  <Text fontSize="xs" color="blue.700" fontWeight="500">
                    Password minimal 6 karakter dan berbeda dari password lama
                  </Text>
                </Alert>

                <VStack w="full" spacing={3} pt={3}>
                  <Button
                    type="submit"
                    size="lg"
                    w="full"
                    h="60px"
                    rightIcon={<FiSave />}
                    isLoading={isLoading}
                    loadingText="Mengubah Password..."
                    borderRadius="xl"
                    bgGradient="linear(to-r, #1e3a8a, #3b82f6)"
                    color="white"
                    fontSize="md"
                    fontWeight="700"
                    boxShadow="0 4px 15px rgba(59, 130, 246, 0.4)"
                    _hover={{
                      bgGradient: "linear(to-r, #1e40af, #2563eb)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.5)",
                    }}
                    _active={{
                      transform: "translateY(0)",
                    }}
                    transition="all 0.2s"
                  >
                    Ubah Password
                  </Button>

                  <Link href={isLoggedIn ? "/home" : "/"} style={{ width: "100%" }}>
                    <Button
                      variant="ghost"
                      size="lg"
                      w="full"
                      h="60px"
                      leftIcon={<FiArrowLeft />}
                      borderRadius="xl"
                      color="gray.600"
                      fontWeight="600"
                      _hover={{
                        bg: "gray.100",
                        color: "gray.800",
                      }}
                      transition="all 0.2s"
                    >
                      {isLoggedIn ? "Kembali" : "Kembali ke Login"}
                    </Button>
                  </Link>
                </VStack>
              </VStack>
            </form>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
