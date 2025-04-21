import { Flex, Spinner } from "@chakra-ui/react";

export const LoadingMiniStd = () => {
  return (
    <Flex w={"full"} justifyContent={"center"} alignItems={"center"} p={4}>
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="secondary.500"
        size="xl"
      />
    </Flex>
  );
};
