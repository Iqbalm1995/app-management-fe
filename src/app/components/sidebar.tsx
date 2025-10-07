"use client";

import React, {
  ReactNode,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  IconButton,
  Avatar,
  Box,
  CloseButton,
  Flex,
  HStack,
  VStack,
  Icon,
  useColorModeValue,
  Drawer,
  DrawerContent,
  Text,
  useDisclosure,
  BoxProps,
  FlexProps,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  useColorMode,
  Image,
  Heading,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  FormLabel,
  SimpleGrid,
  Spacer,
  Tooltip,
  Table,
  Tr,
  Td,
  Tbody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  StackDivider,
  Stack,
  Container,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import {
  FiHome,
  FiMenu,
  FiBell,
  FiChevronDown,
  FiCircle,
  FiUsers,
  FiUser,
  FiHeart,
  FiPenTool,
  FiBox,
  FiPlay,
  FiSettings,
  FiPlayCircle,
  FiCode,
  FiDatabase,
  FiKey,
  FiDollarSign,
  FiZap,
} from "react-icons/fi";
import { IconType } from "react-icons";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  useToastHelper,
  useToastHelperShort,
} from "../helper/ToastMessagesHelper";
import { AuthDataModelInterface, useAuth } from "../context/AuthContext";
import {
  DELAY_ZERO,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  LINK_MENU_ROOT,
  radiusStyle,
  WIDTH_SIDEBAR,
} from "../constants/applicationConstants";
import { RiMenu2Line } from "react-icons/ri";
import { LogoApplications, LogoApplicationsLite } from "./logoApps";
import { buildUrlPort, truncateToTwoWords } from "../helper/MasterHelper";
import {
  FaChess,
  FaCode,
  FaDiagramProject,
  FaFire,
  FaFlipboard,
  FaPowerOff,
  FaRegFolderOpen,
  FaUserPlus,
  FaUsersGear,
  FaUsersRays,
} from "react-icons/fa6";
import { FooterAdminPanel } from "./layoutLanding";
import SignatureLineColor from "./signatureStyle";
import { BsCloudUpload, BsKanban, BsRocketTakeoff } from "react-icons/bs";
import { IoCalendarNumberOutline } from "react-icons/io5";
import {
  MdChangeHistory,
  MdGroupWork,
  MdOutlineChangeCircle,
  MdOutlineCircle,
  MdOutlinePermMedia,
} from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { AuthDataResponse } from "../services/useAuthentications";
import { BiSolidReport } from "react-icons/bi";
import { CiMemoPad, CiServer } from "react-icons/ci";
import { RxActivityLog } from "react-icons/rx";
import { TbContract, TbLayoutDashboardFilled } from "react-icons/tb";
import { FaDraftingCompass } from "react-icons/fa";
import { PiFlowArrow } from "react-icons/pi";
import { HiOutlineDesktopComputer } from "react-icons/hi";
// import { useAuth } from "@/context/AuthContext";

// Page Split
// const ProfileModal = React.lazy(
//   () => import("../_pieces/profile/Profile-modal")
// );

const MotionBox = motion(Box);

interface LinkItemProps {
  name: string;
  icon: IconType;
  link: string;
  role: string[];
  menuID: string;
  children: LinkItemProps[];
  isLocked?: boolean;
  isPro?: boolean;
}

