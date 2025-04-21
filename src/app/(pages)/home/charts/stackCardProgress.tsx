import { Avatar, Box, Flex, HStack, Spacer, Stack, Text, Wrap } from "@chakra-ui/react";
import { RadialBar } from "./radialBar";

export interface DataUserProgressProps {
  fullname: string;
  roleTeam: string;
  progress: number;
  max: number;
}

export const StackCardProgress = ({
  dt,
}: {
  dt: DataUserProgressProps;
}) => {
  return (
    <Flex w={"full"} as={HStack}>
      <Flex
        h={"full"}
        w={"100px"}
        alignItems={"center"}
        justifyContent={"center"}
      >
        <Avatar size={"md"} name={dt.fullname} src={""} />
      </Flex>
      <Flex
        w={"full"}
        alignItems={"center"}
        justifyContent={"start"}
        as={Stack}
        spacing={0}
      >
        <Flex w={"full"} gap={1} as={Wrap} alignItems={"end"}>
          <Text fontSize={"medium"}>{dt.fullname}</Text>
          <Text fontSize={"small"}>({dt.roleTeam})</Text>
        </Flex>
        <Flex w={"full"}>
          <Text
            fontSize={"small"}
            fontWeight={600}
            color={dt.progress > dt.max ? "red.300" : "secondary.500"}
          >
            ({dt.progress}/{dt.max}) Mandays
          </Text>
        </Flex>
      </Flex>
      <Spacer />
      <Box h={"80px"} w={"80px"}>
        <RadialBar progress={dt.progress} max={dt.max} />
      </Box>
    </Flex>
  );
};
