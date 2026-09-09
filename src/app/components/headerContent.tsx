"use client";

import {
  Tooltip,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";

export interface HeaderContentProps {
  titleName?: string;
  title?: string;
  subtitle?: string;
  titleTooltip?: string;
  breadCrumb?: string[];
}

export function HeaderContent({
  titleName,
  title,
  subtitle,
  breadCrumb = [],
}: HeaderContentProps) {
  const displayTitle = title || titleName || "";
  const displaySubtitle =
    subtitle || (displayTitle ? `Manage and track your ${displayTitle.toLowerCase()} efficiently` : "");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.50, white)",
    "linear(to-r, gray.900, gray.800)"
  );
  const breadcrumbColor = useColorModeValue("gray.600", "gray.400");
  const subtitleColor = useColorModeValue("gray.500", "gray.400");

  return (
    <>
      <title>bjb aPPs | {displayTitle}</title>
      <Box
        bg={bgGradient}
        borderBottom="1px"
        borderColor={borderColor}
        px={6}
        py={4}
        mb={6}
      >
        <Flex justify="space-between" align="center" direction={{ base: "column", md: "row" }} gap={3}>
          <Box>
            <Heading as="h1" size="xl" fontWeight="600" mb={1}>
              {displayTitle}
            </Heading>
            {displaySubtitle && (
              <Text fontSize="sm" color={subtitleColor}>
                {displaySubtitle}
              </Text>
            )}
          </Box>
          {breadCrumb && breadCrumb.length > 0 && (
            <Breadcrumb fontSize="sm" color={breadcrumbColor}>
              {breadCrumb.map((item: string, index: number) => (
                <BreadcrumbItem key={item} isCurrentPage={index === breadCrumb.length - 1}>
                  <BreadcrumbLink
                    href="#"
                    fontWeight={index === breadCrumb.length - 1 ? "semibold" : "normal"}
                  >
                    {item}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
            </Breadcrumb>
          )}
        </Flex>
      </Box>
    </>
  );
}
