"use client";

import { Flex, HStack, Text, useColorMode } from "@chakra-ui/react";
import dynamic from "next/dynamic";
import logoBjbFile from "../json/bjb_loading_v01.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const LoadingMiniSignature = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex
      w={"full"}
      minH={"40vh"}
      justifyContent={"center"}
      alignItems={"center"}
    >
      <HStack spacing={2}>
        <Flex alignItems={"center"} h={"8vh"}>
          <Text
            fontWeight={500}
            color={colorMode == "light" ? "gray.800" : "white"}
            pt={5}
          >
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
  );
};

export default LoadingMiniSignature;
