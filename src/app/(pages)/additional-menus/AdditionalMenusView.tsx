"use client";

import LayoutAdmin from "@/app/components/layoutAdmin";
import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { getIconComponent } from "@/app/utils/iconRegistry";
import { UserMenuResponse } from "@/app/services/useSysModuleGroup";
import {
  Box,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Text,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FiGrid, FiSearch } from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Menu Lainnya",
  breadCrumb: ["Home", "Menu Lainnya"],
};

interface MenuGroup {
  parentId: string | null;
  parentName: string;
  parentIcon: string;
  menus: UserMenuResponse[];
}

const AdditionalMenusView = () => {
  const { colorMode } = useColorMode();
  const router = useRouter();
  const [menuGroups, setMenuGroups] = useState<MenuGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [totalMenuCount, setTotalMenuCount] = useState<number>(0);

  useEffect(() => {
    try {
      const accessDataStr = localStorage.getItem("accessData");
      if (!accessDataStr) return;

      const accessData = JSON.parse(accessDataStr);
      const allMenus: UserMenuResponse[] = accessData.accessibleMenus || [];

      // Flatten all menus
      const flatMenus: UserMenuResponse[] = [];
      const flattenMenus = (menus: UserMenuResponse[]) => {
        menus.forEach((menu) => {
          flatMenus.push(menu);
          if (menu.children && menu.children.length > 0) {
            flattenMenus(menu.children);
          }
        });
      };
      flattenMenus(allMenus);

      // Filter menus where isDisplaySidebar is NOT "Y"
      const hiddenMenus = flatMenus.filter(
        (m) => m.isDisplaySidebar !== "Y"
      );

      setTotalMenuCount(hiddenMenus.length);

      // Group by parent
      const parentMap = new Map<string, MenuGroup>();

      hiddenMenus.forEach((menu) => {
        const parentId = menu.parentId || "__root__";

        if (!parentMap.has(parentId)) {
          const parent = flatMenus.find((m) => m.id === menu.parentId);
          parentMap.set(parentId, {
            parentId: menu.parentId || null,
            parentName: parent?.menuName || "Menu Umum",
            parentIcon: parent?.menuIcon || "FiGrid",
            menus: [],
          });
        }

        parentMap.get(parentId)!.menus.push(menu);
      });

      setMenuGroups(Array.from(parentMap.values()));
    } catch (error) {
      console.error("Failed to parse menu data:", error);
    }
  }, []);

  // Filtered groups based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return menuGroups;

    const query = searchQuery.toLowerCase();
    return menuGroups
      .map((group) => ({
        ...group,
        menus: group.menus.filter((m) =>
          m.menuName.toLowerCase().includes(query)
        ),
      }))
      .filter((group) => group.menus.length > 0);
  }, [menuGroups, searchQuery]);

  const handleNavigate = (link: string) => {
    if (link && link !== "#") {
      router.push(link);
    }
  };

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderDataContent.titleName}
        breadCrumb={HeaderDataContent.breadCrumb}
      />

      <Stack spacing={6}>
        {/* Hero Header */}
        <Box
          rounded={radiusStyle}
          overflow="hidden"
          border="1px"
          borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        >
          <Box
            bgGradient="linear(135deg, blue.500, blue.700, purple.600)"
            position="relative"
            p={8}
            _before={{
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgGradient:
                "linear(45deg, transparent 30%, whiteAlpha.100 50%, transparent 70%)",
            }}
          >
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={4}
              position="relative"
              zIndex={1}
            >
              <HStack spacing={4}>
                <Flex
                  align="center"
                  justify="center"
                  w="56px"
                  h="56px"
                  rounded="xl"
                  bg="whiteAlpha.200"
                  border="2px solid"
                  borderColor="whiteAlpha.300"
                >
                  <Icon as={FiGrid} boxSize={7} color="white" />
                </Flex>
                <VStack align="start" spacing={1}>
                  <Heading size="lg" fontWeight="700" color="white">
                    Menu Lainnya
                  </Heading>
                  <Text fontSize="sm" color="whiteAlpha.800">
                    {totalMenuCount} menu tersedia
                  </Text>
                </VStack>
              </HStack>

              {/* Search */}
              <InputGroup maxW="320px">
                <InputLeftElement pointerEvents="none" h="full">
                  <Icon as={FiSearch} color="whiteAlpha.700" />
                </InputLeftElement>
                <Input
                  placeholder="Cari menu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg="whiteAlpha.200"
                  border="1px solid"
                  borderColor="whiteAlpha.300"
                  color="white"
                  rounded="xl"
                  _placeholder={{ color: "whiteAlpha.600" }}
                  _hover={{ borderColor: "whiteAlpha.500" }}
                  _focus={{
                    borderColor: "whiteAlpha.600",
                    bg: "whiteAlpha.300",
                    boxShadow: "none",
                  }}
                />
              </InputGroup>
            </Flex>
          </Box>
        </Box>

        {/* Menu Content */}
        {filteredGroups.length === 0 ? (
          <Flex
            justify="center"
            align="center"
            minH="200px"
            direction="column"
            gap={4}
            p={8}
            rounded={radiusStyle}
            border="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
            bg={colorMode === "light" ? "white" : "gray.800"}
          >
            <Icon as={FiGrid} boxSize={10} color="gray.400" />
            <Text fontSize="md" color="gray.500">
              {searchQuery
                ? "Tidak ditemukan menu yang sesuai"
                : "Tidak ada menu tambahan tersedia"}
            </Text>
          </Flex>
        ) : (
          <>
            {/* Root menus (Menu Umum) - displayed as anchor jump buttons */}
            {filteredGroups.some((g) => g.parentId === null) && (
              <Box
                rounded={radiusStyle}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                p={4}
              >
                <Text fontSize="xs" fontWeight="600" color="gray.500" textTransform="uppercase" letterSpacing="wider" mb={3}>
                  Pintasan Menu
                </Text>
                <Flex wrap="wrap" gap={2}>
                  {filteredGroups
                    .filter((g) => g.parentId !== null)
                    .map((group, idx) => (
                      <Box
                        key={idx}
                        px={3}
                        py={1.5}
                        rounded="full"
                        bg={colorMode === "light" ? "secondary.50" : "secondary.900"}
                        border="1px solid"
                        borderColor={colorMode === "light" ? "secondary.200" : "secondary.700"}
                        cursor="pointer"
                        transition="all 0.2s"
                        _hover={{
                          bg: colorMode === "light" ? "secondary.100" : "secondary.800",
                          borderColor: "secondary.400",
                          transform: "translateY(-1px)",
                        }}
                        onClick={() => {
                          const el = document.getElementById(`menu-section-${idx}`);
                          if (el) {
                            el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                      >
                        <HStack spacing={2}>
                          <Icon
                            as={getIconComponent(group.parentIcon)}
                            boxSize={3.5}
                            color={colorMode === "light" ? "secondary.600" : "secondary.300"}
                          />
                          <Text
                            fontSize="xs"
                            fontWeight="500"
                            color={colorMode === "light" ? "secondary.700" : "secondary.200"}
                          >
                            {group.parentName}
                          </Text>
                        </HStack>
                      </Box>
                    ))}
                </Flex>
              </Box>
            )}

            {/* Grouped menus (with parent) - full panel display */}
            {filteredGroups
              .filter((g) => g.parentId !== null)
              .map((group, groupIndex) => (
              <Box
                key={groupIndex}
                id={`menu-section-${groupIndex}`}
                rounded={radiusStyle}
                border="1px"
                borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
                bg={colorMode === "light" ? "white" : "gray.800"}
                overflow="hidden"
                scrollMarginTop="80px"
              >
                {/* Section Header */}
                <Box p={5}>
                  <HStack spacing={3}>
                    <Flex
                      align="center"
                      justify="center"
                      w="36px"
                      h="36px"
                      rounded="lg"
                      bg={colorMode === "light" ? "blue.50" : "blue.900"}
                    >
                      <Icon
                        as={getIconComponent(group.parentIcon)}
                        color={colorMode === "light" ? "blue.500" : "blue.300"}
                        boxSize={4}
                      />
                    </Flex>
                    <VStack align="start" spacing={0}>
                      <Text
                        fontWeight="600"
                        fontSize="md"
                        color={colorMode === "light" ? "gray.800" : "gray.100"}
                      >
                        {group.parentName}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {group.menus.length} menu
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

                {/* Menu Grid */}
                <Box p={5}>
                  <Grid
                    templateColumns={{
                      base: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                      md: "repeat(3, 1fr)",
                      lg: "repeat(4, 1fr)",
                    }}
                    gap={4}
                  >
                    {group.menus.map((menu, menuIndex) => (
                      <GridItem key={menuIndex}>
                        <Box
                          p={4}
                          rounded={radiusStyle}
                          border="1px solid"
                          borderColor={
                            colorMode === "light" ? "gray.100" : "gray.600"
                          }
                          bg={colorMode === "light" ? "gray.50" : "gray.750"}
                          cursor="pointer"
                          transition="all 0.2s"
                          _hover={{
                            borderColor: "blue.400",
                            shadow: "sm",
                            transform: "translateY(-1px)",
                            bg:
                              colorMode === "light" ? "blue.50" : "gray.700",
                          }}
                          onClick={() => handleNavigate(menu.menuLink)}
                        >
                          <HStack spacing={3}>
                            <Flex
                              align="center"
                              justify="center"
                              w="38px"
                              h="38px"
                              rounded="lg"
                              bg={
                                colorMode === "light"
                                  ? "white"
                                  : "gray.600"
                              }
                              border="1px solid"
                              borderColor={
                                colorMode === "light"
                                  ? "gray.200"
                                  : "gray.500"
                              }
                              flexShrink={0}
                            >
                              <Icon
                                as={getIconComponent(menu.menuIcon)}
                                boxSize={4}
                                color={
                                  colorMode === "light"
                                    ? "blue.500"
                                    : "blue.300"
                                }
                              />
                            </Flex>
                            <Text
                              fontSize="sm"
                              fontWeight="500"
                              color={
                                colorMode === "light"
                                  ? "gray.700"
                                  : "gray.200"
                              }
                              noOfLines={2}
                            >
                              {menu.menuName}
                            </Text>
                          </HStack>
                        </Box>
                      </GridItem>
                    ))}
                  </Grid>
                </Box>
              </Box>
            ))}
          </>
        )}
      </Stack>
    </LayoutAdmin>
  );
};

export default AdditionalMenusView;
