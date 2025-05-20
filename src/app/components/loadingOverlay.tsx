"use client";

import { Box, Center, Flex, HStack, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import logoBjbFile from "../json/bjb_loading_v01.json";

const MotionCenter = motion(Center);

export const LoadingOverlay = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <MotionCenter
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      pointerEvents={isLoading ? "all" : "none"}
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="rgba(0, 0, 0, 0.8)" // semi-transparent background
      //   bgGradient="linear(to-b, rgba( 27, 81, 126 , 0.5) 0%, rgba( 27, 81, 126 , 1) 90%)"
      zIndex="1000"
    >
      <Box boxSize="sm">
        <Lottie
          autoplay
          loop
          animationData={logoBjbFile}
          style={{ height: "100%", width: "100%" }}
        />
      </Box>
    </MotionCenter>
  );
};

export const LoadingOverlay2 = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <MotionCenter
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      pointerEvents={isLoading ? "all" : "none"}
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bg="rgba(0, 0, 0, 0.8)" // semi-transparent background
      //   bgGradient="linear(to-b, rgba( 27, 81, 126 , 0.5) 0%, rgba( 27, 81, 126 , 1) 90%)"
      zIndex="1000"
    >
      <Flex w={"90%"} h={"75vh"} justifyContent={"end"} alignItems={"end"}>
        <HStack spacing={2}>
          <Flex alignItems={"center"} h={"8vh"}>
            <Text fontWeight={600} color={"gray.200"} pt={5}>
              Mohon Tunggu
            </Text>
          </Flex>
          <Flex>
            <Lottie
              autoplay
              loop
              animationData={logoBjbFile}
              style={{ height: "10vh", width: "10vh" }}
            />
          </Flex>
        </HStack>
      </Flex>
    </MotionCenter>
  );
};

export const LoadingScreenDefault = () => {
  return (
    <Center h="100vh">
      <Box boxSize="sm">
        <Lottie
          autoplay
          loop
          animationData={logoBjbFile}
          style={{ height: "60%", width: "60%" }}
        />
      </Box>
    </Center>
  );
};
