"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  radiusStyle,
  RES_CODE_OK,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useMenus, { MenuResponse } from "@/app/services/useMenus";
import { LinkItems } from "@/app/constants/menuApplication";
import { getIconComponent } from "@/app/utils/iconRegistry";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  HStack,
  Stack,
  Text,
  useColorMode,
  VStack,
  Badge,
  Icon,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiRefreshCcw,
} from "react-icons/fi";

const HeaderDataContent: HeaderContentProps = {
  titleName: "Master Menu",
  breadCrumb: ["Home", "Master Data", "Menus"],
};

interface MenuTreeItem extends MenuResponse {
  children?: MenuTreeItem[];
}

function MenusManagementPage() {
  const showToast = useToastHelper();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const [HeaderContentState] = useState<HeaderContentProps>(HeaderDataContent);
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  const { List, SynchronizeMenus } = useMenus();

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null && storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse =
        StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);

  const [IsLoadingPage, setIsLoadingPage] = useState(true);
  const [DataMenus, setDataMenus] = useState<MenuResponse[]>([]);
  const [MenuTree, setMenuTree] = useState<MenuTreeItem[]>([]);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsSynchronizing, setIsSynchronizing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [showTechnicalInfo, setShowTechnicalInfo] = useState(false);

  const RefreshAction = () => {
    setDataMenus([]);
    setMenuTree([]);
    setRefreshData(RefreshData + 1);
  };

  const toggleExpand = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleSynchronize = async () => {
    setIsSynchronizing(true);

    try {
      let menuCodeCounter = 1;
      const buildMenuHierarchy = (items: typeof LinkItems): any[] => {
        return items.map((item, index) => {
          const menuCode = item.menuID && item.menuID !== "1" 
            ? item.menuID 
            : `MN${String(menuCodeCounter++).padStart(4, "0")}`;
          
          // Extract icon name from component
          let iconName = "FiCircle";
          if (typeof item.icon === "string") {
            iconName = item.icon;
          } else if (typeof item.icon === "function") {
            iconName = item.icon.name || "FiCircle";
          }
          
          return {
            menuCode: menuCode,
            menuName: item.name,
            menuDesc: null,
            menuIcon: iconName,
            menuLink: item.link,
            parentMenuLink: null,
            isPro: item.isPro ? "Y" : "N",
            isOperations: "N",
            menuPos: index + 1,
            children: item.children && item.children.length > 0 
              ? buildMenuHierarchy(item.children) 
              : []
          };
        });
      };

      const payload = {
        menus: buildMenuHierarchy(LinkItems)
      };

      const result = await SynchronizeMenus(payload, tokenData);

      if (result?.statusCode === RES_CODE_OK) {
        toast({
          title: "Success",
          description: result.message || "Menus synchronized successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        RefreshAction();
      } else {
        toast({
          title: "Failed",
          description: result?.message || "Failed to synchronize menus",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during synchronization",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSynchronizing(false);
    }
  };

  useEffect(() => {
    const LoadData = async () => {
      if (tokenData) {
        setIsLoadingPage(true);
        const payload = {
          search: "",
          limit: 0,
          page: 0,
          filterWhere: [],
          fieldOrder: ["menuPos"],
          orderDir: "asc" as "asc" | "desc",
        };

        const result = await List(payload, tokenData);
        if (result?.statusCode === RES_CODE_OK && result.data) {
          setDataMenus(result.data);
          const tree = buildMenuTree(result.data);
          setMenuTree(tree);
        }
        setIsLoadingPage(false);
      }
    };

    LoadData();
  }, [tokenData, RefreshData]);

  const buildMenuTree = (menus: MenuResponse[]): MenuTreeItem[] => {
    const menuMap = new Map<string, MenuTreeItem>();
    const rootMenus: MenuTreeItem[] = [];

    menus.forEach((menu) => {
      menuMap.set(menu.id, { ...menu, children: [] });
    });

    menus.forEach((menu) => {
      const menuItem = menuMap.get(menu.id)!;
      if (menu.parentId) {
        const parent = menuMap.get(menu.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        }
      } else {
        rootMenus.push(menuItem);
      }
    });

    const sortByMenuPos = (items: MenuTreeItem[]) => {
      items.sort((a, b) => (a.menuPos || 0) - (b.menuPos || 0));
      items.forEach((item) => {
        if (item.children && item.children.length > 0) {
          sortByMenuPos(item.children);
        }
      });
    };

    sortByMenuPos(rootMenus);
    return rootMenus;
  };

  const renderMenuItem = (item: MenuTreeItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const IconComp = getIconComponent(item.menuIcon);

    return (
      <Box key={item.id} ml={level * 6}>
        <Flex
          p={3}
          bg={colorMode === "light" ? "gray.50" : "gray.700"}
          rounded="md"
          mb={2}
          alignItems="center"
          gap={3}
        >
          {hasChildren && (
            <Icon
              as={isExpanded ? FiChevronDown : FiChevronRight}
              cursor="pointer"
              onClick={() => toggleExpand(item.id)}
            />
          )}
          {!hasChildren && <Box w={4} />}

          {IconComp && <Icon as={IconComp} />}

          <VStack align="start" spacing={0} flex={1}>
            <HStack>
              <Text fontWeight="bold">{item.menuName}</Text>
              {item.isPro === "Y" && (
                <Badge colorScheme="purple" fontSize="xs">
                  PRO
                </Badge>
              )}
              {item.isDisable === "1" && (
                <Badge colorScheme="red" fontSize="xs">
                  DISABLED
                </Badge>
              )}
              {item.isHide === "1" && (
                <Badge colorScheme="orange" fontSize="xs">
                  HIDDEN
                </Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.500">
              {item.menuLink}
            </Text>
            {item.menuDesc && (
              <Text fontSize="xs" color="gray.400">
                {item.menuDesc}
              </Text>
            )}
          </VStack>

          <Badge colorScheme="blue">{item.menuCode}</Badge>
          <Badge colorScheme="green">Pos: {item.menuPos}</Badge>
        </Flex>

        {hasChildren && isExpanded && (
          <Box>
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  if (IsLoadingPage) {
    return (
      <LayoutAdmin>
        <HeaderContent
          titleName={HeaderContentState.titleName}
          breadCrumb={HeaderContentState.breadCrumb}
        />
        <LoadingMiniSignature />
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent
        titleName={HeaderContentState.titleName}
        breadCrumb={HeaderContentState.breadCrumb}
      />

      <Card
        w="full"
        rounded={radiusStyle}
        bgColor={colorMode === "light" ? "white" : "gray.800"}
      >
        <CardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Heading as="h5" size="md">
              Menu Management
            </Heading>
            <HStack>
              <Button
                leftIcon={<FiRefreshCcw />}
                onClick={RefreshAction}
                size="sm"
              >
                Refresh
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSynchronize}
                isLoading={IsSynchronizing}
                loadingText="Synchronizing..."
                size="sm"
              >
                Synchronize Menus
              </Button>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody>
          <Alert status="info" mb={4} rounded="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Read-Only View</AlertTitle>
              <AlertDescription>
                This page displays the current menu structure. Use the "Synchronize Menus" button to sync with the frontend menu constants.
              </AlertDescription>
            </Box>
          </Alert>

          <VStack align="stretch" spacing={2}>
            {MenuTree.length > 0 ? (
              MenuTree.map((item) => renderMenuItem(item))
            ) : (
              <Text color="gray.500" textAlign="center" py={8}>
                No menus found. Click "Synchronize Menus" to import from constants.
              </Text>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Technical Information Section */}
      <Card
        w={"full"}
        rounded={radiusStyle}
        bgColor={colorMode === "light" ? "white" : "gray.800"}
        mt={5}
      >
        <CardHeader
          cursor="pointer"
          onClick={() => setShowTechnicalInfo(!showTechnicalInfo)}
          _hover={{ bg: colorMode === "light" ? "gray.50" : "gray.700" }}
        >
          <HStack justify="space-between">
            <Heading as="h5" size="md">
              Technical Information - How to Add New Icons
            </Heading>
            <Icon
              as={showTechnicalInfo ? FiChevronDown : FiChevronRight}
              boxSize={5}
            />
          </HStack>
        </CardHeader>
        {showTechnicalInfo && (
          <CardBody pt={0}>
            <VStack align="stretch" spacing={4}>
              <Alert status="info" rounded="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Icon Registry System</AlertTitle>
                  <AlertDescription fontSize="xs">
                    Icons are stored as strings in the database and converted to React components at runtime using the Icon Registry.
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Step 1: Find Your Icon
                </Text>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Visit{" "}
                  <Text
                    as="a"
                    href="https://react-icons.github.io/react-icons"
                    target="_blank"
                    color="blue.500"
                    textDecoration="underline"
                  >
                    react-icons.github.io/react-icons
                  </Text>{" "}
                  and search for your icon.
                </Text>
                <Text fontSize="sm" color="gray.600">
                  Example: <Badge>FiFolder</Badge> from Feather Icons
                </Text>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Step 2: Add to Icon Registry
                </Text>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  Open <Badge>/src/app/utils/iconRegistry.ts</Badge>
                </Text>
                
                <Text fontSize="sm" fontWeight="semibold" mt={3} mb={1}>
                  A. Add to imports:
                </Text>
                <Box
                  bg={colorMode === "light" ? "gray.100" : "gray.900"}
                  p={3}
                  rounded="md"
                  fontSize="xs"
                  fontFamily="mono"
                  overflowX="auto"
                >
                  <Text color="gray.500">// Feather Icons</Text>
                  <Text>
                    <Text as="span" color="purple.500">import</Text>{" "}
                    {"{"}
                  </Text>
                  <Text pl={4}>FiAward,</Text>
                  <Text pl={4}>FiCircle,</Text>
                  <Text pl={4}>FiDatabase,</Text>
                  <Text pl={4} color="green.500">
                    FiFolder, {" // ← Add new icon here"}
                  </Text>
                  <Text pl={4}>FiKey,</Text>
                  <Text pl={4}>{"// ..."}</Text>
                  <Text>
                    {"}"} <Text as="span" color="purple.500">from</Text>{" "}
                    <Text as="span" color="orange.500">"react-icons/fi"</Text>;
                  </Text>
                </Box>

                <Text fontSize="sm" fontWeight="semibold" mt={3} mb={1}>
                  B. Add to registry object:
                </Text>
                <Box
                  bg={colorMode === "light" ? "gray.100" : "gray.900"}
                  p={3}
                  rounded="md"
                  fontSize="xs"
                  fontFamily="mono"
                  overflowX="auto"
                >
                  <Text>
                    <Text as="span" color="purple.500">const</Text> iconRegistry: Record{"<"}string, IconType{">"} = {"{"}
                  </Text>
                  <Text pl={4} color="gray.500">
                    // Feather Icons (Fi)
                  </Text>
                  <Text pl={4}>FiAward,</Text>
                  <Text pl={4}>FiCircle,</Text>
                  <Text pl={4}>FiDatabase,</Text>
                  <Text pl={4} color="green.500">
                    FiFolder, {" // ← Add new icon here"}
                  </Text>
                  <Text pl={4}>FiKey,</Text>
                  <Text pl={4}>{"// ..."}</Text>
                  <Text>{"}"}</Text>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Step 3: Use in Menu
                </Text>
                <Text fontSize="sm" color="gray.600" mb={2}>
                  When creating or editing a menu, set the icon field to the exact icon name:
                </Text>
                <Box
                  bg={colorMode === "light" ? "gray.100" : "gray.900"}
                  p={3}
                  rounded="md"
                  fontSize="xs"
                  fontFamily="mono"
                >
                  <Text>menuIcon: <Text as="span" color="orange.500">"FiFolder"</Text></Text>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Step 4: Rebuild Application
                </Text>
                <Box
                  bg={colorMode === "light" ? "gray.100" : "gray.900"}
                  p={3}
                  rounded="md"
                  fontSize="xs"
                  fontFamily="mono"
                >
                  <Text>npm run build</Text>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="bold" mb={2}>
                  Supported Icon Libraries
                </Text>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={2}>
                  <Badge colorScheme="blue">Fi - Feather</Badge>
                  <Badge colorScheme="purple">Tb - Tabler</Badge>
                  <Badge colorScheme="green">Md - Material</Badge>
                  <Badge colorScheme="orange">Bs - Bootstrap</Badge>
                  <Badge colorScheme="red">Fa - Font Awesome</Badge>
                  <Badge colorScheme="pink">Hi - Heroicons</Badge>
                  <Badge colorScheme="cyan">Io5 - Ionicons</Badge>
                  <Badge colorScheme="teal">Ri - Remix</Badge>
                </SimpleGrid>
                <Text fontSize="xs" color="gray.500" mt={2}>
                  And 12 more libraries. See full documentation for complete list.
                </Text>
              </Box>

              <Alert status="warning" rounded="md">
                <AlertIcon />
                <Box>
                  <AlertTitle fontSize="sm">Important Notes</AlertTitle>
                  <AlertDescription fontSize="xs">
                    <VStack align="start" spacing={1}>
                      <Text>• Icon names are case-sensitive (use exact name from react-icons)</Text>
                      <Text>• Missing icons will fallback to FiCircle with a console warning</Text>
                      <Text>• Application rebuild is required after adding new icons</Text>
                      <Text>• Only add icons that are actually used to maintain small bundle size</Text>
                    </VStack>
                  </AlertDescription>
                </Box>
              </Alert>

              <Box>
                <Text fontSize="sm" color="gray.600">
                  For complete documentation, see:{" "}
                  <Badge>/docs/ICON_REGISTRY.md</Badge>
                </Text>
              </Box>
            </VStack>
          </CardBody>
        )}
      </Card>
    </LayoutAdmin>
  );
}

export default MenusManagementPage;
