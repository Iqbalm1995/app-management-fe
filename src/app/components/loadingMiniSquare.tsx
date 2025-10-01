import { Flex, HStack, Text, useColorMode } from "@chakra-ui/react";
import Lottie from "lottie-react";
import logoBjbFile from "../json/bjb_loading_v01.json";

const LoadingMiniSquare = () => {
  const { colorMode } = useColorMode();
  return (
    <Flex justifyContent={"center"} alignItems={"center"}>
      <HStack spacing={2}>
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

export default LoadingMiniSquare;
