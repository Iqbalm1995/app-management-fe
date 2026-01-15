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
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  FiChevronRight,
  FiChevronDown,
  FiRefreshCcw,
} from "react-icons/fi";
import * as FiIcons from "react-icons/fi";

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

  const getIconComponent = (iconName: string | null | undefined) => {
    if (!iconName) return null;
    const IconComponent = (FiIcons as any)[iconName];
    return IconComponent ? IconComponent : null;
  };

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

  const handleSynchronize = async () => {
    setIsSynchronizing(true);

    try {
      let menuCodeCounter = 1;
      const buildMenuHierarchy = (items: typeof LinkItems): any[] => {
        return items.map((item, index) => {
          const menuCode = item.menuID && item.menuID !== "1" 
            ? item.menuID 
            : `MN${String(menuCodeCounter++).padStart(4, "0")}`;
          
          return {
            menuCode: menuCode,
            menuName: item.name,
            menuDesc: null,
            menuIcon: typeof item.icon === "string" ? item.icon : (item.icon?.name || "FiCircle"),
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
    </LayoutAdmin>
  );
}

export default MenusManagementPage;
