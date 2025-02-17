"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Grid,
  GridItem,
  Heading,
} from "@chakra-ui/react";

export interface HeaderContentProps {
  titleName: string;
  breadCrumb: string[];
}

export function HeaderContent({ titleName, breadCrumb }: HeaderContentProps) {
  return (
    <Grid templateColumns="repeat(2, 1fr)" px={3} pb={5}>
      <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}>
        <Flex w={"full"} justifyContent={"start"} alignItems={"center"}>
          <Heading as="h3" size="lg">
            {titleName.toLocaleUpperCase()}
          </Heading>
        </Flex>
      </GridItem>
      <GridItem colSpan={{ base: 2, sm: 2, md: 1, lg: 1 }}>
        <Flex w={"full"} justifyContent={"end"} alignItems={"center"}>
          <Breadcrumb p="2">
            {breadCrumb.map((item: string) => {
              return (
                <BreadcrumbItem key={item}>
                  <BreadcrumbLink href="#">{item}</BreadcrumbLink>
                </BreadcrumbItem>
              );
            })}
          </Breadcrumb>
        </Flex>
      </GridItem>
    </Grid>
  );
}