const LinkItems: LinkItemProps[] = [
  {
    name: "Dashboard",
    icon: TbLayoutDashboardFilled,
    link: "/home",
    role: ["admin"],
    menuID: "1",
    children: [],
  },
  {
    name: "Workspace",
    icon: BsRocketTakeoff,
    link: "/workspace",
    role: ["admin"],
    menuID: "1",
    isPro: true,
    children: [
      {
        name: "My Project",
        icon: FaCode,
        link: "/project-development",
        role: ["admin"],
        menuID: "1",
        isPro: true,
        children: [],
      },
    ],
  },
  {
    name: "Requirements",
    icon: FaDraftingCompass,
    link: "/requirements",
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "BRD",
        icon: MdOutlineCircle,
        link: "/requirements/brd",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "RFC",
        icon: MdChangeHistory,
        link: "/requirements/rfc",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      // {
      //   name: "Pending Review",
      //   icon: MdOutlineCircle,
      //   link: "/requirements/pending-reviews",
      //   role: ["admin"],
      //   menuID: "1",
      //   children: [],
      // },
    ],
  },
  {
    name: "Projects",
    icon: FaDiagramProject,
    link: "/projects",
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "Internal Development",
        icon: FaCode,
        link: "/projects-manager",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Procurement",
        icon: TbContract,
        link: "/projects-procurements",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Deployment",
        icon: BsCloudUpload,
        link: "/projects-deployments",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
  // {
  //   name: "Reports",
  //   icon: BiSolidReport,
  //   link: "/reports",
  //   role: ["admin"],
  //   menuID: "1",
  //   children: [
  //     {
  //       name: "Project Reports",
  //       icon: BiSolidReport,
  //       link: "/reports/project",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //     {
  //       name: "Event Reports",
  //       icon: BiSolidReport,
  //       link: "/reports/project",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //   ],
  // },
  {
    name: "Team Manager",
    icon: FaChess,
    link: "/teams",
    role: ["admin"],
    menuID: "1",
    children: [],
  },
  // {
  //   name: "Server Manager",
  //   icon: CiServer,
  //   link: "/server-manager",
  //   role: ["admin"],
  //   menuID: "1",
  //   children: [],
  // },
  {
    name: "File Archive",
    icon: MdOutlinePermMedia,
    link: "/file-archives",
    role: ["admin"],
    menuID: "1",
    children: [],
  },
  {
    name: "Master Data",
    icon: FiDatabase,
    link: "/master-data",
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "Master Workflow",
        icon: PiFlowArrow,
        link: "/master-data/workflow",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Master Constant",
        icon: FiKey,
        link: "/master-data/constants-data",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Master Application",
        icon: HiOutlineDesktopComputer,
        link: "/master-data/Application",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
  // {
  //   name: "Pricing",
  //   icon: FiDollarSign,
  //   link: "/pricing",
  //   role: ["admin"],
  //   menuID: "1",
  //   children: [],
  //   isLocked: true,
  // },
  // {
  //   name: "Avtivities",
  //   icon: RxActivityLog,
  //   link: "/activities",
  //   role: ["admin"],
  //   menuID: "1",
  //   children: [],
  //   isLocked: true,
  // },
  // {
  //   name: "User Config",
  //   icon: FaUsersGear,
  //   link: "/users",
  //   role: ["admin"],
  //   menuID: "1",
  //   children: [
  //     {
  //       name: "User Manager",
  //       icon: FaUserPlus,
  //       link: "/users",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //     {
  //       name: "Master Role Sys",
  //       icon: FaUsersRays,
  //       link: "/users/roles",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //     {
  //       name: "Master Division",
  //       icon: FaFire,
  //       link: "/users/divisions",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //   ],
  // },
  // {
  //   name: "Example Page",
  //   icon: FaRegFolderOpen,
  //   link: "#",
  //   role: ["admin"],
  //   menuID: "1",
  //   children: [
  //     {
  //       name: "Kanban",
  //       icon: BsKanban,
  //       link: "/kanban",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //     {
  //       name: "Kanban Alt",
  //       icon: BsKanban,
  //       link: "/kanban-alt",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //     {
  //       name: "Calendar",
  //       icon: IoCalendarNumberOutline,
  //       link: "/calendar",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //     {
  //       name: "Drop Zone",
  //       icon: MdOutlinePermMedia,
  //       link: "/dropzone",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //     {
  //       name: "User",
  //       icon: FiUser,
  //       link: "/users",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //     {
  //       name: "Settings",
  //       icon: FiSettings,
  //       link: "/settings",
  //       role: ["admin"],
  //       menuID: "1",
  //       children: [],
  //     },
  //   ],
  // },
];

export default function NavigationAdmin({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [LiteMode, setLiteMode] = useState<boolean>(false);
  const { isAuthenticated, authData, goLogout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const pathname = usePathname();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  useEffect(() => {
    // Retrieve the value from local storage when the component mounts
    const savedLiteMode: boolean = localStorage.getItem("LiteMode") === "true";
    if (savedLiteMode !== null) {
      setLiteMode(savedLiteMode);
    }
  }, []);

  const toggleLiteMode = () => {
    const newValue = !LiteMode;
    setLiteMode(newValue);
    localStorage.setItem("LiteMode", newValue.toString());
  };

  const logoutAuthAction = async () => {
    // const response = await logout(LoginCorpID, LoginUserID, Logintoken);
    // await sendAudit({
    //   userId: userID,
    //   actionDetails: `Logout dari Backoffice Portal.`,
    // });
    setTimeout(() => {
      goLogout();
    }, DELAY_ZERO); // 2-second delay
  };

  const [scrollY, setScrollY] = useState(0);
  const handleScroll = () => {
    setScrollY(window.scrollY);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Box minH="100vh">
        <SidebarContent
          onClose={() => onClose}
          display={{ base: "none", md: "block" }}
          LiteModeTrigger={LiteMode}
        />
        <Drawer
          autoFocus={false}
          isOpen={isOpen}
          placement="left"
          onClose={onClose}
          returnFocusOnClose={false}
          onOverlayClick={onClose}
          size="md"
        >
          <DrawerContent>
            <SidebarContent onClose={onClose} LiteModeTrigger={false} />
          </DrawerContent>
        </Drawer>
        <Flex
          transition="0.5s ease"
          position="fixed"
          top={scrollY > 0 ? 2 : 0}
          left={0}
          right={0}
          zIndex={10}
          ml={{ base: 0, md: LiteMode ? "95px" : WIDTH_SIDEBAR }}
          px={scrollY > 0 ? 4 : 2}
        >
          {/* TOP NAV */}
          <Flex
            w={"full"}
            px={{ base: 4, md: 4 }}
            transition="0.5s ease"
            height="20"
            alignItems="center"
            backdropFilter={"blur(20px)"} // Apply Gaussian blur in light mode
            justifyContent={{ base: "space-between", md: "flex-end" }}
            backgroundPosition="left"
            backgroundRepeat="no-repeat"
            // backgroundSize="gray.900"
            color={"white"}
            boxShadow={scrollY > 0 ? "xl" : "none"}
            roundedTop={scrollY > 0 ? radiusStyle : 0}
            roundedBottom={radiusStyle}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              onClick={onOpen}
              variant="ghost"
              aria-label="open menu"
              icon={<FiMenu />}
            />

            <Box display={{ base: "none", md: "flex" }} w={"full"}>
              <IconButton
                onClick={toggleLiteMode}
                variant="ghost"
                colorScheme={"gray"}
                aria-label="lite mode"
                icon={<RiMenu2Line />}
                size={"lg"}
                // rounded={"xl"}
              />
            </Box>

            <Flex
              display={{ base: "flex", md: "none" }}
              justifyContent={"center"}
              w={"full"}
            >
              {LiteMode ? (
                <LogoApplicationsLite colorText="secondary.500" />
              ) : (
                <LogoApplications colorText="secondary.500" />
              )}
            </Flex>

            <HStack spacing={{ base: "2", md: "6" }}>
              <Flex alignItems={"start"}>
                <Button onClick={toggleColorMode} variant={"ghost"}>
                  {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                </Button>
                <Link href={LINK_MENU_ROOT}>
                  <Button
                    leftIcon={<FiPlay />}
                    mx={2}
                    colorScheme={"secondary"}
                    rounded={radiusStyle}
                  >
                    Landing Page
                  </Button>
                </Link>
              </Flex>

              <Flex alignItems={"center"}>
                <Menu>
                  <MenuButton
                    py={2}
                    transition="all 0.3s"
                    _focus={{ boxShadow: "none" }}
                  >
                    <HStack>
                      <Avatar
                        size={"sm"}
                        // src={"/img/default-user-img.jpg"}
                        color={"white"}
                        bgGradient={
                          "linear(to-br, primary.500, secondary.500 40%, yellow.500)"
                        }
                        name={DataAuth ? truncateToTwoWords(DataAuth.nama) : ""}
                        mr="2"
                      />
                      <Box
                        color={useColorModeValue("gray.800", "white")}
                        display={{ base: "none", md: "flex" }}
                      >
                        <FiChevronDown />
                      </Box>
                    </HStack>
                  </MenuButton>
                  <MenuList
                    bg={useColorModeValue("white", "gray.900")}
                    borderColor={useColorModeValue("gray.200", "gray.700")}
                    zIndex={2}
                    rounded={radiusStyle}
                  >
                    <MenuItem
                      bg={useColorModeValue("white", "gray.900")}
                      _hover={{
                        bg: useColorModeValue("gray.100", "gray.700"),
                        color: useColorModeValue("gray.900", "white"),
                      }}
                      rounded={radiusStyle}
                    >
                      <Tooltip
                        borderRadius={"xl"}
                        hasArrow
                        placement="left"
                        label={DataAuth ? DataAuth.nama : ""}
                      >
                        <VStack
                          w={"full"}
                          h={"full"}
                          spacing={1}
                          align={"start"}
                          p={1}
                        >
                          <Text
                            color={useColorModeValue(
                              "secondary.900",
                              "secondary.200"
                            )}
                            fontSize={"sm"}
                            fontWeight={700}
                          >
                            {truncateToTwoWords(DataAuth ? DataAuth.nama : "")}
                          </Text>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.600", "gray.100")}
                          >
                            {(DataAuth && DataAuth.teamRole?.specName) ||
                              (DataAuth && DataAuth.jabatan)}
                          </Text>
                        </VStack>
                      </Tooltip>
                    </MenuItem>
                    <MenuDivider />
                    {/* <Link href={"/"}> */}
                    <MenuItem
                      icon={<FaPowerOff />}
                      color={useColorModeValue("gray.800", "white")}
                      bg={useColorModeValue("white", "gray.900")}
                      _hover={{
                        bg: "red.600",
                        color: "white",
                      }}
                      onClick={() => {
                        logoutAuthAction();
                      }}
                      rounded={radiusStyle}
                    >
                      Keluar
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </HStack>
          </Flex>
        </Flex>
        <Box
          transition="0.5s ease"
          ml={{ base: 0, md: LiteMode ? "95px" : WIDTH_SIDEBAR }}
          pt={"65px"}
        >
          <Box minH={"100vh"}>
            <Box mx={"auto"}>
              <Container
                maxW={"9xl"}
                px={{ base: 2, sm: 2, md: 12, lg: 12 }}
                // px={0}
                pb={12}
                pt={5}
                minH={"100vh"}
                // bg={"blue.100"}
              >
                <AnimatePresence mode="wait">
                  <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeInOut",
                    }}
                    key={pathname} // Re-animate when route changes
                  >
                    {children}
                  </MotionBox>
                </AnimatePresence>
              </Container>
            </Box>
          </Box>
        </Box>
        <FooterAdminPanel />
        <SignatureLineColor />
      </Box>
    </>
  );
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
  LiteModeTrigger: boolean;
}

const SidebarContent = ({
  onClose,
  LiteModeTrigger,
  ...rest
}: SidebarProps) => {
  const [scrollY, setScrollY] = useState(0);
  const handleScroll = () => {
    setScrollY(window.scrollY);
  };
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <Box
      transition="0.5s ease"
      p={2}
      w={{ base: "full", md: LiteModeTrigger ? "95px" : WIDTH_SIDEBAR }}
      pos="fixed"
      {...rest}
    >
      <Box
        transition="0.5s ease"
        bg={useColorModeValue("white", "gray.800")}
        boxShadow={"lg"}
        // borderRight="1px"
        // borderRightColor={useColorModeValue("gray.200", "gray.700")}
        border="1px"
        borderColor={useColorModeValue("gray.200", "gray.700")}
        rounded={radiusStyle}
        minH={scrollY > 90 ? "85vh" : "97vh"}
        w={"full"}
      >
        <Flex h="20" alignItems="center" mx="5" justifyContent="space-between">
          {LiteModeTrigger ? (
            <LogoApplicationsLite colorText="secondary.500" />
          ) : (
            <LogoApplications colorText="secondary.500" />
          )}
          <CloseButton
            display={{ base: "flex", md: "none" }}
            onClick={onClose}
          />
        </Flex>

        <AdditionalProfileBar LiteModeTrigger={LiteModeTrigger} />

        <Flex pt={5} pb={2} mx={3}>
          <VStack w={"full"} h={"65vh"} align={"start"} overflowX="auto">
            <Heading pl={2} as="h6" size="xs">
              Menu
            </Heading>
            <Box w={"full"} overflowY={"auto"}>
              {LinkItems.map((link) => (
                <NavItem key={link.name} data={link} mode={LiteModeTrigger} />
              ))}
            </Box>
            <Spacer />
            {/* <AdditionalBarAdvertis /> */}
            {/* <AdditionalBarAlt /> */}
          </VStack>
        </Flex>
      </Box>
    </Box>
  );
};

const NavItem = ({ data, mode }: { data: LinkItemProps; mode: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = data.children && data.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const [IsActiveNav, setIsActiveNav] = useState(false);
  const [hasActiveChild, setHasActiveChild] = useState(false);

  useEffect(() => {
    const currentPath = pathname;

    // Check if current item is active
    const isCurrentActive =
      currentPath === data.link && data.children.length <= 0;
    setIsActiveNav(isCurrentActive);

    // Check if any child is active
    const checkActiveChild = (children: LinkItemProps[]): boolean => {
      return children.some((child) => {
        if (currentPath === child.link) return true;
        if (child.children && child.children.length > 0) {
          return checkActiveChild(child.children);
        }
        return false;
      });
    };

    const childActive = hasChildren && checkActiveChild(data.children);
    setHasActiveChild(childActive);

    // Auto-expand if current item is active or has active child
    if (isCurrentActive || childActive) {
      setIsOpen(true);
    } else {
      // Only close if no active children and not manually opened
      const firstSegment = pathname.split("/")[1];
      if (firstSegment !== data.link.split("/")[1]) {
        setIsOpen(false);
      }
    }

    // Reset loading state when pathname changes (navigation complete)
    setIsNavigating(false);
  }, [pathname, hasChildren, data.children, data.link]);

  const handleNavigation = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (hasChildren) {
      handleToggle();
      return;
    }

    // Don't navigate if already on the same page
    if (pathname === data.link) {
      return;
    }

    // Start loading
    setIsNavigating(true);

    try {
      // Navigate to the new page
      await router.push(data.link);
    } catch (error) {
      console.error("Navigation error:", error);
      setIsNavigating(false);
    }
  };
  return (
    <Box w={"full"}>
      <Box cursor="pointer">
        <Tooltip
          label={data.name}
          placement="right-end"
          visibility={mode ? "visible" : "hidden"}
        >
          <Flex
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            align="center"
            px="4"
            py="3"
            my="1"
            rounded={radiusStyle}
            role="group"
            cursor="pointer"
            boxShadow={IsActiveNav ? "md" : hasActiveChild ? "sm" : "none"}
            _hover={{
              color: "white",
              // bg: "secondary.500",
              bgGradient: "linear(to-r, secondary.500, secondary.600)", // Default gradient
              pl: mode ? "4" : "5",
              boxShadow: "md",
            }}
            // bg={IsActiveNav ? "secondary.500" : "transparent"}
            bgGradient={
              IsActiveNav
                ? "linear(to-r, secondary.500, secondary.600)"
                : hasActiveChild
                ? "linear(to-r, secondary.100, secondary.200)"
                : "linear(to-r, transparent, transparent)"
            }
            color={
              IsActiveNav
                ? "white" // When the navigation item is active, set color to white
                : hasActiveChild
                ? useColorModeValue("secondary.700", "secondary.300") // When has active child
                : useColorModeValue("gray.900", "gray.100") // Otherwise, set color based on the color mode
            }
            justifyContent={"center"}
            // onClick={() => {
            //   GoNavigationLink();
            // }}
            onClick={hasChildren ? handleToggle : undefined}
            as={hasChildren ? "div" : Link}
            {...(!hasChildren && { href: data.link })}
          >
            <Flex
              w={"full"}
              h={"full"}
              alignItems={"center"}
              transition={".2s ease"}
              transform={
                isHovered && !mode ? "translateX(10px)" : "translateY(0)"
              }
              justifyContent={"center"}
            >
              {data.icon && (
                <Icon
                  mr={mode ? "0" : data.isPro ? "2" : "4"}
                  fontSize={mode ? "25" : "20"}
                  _groupHover={{
                    color: "white",
                  }}
                  color={
                    IsActiveNav
                      ? "white"
                      : hasActiveChild
                      ? useColorModeValue("secondary.700", "secondary.300")
                      : useColorModeValue("gray.900", "gray.100")
                  }
                  as={data.icon}
                />
              )}
              <Flex
                w={"full"}
                h={"full"}
                alignItems={"center"}
                display={mode ? "none" : "flex"}
                as={HStack}
              >
                {data.isPro && <Badge colorScheme="purple">Pro</Badge>}
                <Text>{data.name}</Text>
                {hasChildren && (
                  <Icon
                    ml="auto"
                    as={isOpen ? ChevronDownIcon : ChevronRightIcon}
                  />
                )}
                {/* Loading Spinner */}
                {isNavigating && !hasChildren && (
                  <Spinner
                    size="sm"
                    ml="auto"
                    color={IsActiveNav ? "white" : "secondary.500"}
                  />
                )}
              </Flex>
            </Flex>
          </Flex>
        </Tooltip>
      </Box>
      {isOpen && hasChildren && (
        <MotionBox
          pl={3}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          overflow="hidden"
        >
          {data.children.map((child) => (
            <NavItem key={child.name} data={child} mode={mode} />
          ))}
        </MotionBox>
      )}
    </Box>
  );
};

function AdditionalBarAdvertis() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [show, setShow] = React.useState(false);
  const showToast = useToastHelperShort();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Box w={"full"}>
        <Flex
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          align="center"
          px="4"
          py="4"
          my="1"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          bgGradient={"linear(to-r, red.500, red.800)"}
          //   bg={"white"}
          color={"white"}
          justifyContent={"center"}
        >
          <Flex
            w={"full"}
            h={"full"}
            alignItems={"center"}
            transition={"all .25s ease-in-out"}
            justifyContent={"center"}
          >
            <Flex
              transition="0.5s ease-in-out"
              w={"full"}
              h={"full"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <Text>Some Text Here</Text>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}

function AdditionalBarAlt() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [show, setShow] = React.useState(false);
  const showToast = useToastHelperShort();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <Box w={"full"}>
        <Flex
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          align="center"
          px="4"
          py="4"
          my="1"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          color="gray.700"
          bgGradient={"linear(to-r, gray.200, gray.300)"}
          _hover={{
            // transition: "0.2s ease-in-out",
            bgGradient: "linear(to-r, red.500, red.600)",
            color: "white",
          }}
          boxShadow={"sm"}
          //   bg={"white"}
          justifyContent={"center"}
        >
          <Flex
            w={"full"}
            h={"full"}
            alignItems={"center"}
            transition={"all .25s ease-in-out"}
            justifyContent={"center"}
          >
            <Flex
              transition="0.5s ease-in-out"
              w={"full"}
              h={"full"}
              alignItems={"center"}
              justifyContent={"center"}
            >
              <FaPowerOff />
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}

