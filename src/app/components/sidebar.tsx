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
} from "react-icons/fi";
import { IconType } from "react-icons";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  useToastHelper,
  useToastHelperShort,
} from "../helper/ToastMessagesHelper";
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "../utils/localStorageUtils";
import { useAuth } from "../context/AuthContext";
import {
  DELAY_ZERO,
  LINK_MENU_ROOT,
  radiusStyle,
  WIDTH_SIDEBAR,
} from "../constants/applicationConstants";
import { RiMenu2Line } from "react-icons/ri";
import { LogoApplications, LogoApplicationsLite } from "./logoApps";
import { truncateToTwoWords } from "../helper/MasterHelper";
import {
  FaPowerOff,
  FaRegFolderOpen,
  FaUserPlus,
  FaUsersGear,
  FaUsersRays,
} from "react-icons/fa6";
import { FooterAdminPanel } from "./layoutLanding";
import SignatureLineColor from "./signatureStyle";
import { BsKanban } from "react-icons/bs";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { MdOutlinePermMedia } from "react-icons/md";
import { usePathname } from "next/navigation";
import { AuthDataResponse } from "../services/useAuthentications";
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
}

const LinkItems: LinkItemProps[] = [
  {
    name: "Home",
    icon: FiHome,
    link: "/home",
    role: ["admin"],
    menuID: "1",
    children: [],
  },
  {
    name: "User Config",
    icon: FaUsersGear,
    link: "/users",
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "User Manager",
        icon: FaUserPlus,
        link: "/users",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Master Role Sys",
        icon: FaUsersRays,
        link: "/users/roles",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Example Page",
    icon: FaRegFolderOpen,
    link: "#",
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "Kanban",
        icon: BsKanban,
        link: "/kanban",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Calendar",
        icon: IoCalendarNumberOutline,
        link: "/calendar",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Drop Zone",
        icon: MdOutlinePermMedia,
        link: "/dropzone",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "User",
        icon: FiUser,
        link: "/users",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Settings",
        icon: FiSettings,
        link: "/settings",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
];

export default function NavigationAdmin({ children }: { children: ReactNode }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [LiteMode, setLiteMode] = useState<boolean>(false);
  const { isAuthenticated, authData, goLogout } = useAuth();
  const [LoadingProcess, setLoadingProcess] = useState<boolean>(false);
  const { colorMode, toggleColorMode } = useColorMode();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  useEffect(() => {
    if (authData.dataLogin != null) {
      const authGet: AuthDataResponse = authData.dataLogin as AuthDataResponse;
      setDataAuth(authGet);
    }
  }, [authData]);

  useEffect(() => {
    // Retrieve the value from local storage when the component mounts
    const savedLiteMode = getFromLocalStorage("LiteMode");
    if (savedLiteMode !== null) {
      setLiteMode(savedLiteMode);
    }
  }, []);

  const toggleLiteMode = () => {
    const newValue = !LiteMode;
    setLiteMode(newValue);
    saveToLocalStorage("LiteMode", newValue);
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
          transition="0.2s ease"
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
            transition="0.2s ease"
            height="20"
            alignItems="center"
            backdropFilter={"blur(20px)"} // Apply Gaussian blur in light mode
            justifyContent={{ base: "space-between", md: "flex-end" }}
            backgroundPosition="left"
            backgroundRepeat="no-repeat"
            backgroundSize="gray.900"
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
                        name={DataAuth ? DataAuth.firstName : ""}
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
                        label={DataAuth ? DataAuth.firstName : ""}
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
                            {truncateToTwoWords(
                              DataAuth ? DataAuth.firstName : ""
                            )}
                          </Text>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.600", "gray.100")}
                          >
                            {(DataAuth && DataAuth.teamRole?.teamRoleName) ||
                              (DataAuth && DataAuth.role.roleName)}
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
                maxW={"8xl"}
                px={{ base: 5, sm: 5, md: 12, lg: 12 }}
                pb={12}
                pt={2}
                minH={"100vh"}
              >
                <Stack>
                  {/* <Alert
                    status="warning"
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    height="200px"
                    borderRadius={"20px"}
                    boxShadow={"md"}
                  >
                    <AlertIcon boxSize="40px" mr={0} />
                    <AlertTitle mt={4} mb={1} fontSize="lg">
                      {TextContent[lang].alertResetPassTittle}
                    </AlertTitle>
                    <AlertDescription maxWidth="sm">
                      {TextContent[lang].alertResetPassDesc}
                    </AlertDescription>
                  </Alert> */}
                  <>{children}</>
                </Stack>
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
      p={2}
      w={{ base: "full", md: LiteModeTrigger ? "95px" : WIDTH_SIDEBAR }}
      minH={"85vh"}
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

        <Flex pt={5} pb={2} mx={3} h={"full"}>
          <VStack w={"full"} h={"80%"} align={"start"}>
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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const [IsActiveNav, setIsActiveNav] = useState(false);

  useEffect(() => {
    // Split the pathname by "/" and get the first segment
    const firstSegment = pathname.split("/")[1];
    const currentPath = pathname;
    if (firstSegment === data.link.split("/")[1]) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }

    if (currentPath === data.link && data.children.length <= 0) {
      setIsActiveNav(true);
    } else {
      setIsActiveNav(false);
    }
  }, [pathname]);

  return (
    <Box w={"full"}>
      <Link href={data.children.length == 0 ? data.link : "#"}>
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
            boxShadow={IsActiveNav ? "md" : "none"}
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
                : "linear(to-r, transparent, transparent)"
            }
            color={
              IsActiveNav
                ? "white" // When the navigation item is active, set color to white
                : useColorModeValue("gray.900", "gray.100") // Otherwise, set color based on the color mode
            }
            justifyContent={"center"}
            // onClick={() => {
            //   GoNavigationLink();
            // }}
            onClick={hasChildren ? handleToggle : undefined}
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
                  mr={mode ? "0" : "6"}
                  fontSize={mode ? "25" : "20"}
                  _groupHover={{
                    color: "white",
                  }}
                  color={
                    IsActiveNav
                      ? "white"
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
              >
                <Text>{data.name}</Text>
                {hasChildren && (
                  <Icon
                    ml="auto"
                    as={isOpen ? ChevronDownIcon : ChevronRightIcon}
                  />
                )}
              </Flex>
            </Flex>
          </Flex>
        </Tooltip>
      </Link>
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
  const [show, setShow] = React.useState(false);
  const showToast = useToastHelperShort();
  const { isAuthenticated, authData, goLogout } = useAuth();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  useEffect(() => {
    if (authData.dataLogin != null) {
      const authGet: AuthDataResponse = authData.dataLogin as AuthDataResponse;
      setDataAuth(authGet);
    }
  }, [authData]);

  return (
    <>
      <Box
        bgGradient={
          LiteModeTrigger
            ? "linear(to-r, transparent, transparent)"
            : useColorModeValue(
                "linear(to-br, gray.100, gray.200)", // for light mode
                "linear(to-br, gray.700, gray.700)" // for dark mode
              )
        }
        color={useColorModeValue("gray.900", "white")}
        m={2}
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
              label={DataAuth && truncateToTwoWords(DataAuth.firstName)}
            >
              <Avatar
                size={"md"}
                color={"white"}
                name={
                  (DataAuth && truncateToTwoWords(DataAuth.firstName)) || ""
                }
                mr={LiteModeTrigger ? 0 : 2}
                bgGradient={
                  "linear(to-br, primary.500, secondary.500 40%, yellow.500)"
                }
                cursor={"pointer"}
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
                  color={useColorModeValue("gray.900", "white")}
                  fontSize={"smaller"}
                  fontWeight={700}
                >
                  {DataAuth && truncateToTwoWords(DataAuth.firstName)}
                </Text>
                <Text
                  fontSize="x-small"
                  color={useColorModeValue("primary.500", "primary.100")}
                >
                  {(DataAuth && DataAuth.teamRole?.teamRoleName) ||
                    (DataAuth && DataAuth.role.roleName)}
                </Text>
              </VStack>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
