import { Box, Heading, Text, useColorMode, VStack } from "@chakra-ui/react";
import { FiFrown } from "react-icons/fi";

const InvalidLoadPageView = () => {
  const { colorMode } = useColorMode();
  return (
    <VStack spacing={6} align="center" justify="center" minH="400px">
      <Box
        w={20}
        h={20}
        bg="red.100"
        rounded="full"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <FiFrown size={40} color="red" />
      </Box>
      <VStack spacing={3} textAlign="center">
        <Heading
          size="lg"
          color={colorMode == "light" ? "gray.800" : "gray.100"}
        >
          Tejadi Kesalahan
        </Heading>
        <Text
          color={colorMode == "light" ? "gray.600" : "gray.400"}
          maxW="500px"
        >
          Terjadi kesalahan saat identifikasi data atau pada saat penarikan
          data, perikasa data yang diidentifikasi atau coba muat ulang halaman.
        </Text>
      </VStack>
    </VStack>
  );
};

export default InvalidLoadPageView;
