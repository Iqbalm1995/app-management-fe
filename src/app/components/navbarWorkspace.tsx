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
  Switch,
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
  FormControl,
  Divider,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  Portal,
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
  FiUpload,
  FiTruck,
  FiPackage,
  FiUmbrella,
  FiLayers,
  FiSearch,
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

const MotionBox = motion(Box);
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
import {
  RiApps2AiLine,
  RiCodeBlock,
  RiMegaphoneLine,
  RiMenu2Line,
  RiOrganizationChart,
} from "react-icons/ri";
import { LogoApplications, LogoApplicationsLite } from "./logoApps";
import { buildUrlPort, truncateToTwoWords } from "../helper/MasterHelper";
import {
  FaChess,
  FaCode,
  FaDiagramProject,
  FaFire,
  FaFlipboard,
  FaO,
  FaPowerOff,
  FaRegFolderOpen,
  FaUserPlus,
  FaUsersGear,
  FaUsersRays,
} from "react-icons/fa6";
import { FooterAdminPanel } from "./layoutLanding";
import SignatureLineColor from "./signatureStyle";
import {
  BsChatDots,
  BsCloudUpload,
  BsDatabaseGear,
  BsKanban,
  BsRocketTakeoff,
} from "react-icons/bs";
import {
  IoAppsOutline,
  IoCalendarNumberOutline,
  IoCalendarOutline,
  IoChatbubblesOutline,
  IoKeyOutline,
} from "react-icons/io5";
import {
  MdChangeHistory,
  MdGroupWork,
  MdOutlineChangeCircle,
  MdOutlineCircle,
  MdOutlineCode,
  MdOutlinePermMedia,
  MdOutlineSystemUpdateAlt,
  MdOutlineWorkOutline,
  MdWebAsset,
} from "react-icons/md";
import { usePathname, useRouter } from "next/navigation";
import { AuthDataResponse } from "../services/useAuthentications";
import useAuthentications from "../services/useAuthentications";
import { BiAnalyse, BiSolidReport } from "react-icons/bi";
import { CiMemoPad, CiMobile2, CiMoneyCheck1, CiServer } from "react-icons/ci";
import { RxActivityLog } from "react-icons/rx";
import {
  TbAdjustmentsCog,
  TbArrowsExchange,
  TbBellShare,
  TbBolt,
  TbCalendarTime,
  TbCategory,
  TbChartInfographic,
  TbClipboardList,
  TbClockExclamation,
  TbCode,
  TbContract,
  TbFileReport,
  TbFolders,
  TbHourglassHigh,
  TbLanguage,
  TbLayoutDashboardFilled,
  TbListDetails,
  TbMoodShare,
  TbNavigationShare,
  TbProgressCheck,
  TbServerCog,
  TbSettingsCog,
  TbShare,
  TbTimeline,
  TbUserBolt,
  TbUserHeart,
  TbUsers,
  TbUsersGroup,
  TbUserShare,
} from "react-icons/tb";
import {
  FaDraftingCompass,
  FaRegBell,
  FaRegHeart,
  FaRegStar,
  FaUser,
  FaVial,
} from "react-icons/fa";
import { PiCertificate, PiFlowArrow } from "react-icons/pi";
import {
  HiOutlineDesktopComputer,
  HiOutlineDocumentReport,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { LiaFileContractSolid } from "react-icons/lia";
import { AiOutlineVideoCamera, AiOutlineVideoCameraAdd } from "react-icons/ai";
import { ImUserTie } from "react-icons/im";
import { LuBookHeart, LuServer } from "react-icons/lu";
import { IoIosCodeDownload, IoMdBookmarks } from "react-icons/io";
import { GrHelpBook } from "react-icons/gr";
import { LinkItemProps, LinkItems } from "../constants/menuApplication";
import { AdditionalProfileBar, SearchMenuButton } from "./sidebar";
// import { useAuth } from "@/context/AuthContext";

// Page Split
// const ProfileModal = React.lazy(
//   () => import("../_pieces/profile/Profile-modal")
// );

export default function NavigationAdminWorkspace({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [LiteMode, setLiteMode] = useState<boolean>(false);
  const { isAuthenticated, authData, goLogout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const pathname = usePathname();
  const { Logout } = useAuthentications();
  const showToast = useToastHelper();

  // SetUp auth data on current page
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [hideProMenus, setHideProMenus] = useState<boolean>(false);

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
    try {
      if (DataAuth && tokenData) {
        const response = await Logout(DataAuth.userId, tokenData);

        if (response?.statusCode === 200) {
          showToast({
            description: "Logout successful",
            statusToast: "success",
          });
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
      showToast({
        description: "Logout failed, but you will be signed out",
        statusToast: "warning",
      });
    } finally {
      setTimeout(() => {
        goLogout();
      }, DELAY_ZERO);
    }
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
        {/* <SidebarContent
          onClose={() => onClose}
          display={{ base: "none", md: "block" }}
          LiteModeTrigger={LiteMode}
        /> */}
        <Flex
          transition="0.5s ease"
          position="fixed"
          top={scrollY > 0 ? 2 : 0}
          left={0}
          right={0}
          zIndex={10}
          // ml={{ base: 0, md: LiteMode ? "95px" : WIDTH_SIDEBAR }}
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

            <Box display={{ base: "none", md: "flex" }} w={"full"} as={HStack}>
              <IconButton
                onClick={toggleLiteMode}
                variant="ghost"
                colorScheme={"gray"}
                aria-label="lite mode"
                icon={<RiMenu2Line />}
                size={"lg"}
                // rounded={"xl"}
                display={"none"}
              />
              {/* MENU POP OVER */}
              <Popover>
                <PopoverTrigger>
                  <IconButton
                    isRound={true}
                    variant="solid"
                    colorScheme="secondary"
                    aria-label="Done"
                    fontSize="20px"
                    icon={<IoAppsOutline />}
                  />
                </PopoverTrigger>
                <Portal>
                  <PopoverContent
                    borderRadius={radiusStyle}
                    boxShadow={"none"}
                    border={"none"}
                    bg={"transparent"}
                    p={0}
                    m={0}
                  >
                    <SidebarContent
                      onClose={() => onClose}
                      display={"block"}
                      LiteModeTrigger={false}
                    />
                  </PopoverContent>
                </Portal>
              </Popover>
              {/* LOGO */}
              <Flex
                h="20"
                alignItems="center"
                mx="5"
                justifyContent="space-between"
              >
                <LogoApplications colorText="secondary.500" />
                <CloseButton
                  display={{ base: "flex", md: "none" }}
                  onClick={onClose}
                />
              </Flex>
              {/* SERACH MENU */}
              <SearchMenuButton LiteModeTrigger={LiteMode} />
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
                <Popover>
                  <PopoverTrigger>
                    <Button variant={"ghost"} position="relative">
                      <RiMegaphoneLine />
                      <Badge
                        colorScheme="orange"
                        variant={"solid"}
                        borderRadius="full"
                        position="absolute"
                        top="0"
                        right="0"
                        fontSize="10px"
                        minW="18px"
                        h="18px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        2
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    w="320px"
                    shadow="xl"
                    border="1px"
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius={radiusStyle}
                  >
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader
                      fontWeight="semibold"
                      fontSize="md"
                      bg={useColorModeValue("gray.50", "gray.700")}
                      borderBottom="1px"
                      borderColor={useColorModeValue("gray.200", "gray.600")}
                      py={3}
                      color={useColorModeValue("gray.800", "gray.100")}
                      borderTopRadius={radiusStyle}
                    >
                      Announcements
                    </PopoverHeader>
                    <PopoverBody
                      p={0}
                      maxH="400px"
                      overflowY="auto"
                      borderBottomRadius={radiusStyle}
                    >
                      <VStack spacing={0} align="stretch">
                        <Box
                          p={4}
                          borderBottom="1px"
                          borderColor={useColorModeValue(
                            "gray.100",
                            "gray.600"
                          )}
                          _hover={{
                            bg: useColorModeValue("orange.50", "orange.900"),
                          }}
                          cursor="pointer"
                          transition="all 0.2s"
                        >
                          <HStack justify="space-between" align="start" mb={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={useColorModeValue("gray.800", "gray.100")}
                            >
                              System Maintenance
                            </Text>
                            <Badge colorScheme="red" size="sm">
                              Important
                            </Badge>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.600", "gray.300")}
                            mb={2}
                          >
                            Scheduled maintenance on Sunday 2:00 AM - 4:00 AM.
                            Services may be temporarily unavailable.
                          </Text>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.400", "gray.500")}
                          >
                            1 day ago
                          </Text>
                        </Box>

                        <Box
                          p={4}
                          borderBottom="1px"
                          borderColor={useColorModeValue(
                            "gray.100",
                            "gray.600"
                          )}
                          _hover={{
                            bg: useColorModeValue("blue.50", "blue.900"),
                          }}
                          cursor="pointer"
                          transition="all 0.2s"
                        >
                          <HStack justify="space-between" align="start" mb={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={useColorModeValue("gray.800", "gray.100")}
                            >
                              New Feature Release
                            </Text>
                            <Badge colorScheme="blue" size="sm">
                              Update
                            </Badge>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.600", "gray.300")}
                            mb={2}
                          >
                            MinIO object storage integration is now available
                            for file uploads with automatic fallback.
                          </Text>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.400", "gray.500")}
                          >
                            3 days ago
                          </Text>
                        </Box>

                        <Box
                          p={3}
                          bg={useColorModeValue("gray.50", "gray.700")}
                          textAlign="center"
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="orange"
                            fontWeight="medium"
                            _hover={{
                              bg: useColorModeValue("orange.100", "orange.800"),
                            }}
                          >
                            View all announcements
                          </Button>
                        </Box>
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger>
                    <Button variant={"ghost"} position="relative">
                      <FaRegBell />
                      <Badge
                        colorScheme="red"
                        variant={"solid"}
                        borderRadius="full"
                        position="absolute"
                        top="0"
                        right="0"
                        fontSize="10px"
                        minW="18px"
                        h="18px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        3
                      </Badge>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    w="320px"
                    shadow="xl"
                    border="1px"
                    borderColor={useColorModeValue("gray.200", "gray.600")}
                    bg={useColorModeValue("white", "gray.800")}
                    borderRadius={radiusStyle}
                  >
                    <PopoverArrow />
                    <PopoverCloseButton />
                    <PopoverHeader
                      fontWeight="semibold"
                      fontSize="md"
                      bg={useColorModeValue("gray.50", "gray.700")}
                      borderBottom="1px"
                      borderColor={useColorModeValue("gray.200", "gray.600")}
                      py={3}
                      color={useColorModeValue("gray.800", "gray.100")}
                      borderTopRadius={radiusStyle}
                    >
                      Notifications
                    </PopoverHeader>
                    <PopoverBody
                      p={0}
                      maxH="400px"
                      overflowY="auto"
                      borderBottomRadius={radiusStyle}
                    >
                      <VStack spacing={0} align="stretch">
                        <Box
                          p={4}
                          borderBottom="1px"
                          borderColor={useColorModeValue(
                            "gray.100",
                            "gray.600"
                          )}
                          _hover={{
                            bg: useColorModeValue("blue.50", "blue.900"),
                          }}
                          cursor="pointer"
                          transition="all 0.2s"
                        >
                          <HStack justify="space-between" align="start" mb={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={useColorModeValue("gray.800", "gray.100")}
                            >
                              New project assigned
                            </Text>
                            <Badge colorScheme="blue" size="sm">
                              New
                            </Badge>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.600", "gray.300")}
                            mb={2}
                          >
                            Project Alpha has been assigned to your team
                          </Text>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.400", "gray.500")}
                          >
                            2 minutes ago
                          </Text>
                        </Box>

                        <Box
                          p={4}
                          borderBottom="1px"
                          borderColor={useColorModeValue(
                            "gray.100",
                            "gray.600"
                          )}
                          _hover={{
                            bg: useColorModeValue("green.50", "green.900"),
                          }}
                          cursor="pointer"
                          transition="all 0.2s"
                        >
                          <HStack justify="space-between" align="start" mb={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={useColorModeValue("gray.800", "gray.100")}
                            >
                              Task completed
                            </Text>
                            <Badge colorScheme="green" size="sm">
                              Done
                            </Badge>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.600", "gray.300")}
                            mb={2}
                          >
                            Backend API development has been completed
                          </Text>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.400", "gray.500")}
                          >
                            1 hour ago
                          </Text>
                        </Box>

                        <Box
                          p={4}
                          borderBottom="1px"
                          borderColor={useColorModeValue(
                            "gray.100",
                            "gray.600"
                          )}
                          _hover={{
                            bg: useColorModeValue("orange.50", "orange.900"),
                          }}
                          cursor="pointer"
                          transition="all 0.2s"
                        >
                          <HStack justify="space-between" align="start" mb={1}>
                            <Text
                              fontSize="sm"
                              fontWeight="semibold"
                              color={useColorModeValue("gray.800", "gray.100")}
                            >
                              Meeting reminder
                            </Text>
                            <Badge colorScheme="orange" size="sm">
                              Soon
                            </Badge>
                          </HStack>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.600", "gray.300")}
                            mb={2}
                          >
                            Daily standup meeting in 15 minutes
                          </Text>
                          <Text
                            fontSize="xs"
                            color={useColorModeValue("gray.400", "gray.500")}
                          >
                            3 hours ago
                          </Text>
                        </Box>

                        <Box
                          p={3}
                          bg={useColorModeValue("gray.50", "gray.700")}
                          textAlign="center"
                        >
                          <Button
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            fontWeight="medium"
                            _hover={{
                              bg: useColorModeValue("blue.100", "blue.800"),
                            }}
                          >
                            View all notifications
                          </Button>
                        </Box>
                      </VStack>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
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
                        // bgGradient={
                        //   "linear(to-br, primary.500, secondary.500 40%, yellow.500)"
                        // }
                        bgGradient="linear(to-br, secondary.600, secondary.800, secondary.900)"
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
                    <Link href={"/profile"}>
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
                          label={"Go to Profile"}
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
                                DataAuth ? DataAuth.nama : ""
                              )}
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
                    </Link>
                    <MenuDivider />
                    {/* <Link href={"/"}> */}
                    {/* <Link href={"/profile"}>
                      <MenuItem
                        color={useColorModeValue("gray.800", "white")}
                        bg={useColorModeValue("white", "gray.900")}
                        _hover={{
                          bg: useColorModeValue("gray.100", "gray.700"),
                          color: useColorModeValue("gray.900", "white"),
                        }}
                        icon={<FiUser />}
                      >
                        Profile
                      </MenuItem>
                    </Link> */}
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
                      Logout
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Flex>
            </HStack>
          </Flex>
        </Flex>
        <Box
          transition="0.5s ease"
          // ml={{ base: 0, md: LiteMode ? "95px" : WIDTH_SIDEBAR }}
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
  const [hideProMenus, setHideProMenus] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("hideProMenus");
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem("hideProMenus", JSON.stringify(hideProMenus));
  }, [hideProMenus]);

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
        // minH={scrollY > 90 ? "85vh" : "97vh"}
        w={"full"}
        pt={2}
      >
        <AdditionalProfileBar LiteModeTrigger={LiteModeTrigger} />
        <Flex pt={5} pb={2} mx={3}>
          <VStack w={"full"} h={"65vh"} align={"start"} overflowX="auto">
            <HStack w="full" justify="space-between" align="center" pl={2}>
              <Tooltip label="Hide menu pro" placement="top" hasArrow>
                <FormControl display="flex" alignItems="center">
                  <FormLabel
                    htmlFor="hide-pro"
                    mb="0"
                    fontSize={"smaller"}
                    display={LiteModeTrigger ? "none" : "flex"}
                  >
                    Hide Pro ?
                  </FormLabel>
                  <Switch
                    id="hide-pro"
                    size="sm"
                    isChecked={hideProMenus}
                    onChange={(e) => setHideProMenus(e.target.checked)}
                  />
                </FormControl>
              </Tooltip>
            </HStack>
            <Box w={"full"} overflowY={"auto"}>
              {LinkItems.filter((link) => !hideProMenus || !link.isPro).map(
                (link) => (
                  <NavItem key={link.name} data={link} mode={LiteModeTrigger} />
                )
              )}
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
  const { Logout } = useAuthentications();
  const showToast = useToastHelper();
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
            px="3"
            py="3"
            my="1"
            rounded={radiusStyle}
            role="group"
            cursor="pointer"
            boxShadow={IsActiveNav ? "md" : hasActiveChild ? "sm" : "none"}
            fontWeight={IsActiveNav ? "bold" : "normal"}
            _hover={{
              color: "secondary.800",
              // bg: "secondary.500",
              bgGradient: "linear(to-r, secondary.200, secondary.200)", // Default gradient
              pl: mode ? "4" : "5",
              boxShadow: "md",
            }}
            // bg={IsActiveNav ? "secondary.500" : "transparent"}
            bgGradient={
              IsActiveNav
                ? "linear(to-r, secondary.500, secondary.600)"
                : hasActiveChild
                ? "linear(to-r, secondary.500, secondary.600)"
                : "linear(to-r, transparent, transparent)"
            }
            color={
              IsActiveNav
                ? "white" // When the navigation item is active, set color to white
                : hasActiveChild
                ? "gray.100" // When has active child
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
                    color: "secondary.800",
                  }}
                  color={
                    IsActiveNav
                      ? "white"
                      : hasActiveChild
                      ? "gray.100"
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
                {data.isPro && <Badge colorScheme="secondary">Pro</Badge>}
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
