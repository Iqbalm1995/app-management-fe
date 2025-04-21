import {
  Container,
  Flex,
  Grid,
  Heading,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { ReactNode } from "react";

export const BaseContentBody = ({
  tittleContent,
  children,
}: {
  tittleContent: string;
  children: ReactNode;
}) => {
  return (
    <>
      <Container as={Stack} maxW={"container.xl"} py={10}>
        <VStack w={"full"} gap={8}>
          <Flex justifyContent={"flex-start"} w={"full"}>
            <Heading as="h3" size="lg" color={"secondary.900"}>
              {tittleContent}
            </Heading>
          </Flex>
          <Flex justifyContent={"flex-start"} w={"full"}>
            {children}
          </Flex>
        </VStack>
      </Container>
    </>
  );
};

export const InputLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "25% 50%",
      }}
      alignItems="center"
      w="full"
    >
      {children}
    </Grid>
  );
};

export const InputLayoutFull = ({ children }: { children: ReactNode }) => {
  return (
    <Grid
      templateColumns={{
        base: "1fr",
        md: "25% 75%",
      }}
      alignItems="center"
      alignContent={"center"}
      w="full"
    >
      {children}
    </Grid>
  );
};
