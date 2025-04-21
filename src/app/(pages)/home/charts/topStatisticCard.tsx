import { radiusStyle } from "@/app/constants/applicationConstants";
import { Box, Flex, Heading, Icon, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { IconType } from "react-icons";
import { CiMemoPad } from "react-icons/ci";
import { FaDraftingCompass } from "react-icons/fa";
import { FaDiagramProject } from "react-icons/fa6";
import { FiTrello } from "react-icons/fi";

export interface TopStatisticCardProps {
  label: string;
  icon: IconType;
  link: string;
  counter: string;
  alternateMode: boolean;
}

export const DataTopStatistic: TopStatisticCardProps[] = [
  {
    label: "BRD Open",
    counter: "6",
    icon: FaDraftingCompass,
    link: "#",
    alternateMode: false,
  },
  {
    label: "Project On Going",
    counter: "4",
    icon: FaDiagramProject,
    link: "#",
    alternateMode: false,
  },
  {
    label: "Pending Memo",
    counter: "14",
    icon: CiMemoPad,
    link: "#",
    alternateMode: false,
  },
  {
    label: "Pending Task",
    counter: "28",
    icon: FiTrello,
    link: "#",
    alternateMode: true,
  },
  // {
  //   label: "Pending Event",
  //   counter: "3",
  //   icon: FiCalendar,
  //   link: "#",
  //   alternateMode: false,
  // },
];

export const TopStatisticCard = ({ data }: { data: TopStatisticCardProps }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Flex
      bgGradient={
        data.alternateMode
          ? "linear(to-br, secondary.500, secondary.700)"
          : "linear(to-br, white, gray.100)"
      }
      rounded={radiusStyle}
      h={"120px"}
      color={data.alternateMode ? "white" : "secondary.800"}
      boxShadow={"md"}
      p={4}
      w={"full"}
      cursor={"pointer"}
      pos={"relative"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      overflow="hidden" // Ensure the overlay doesn't extend beyond the box
      transition="transform 0.3s ease-in-out"
      transform={isHovered ? "translateY(-10px)" : "translateY(0)"}
    >
      <Flex
        h={"full"}
        w={"30%"}
        justifyContent={"center"}
        alignItems={"center"}
        color={data.alternateMode ? "white" : "secondary.500"}
        // boxShadow={"md"}
      >
        <Icon fontSize={65} as={data.icon} />
      </Flex>
      <Flex h={"full"} w={"70%"}>
        <VStack w={"full"} align={"start"} spacing={1} pl={1}>
          <Text fontWeight={600}>{data.label}</Text>
          <Box w={"full"} h={"full"}>
            <Heading as="h2" size="2xl">
              {data.counter}
            </Heading>
          </Box>
        </VStack>
      </Flex>
    </Flex>
  );
};
