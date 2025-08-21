"use client";

import { ProjectDataResponse } from "@/app/services/useProjects";
import { 
  radiusStyle, 
  ENDPOINT_API_BASEURL, 
  ENDPOINT_PORT_BASIC 
} from "@/app/constants/applicationConstants";
import { 
  getProjectHealthRating, 
  truncateText, 
  buildUrlPort 
} from "@/app/helper/MasterHelper";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import { TfiPulse } from "react-icons/tfi";
import { FiAlertTriangle } from "react-icons/fi";
import Link from "next/link";
import { memo, useState } from "react";

interface CardProjectProps {
  data: ProjectDataResponse;
}

const CardProject = memo(({ data }: CardProjectProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { colorMode } = useColorMode();

  return (
    <Link href={`projects-manager/detail?projectId=${data.id}`}>
      <Flex
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        w={"full"}
        bgColor={colorMode == "light" ? "white" : "gray.900"}
        border={"1px"}
        borderColor={colorMode == "light" ? "gray.200" : "gray.900"}
        rounded={"3xl"}
        boxShadow={"md"}
        as={Stack}
        h={"430px"}
        _hover={{
          cursor: "pointer",
        }}
        transition="transform 0.2s ease-in-out, background-color 0.2s ease, box-shadow 0.2s ease-in-out"
        transform={isHovered ? "translateY(-10px)" : "translateY(0)"}
      >
        {/* ICON APP */}
        <Flex
          position="relative"
          bgGradient={"linear(to-br, secondary.800, secondary.500)"}
          roundedTop={"3xl"}
          color={"white"}
          w={"full"}
          h="180px"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          fontSize={data.appsProject.appShortName.length > 4 ? "2xl" : "4xl"}
          fontWeight="bold"
          textOverflow="ellipsis"
          whiteSpace="nowrap"
          flexShrink={0}
        >
          {data.appsProject.appShortName}

          {/* Floating component at bottom center */}
          <Flex
            position="absolute"
            bottom="8px"
            left="50%"
            transform="translateX(-50%)"
            px={4}
            py={1}
            as={HStack}
            alignItems={"end"}
            justifyContent={"space-between"}
            w={"full"}
          >
            <Flex
              as={Stack}
              textAlign={"start"}
              fontSize={"x-small"}
              fontWeight={500}
              spacing={0}
            >
              <Text>{data.projectType}</Text>
              <Text>{data.projectCategory}</Text>
            </Flex>
            <Badge
              rounded={"md"}
              fontSize={"large"}
              colorScheme={"blackAlpha"}
              variant="solid"
              px={2}
              boxShadow={"md"}
            >
              {data.projectStatus}
            </Badge>
          </Flex>
        </Flex>

        {/* Body */}
        <Flex
          px={6}
          py={4}
          as={Stack}
          spacing={1}
          justifyContent={"center"}
          alignItems={"center"}
        >
          {/* PROJECT NUMBER */}
          <Text fontWeight={600} fontSize={"small"} color={"secondary.700"}>
            No. {data.projectNo}
          </Text>

          {/* PROJECT NAME */}
          <Flex
            w={"full"}
            justifyContent={"center"}
            alignItems={"center"}
            h={"80px"}
          >
            <Tooltip
              hasArrow
              label={data.projectName}
              p={2}
              bg={"gray.100"}
              color={"secondary.700"}
              placement={"bottom"}
              rounded={radiusStyle}
              textAlign={"center"}
              display={data.projectName.length > 50 ? "flex" : "none"}
            >
              <Heading as="h3" size="md" textAlign={"center"}>
                {truncateText(data.projectName, 50)}
              </Heading>
            </Tooltip>
          </Flex>

          {/* PROJECT MEMBER */}
          <AvatarGroup size={"sm"} max={4}>
            {data.userAssignment.map((u, idx) => (
              <Avatar key={idx} name={u.userData.nama} />
            ))}
          </AvatarGroup>

          {/* PERCENTAGE */}
          <Box w="full" h="4px" bg="gray.100" borderRadius="full" mt={4}>
            <Box h="100%" w={`80%`} bg="blue.400" borderRadius="full" />
          </Box>

          {/* MORE INFO */}
          <Flex
            mt={2}
            py={1}
            as={HStack}
            alignItems={"end"}
            justifyContent={"space-between"}
            w={"full"}
          >
            <Flex alignItems={"center"} as={HStack}>
              <TfiPulse color={"red"} />
              <Text fontWeight={600}>
                Health :{" "}
                <Text as={"span"}>
                  {getProjectHealthRating(data.projectStatusPercentage)}
                </Text>
              </Text>
            </Flex>
            <Flex alignItems={"center"} justifyContent={"end"} as={HStack}>
              <Badge
                colorScheme={"orange"}
                rounded={"md"}
                fontSize={"small"}
                px={2}
                display={"none"}
                alignItems={"center"}
                gap={2}
              >
                <FiAlertTriangle />
                Project tanpa Memo
              </Badge>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
});

CardProject.displayName = "CardProject";

export default CardProject;