function AdditionalProfileBar({
  LiteModeTrigger,
}: {
  LiteModeTrigger: boolean;
}) {
  const { authData, goLogout } = useAuth();
  const { colorMode } = useColorMode();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token: string = localStorage.getItem("tokenData") as string;

    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }

    if (token) {
      setTokenData(token);
    }
  }, [DataAuth]);
  // End SetUp auth data on current page

  return (
    <>
      <Flex w={"full"} as={Stack} spacing={0}>
        <Box
          // bgGradient={
          //   LiteModeTrigger
          //     ? "linear(to-r, transparent, transparent)"
          //     : colorMode == "light"
          //     ? "linear(to-r, gray.100, gray.100)" // for light mode
          //     : "linear(to-r, gray.700, gray.700)" // for dark mode
          // }
          bg={colorMode == "light" ? "gray.100" : "blackAlpha.500"}
          // backdropFilter={"blur(20px)"}
          color={colorMode == "light" ? "gray.900" : "white"}
          mx={2}
          mr={LiteModeTrigger ? 2 : 3}
          py={LiteModeTrigger ? 0 : 2}
          rounded={radiusStyle}
          transition="0.5s ease-in-out"
          // boxShadow={LiteModeTrigger ? "none" : "md"}
        >
          <Flex
            px={LiteModeTrigger ? 0 : 3}
            pt={3}
            pb={2}
            w={"full"}
            justifyContent={LiteModeTrigger ? "center" : "start"}
          >
            <Flex
              w={"full"}
              justifyContent={LiteModeTrigger ? "center" : "start"}
            >
              <Tooltip
                borderRadius={"xl"}
                hasArrow
                label={DataAuth && DataAuth.team?.teamName}
              >
                <Avatar
                  size={"md"}
                  color={"white"}
                  name={
                    (DataAuth &&
                      DataAuth.team &&
                      truncateToTwoWords(DataAuth.team.teamName)) ||
                    ""
                  }
                  mr={LiteModeTrigger ? 0 : 2}
                  cursor={"pointer"}
                  src={
                    (DataAuth &&
                      DataAuth.team &&
                      DataAuth.team.teamPict &&
                      buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) +
                        DataAuth.team.teamPict) ||
                    ""
                  }
                  boxShadow={"md"}
                />
              </Tooltip>
              <Flex
                w={"full"}
                h={"full"}
                alignItems={"center"}
                alignContent={"start"}
                display={LiteModeTrigger ? "none" : "flex"}
              >
                <VStack w={"full"} h={"full"} spacing={0} align={"start"} p={1}>
                  <Text
                    color={colorMode == "light" ? "gray.900" : "white"}
                    // color={"white"}
                    fontSize={"smaller"}
                    fontWeight={700}
                  >
                    {DataAuth && truncateToTwoWords(DataAuth.nama)}
                  </Text>
                  <Text
                    fontSize="x-small"
                    color={colorMode == "light" ? "primary.500" : "primary.100"}
                    // color={"secondary.200"}
                  >
                    {(DataAuth && DataAuth.teamRole?.specName) ||
                      (DataAuth && DataAuth.jabatan)}
                  </Text>
                </VStack>
              </Flex>
            </Flex>
          </Flex>
        </Box>
        {/* UPGRADE PLAN */}
        <Flex m={2} mr={LiteModeTrigger ? 2 : 3}>
          <Flex
            as={Button}
            w="full"
            size={LiteModeTrigger ? "sm" : "md"}
            bgGradient="linear(to-r, secondary.500, purple.500, pink.400)"
            color="white"
            rounded="xl"
            fontWeight="bold"
            fontSize={LiteModeTrigger ? "xs" : "sm"}
            _hover={{
              bgGradient: "linear(to-r, secondary.600, purple.600, pink.500)",
              transform: "translateY(-2px)",
              boxShadow: "xl",
            }}
            _active={{
              transform: "translateY(0px)",
            }}
            transition="all 0.2s"
            boxShadow="lg"
            leftIcon={LiteModeTrigger ? undefined : <FiZap />}
            onClick={() => (window.location.href = "/pricing")}
          >
            {LiteModeTrigger ? "⚡" : "Upgrade Plan"}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
