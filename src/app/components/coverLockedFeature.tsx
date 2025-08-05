import { Flex, Stack, Text } from "@chakra-ui/react";
import { IconType } from "react-icons";
import { radiusStyle } from "../constants/applicationConstants";
import { FiLock } from "react-icons/fi";

interface CoverLockedProp {
  title: string;
  desc: string;
  icon?: IconType;
}

const CoverLockedFeature = ({ title, desc, icon }: CoverLockedProp) => {
  return (
    <Flex
      as={Stack}
      p={8}
      position="absolute"
      border={"2px"}
      borderColor={"gray.200"}
      rounded={radiusStyle}
      boxShadow={"md"}
      top={0}
      left={0}
      w="100%"
      h="100%"
      bg="rgba(255, 255, 255, 0.5)" // semi-transparent white
      backdropFilter="blur(2px)" // apply blur
      display="flex"
      justifyContent="center"
      alignItems="center"
      zIndex={10}
    >
      <Flex alignItems={"center"} color={"secondary.500"}>
        <FiLock />
        <Text
          ml={3}
          fontWeight="bold"
          fontSize="lg"
          // color="gray.700"
        >
          {title}
        </Text>
      </Flex>
      <Text as={"p"} textAlign={"center"}>
        {desc}
      </Text>
    </Flex>
  );
};

export default CoverLockedFeature;
