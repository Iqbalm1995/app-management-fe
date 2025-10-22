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
  FiUpload,
  FiTruck,
  FiPackage,
  FiUmbrella,
  FiLayers,
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
import { FaDraftingCompass, FaRegHeart, FaRegStar, FaVial } from "react-icons/fa";
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
// import { useAuth } from "@/context/AuthContext";

// Page Split
// const ProfileModal = React.lazy(
//   () => import("../_pieces/profile/Profile-modal")
// );

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
    link: "/coming-soon",
    role: ["admin"],
    menuID: "1",
    isPro: true,
    children: [
      {
        name: "My Project",
        icon: FaCode,
        link: "/coming-soon",
        role: ["admin"],
        menuID: "1",
        isPro: true,
        children: [],
      },
    ],
  },
  // {
  //   name: "Workspace",
  //   icon: BsRocketTakeoff,
  //   link: "/workspace",
  //   role: ["admin"],
  //   menuID: "1",
  //   isPro: true,
  //   children: [
  //     {
  //       name: "My Project",
  //       icon: FaCode,
  //       link: "/project-development",
  //       role: ["admin"],
  //       menuID: "1",
  //       isPro: true,
  //       children: [],
  //     },
  //   ],
  // },
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
      {
        name: "Prerequisites (Pre-Req)",
        icon: MdChangeHistory,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      // {
      //   name: "Pending Review",
      //   icon: MdOutlineCircle,
      //   link: "/requirements/pending-reviews",
      //     role: ["admin"],
      //     menuID: "1",
      //     children: [],
      // // },
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
      {
        name: "Timeline & Milestone Simulation",
        icon: TbTimeline,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Vendor Management",
    icon: FiUmbrella,
    link: "/coming-soon",
    role: ["admin"],
    isPro: true,
    menuID: "1",
    children: [
      {
        name: "Vendor Data",
        icon: FiUmbrella,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Contract Data",
        icon: LiaFileContractSolid,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Acquisition",
        icon: FiLayers,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Work Programs / RBB",
        icon: MdOutlineWorkOutline,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Invoice & Payment Tracking",
        icon: CiMoneyCheck1,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Resource Management",
    icon: TbUsers,
    link: "/coming-soon",
    role: ["admin"],
    isPro: true,
    menuID: "1",
    children: [
      {
        name: "Resource Load Tracking",
        icon: TbUserHeart,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Resource Allocation",
        icon: TbUserShare,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Resource Availability",
        icon: TbUserBolt,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Meeting Management",
    icon: AiOutlineVideoCamera,
    link: "/coming-soon",
    role: ["admin"],
    isPro: true,
    menuID: "1",
    children: [
      {
        name: "Meeting Invitations",
        icon: AiOutlineVideoCameraAdd,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Meeting Calender",
        icon: IoCalendarNumberOutline,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Minutes & Follow-Ups",
        icon: IoCalendarOutline,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Import Data",
    icon: FiUpload,
    link: "/projects/import",
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "Import Data Project",
        icon: FiUpload,
        link: "/projects/import",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },

  {
    name: "Reports",
    icon: BiSolidReport,
    link: "/reports",
    role: ["admin"],
    isPro: true,
    menuID: "1",
    children: [
      {
        name: "Project Portfolio",
        icon: BiSolidReport,
        link: "/reports/project-portfolio",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Deployment Portfolio",
        icon: BiSolidReport,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Application & Feature",
        icon: RiApps2AiLine,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Project Team",
        icon: TbUsersGroup,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Executive Summary",
        icon: ImUserTie,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Collaboration & Sharing",
    icon: TbShare,
    link: "/coming-soon",
    role: ["admin"],
    isPro: true,
    menuID: "1",
    children: [
      {
        name: "Mention & Notification",
        icon: TbBellShare,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Internal Sharing",
        icon: TbMoodShare,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "External Collaboration",
        icon: TbNavigationShare,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Chat",
        icon: IoChatbubblesOutline,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Assets Management",
    icon: FaRegStar,
    link: "/coming-soon",
    role: ["admin"],
    isPro: true,
    menuID: "1",
    children: [
      {
        name: "Software",
        icon: MdWebAsset,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Hardware",
        icon: LuServer,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "License & Subscriptions",
        icon: IoKeyOutline,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "DevOps",
    icon: BsDatabaseGear,
    link: "/coming-soon",
    role: ["admin"],
    isPro: true,
    menuID: "1",
    children: [
      {
        name: "DevOps Portofolio",
        icon: BsDatabaseGear,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "DevOps Integration",
        icon: IoIosCodeDownload,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Source Code Repository",
        icon: RiCodeBlock,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Engineer On Site (EoS) Report",
        icon: HiOutlineDocumentReport,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Route Cause Analysis (RCA)",
        icon: BiAnalyse,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Maintenance Report",
        icon: TbFileReport,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Team Manager",
    icon: FaChess,
    link: "/teams",
    role: ["admin"],
    menuID: "1",
    children: [],
  },
  {
      name: "Team Center",
      icon: FaUsersRays,
      link: "/teams-center",
      role: ["admin"],
      menuID: "1",
      children: [],
  },
  // {
  //   name: "Server Manager",
  //   icon: CiServer,
  //   link: "/server-manager",
      // role: ["admin"],
      // menuID: "1",
      // children: [],
  // },
  // {
  //   name: "File Archive",
  //   icon: MdOutlinePermMedia,
  //   link: "/file-archives",
  //   role: ["admin"],
  //   menuID: "1",
  //   isPro: true,
  //   children: [],
  // },
  {
    name: "Knowledge Base",
    icon: GrHelpBook,
    link: "/coming-soon",
    role: ["admin"],
    isPro: true,
    menuID: "1",
    children: [
      {
        name: "Bjb Ask",
        icon: BsChatDots,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Bjb Apps User Guide",
        icon: LuBookHeart,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
      {
        name: "Document Templates",
        icon: IoMdBookmarks,
        link: "/coming-soon",
        role: ["admin"],
        isPro: true,
        menuID: "1",
        children: [],
      },
    ],
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
      {
        name: "Master Users",
        icon: FiUsers,
        link: "/master-data/users",
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Master Organization Structure",
        icon: RiOrganizationChart,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Master Certifications",
        icon: PiCertificate,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Master Programming Language",
        icon: MdOutlineCode,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Master Specializations",
        icon: TbBolt,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Menu Name",
    icon: TbBolt, // icon proefer
    link: "/coming-soon", // constant
    isPro: true, // constant
    role: ["admin"], // constant
    menuID: "1", // constant
    children: [
      {
        name: "Menu Name",
        icon: TbBolt, // icon proefer
        link: "/coming-soon", // constant
        isPro: true, // constant
        role: ["admin"], // constant
        menuID: "1", // constant
        children: [], // Sub here
      },
    ], // Sub here
  },
  {
    name: "Parameter Management",
    icon: TbAdjustmentsCog, // general "settings/parameters" icon
    link: "/coming-soon",
    isPro: true,
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "BRD & RFC Status",
        icon: TbListDetails,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Deployment Status",
        icon: TbArrowsExchange,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Project Status",
        icon: TbProgressCheck,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Project Indicators",
        icon: TbChartInfographic,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Project Types",
        icon: TbFolders,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Project Characteristics",
        icon: TbCategory,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Development Status",
        icon: TbServerCog,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Deliverables Status",
        icon: TbClipboardList,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Maintenance Types & Categories",
        icon: TbAdjustmentsCog,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Parameter Language Mapping",
        icon: TbLanguage,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Project Codes",
        icon: TbCode,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "System Parameters",
    icon: TbSettingsCog, // general system/settings icon
    link: "/coming-soon",
    isPro: true,
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "Calender Engine",
        icon: TbCalendarTime,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Session Timeout",
        icon: TbHourglassHigh,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "System Cut-Off Time",
        icon: TbClockExclamation,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Announcements",
        icon: RiMegaphoneLine,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Time Tracking",
        icon: TbTimeline,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Audit Trail",
    icon: RxActivityLog,
    link: "/audit-trail",
    role: ["admin"],
    menuID: "1",
    children: [],
  },
  {
    name: "About",
    icon: HiOutlineInformationCircle,
    link: "/coming-soon",
    isPro: true,
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "Bjb Apps Web",
        icon: FaRegHeart,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Bjb Apps Mobile",
        icon: CiMobile2,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Hybrid Methodologies",
        icon: FaVial,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
  {
    name: "Add-Ons",
    icon: FaO,
    link: "/coming-soon",
    isPro: true,
    role: ["admin"],
    menuID: "1",
    children: [
      {
        name: "System Integrations",
        icon: MdOutlineSystemUpdateAlt,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
      {
        name: "Bjb Apps Mobile",
        icon: CiMobile2,
        link: "/coming-soon",
        isPro: true,
        role: ["admin"],
        menuID: "1",
        children: [],
      },
    ],
  },
  // {
  //   name: "Profile",
  //   icon: FiUser,
  //   link: "/profile",
      // role: ["admin"],
      // menuID: "1",
      // children: [],
  // },
  // {
  //   name: "Pricing",
  //   icon: FiDollarSign,
  //   link: "/pricing",
      // role: ["admin"],
      // menuID: "1",
      // children: [],
  //   isLocked: true,
  // },
  // {
  //   name: "Avtivities",
  //   icon: RxActivityLog,
  //   link: "/activities",
      // role: ["admin"],
      // menuID: "1",
      // children: [],
  //   isLocked: true,
  // },
  // {
  //   name: "User Config",
  //   icon: FaUsersGear,
  //   link: "/users",
      // role: ["admin"],
      // menuID: "1",
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
      // role: ["admin"],
      // menuID: "1",
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
  const { Logout } = useAuthentications();
  const showToast = useToastHelper();

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
  const [isHovered, setIsHovered] = useState(false);

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
          position="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          cursor="pointer"
        >
          <Box
            bg={colorMode == "light" ? "gray.100" : "blackAlpha.500"}
            color={colorMode == "light" ? "gray.900" : "white"}
            mx={2}
            mr={LiteModeTrigger ? 2 : 3}
            py={LiteModeTrigger ? 0 : 2}
            rounded={radiusStyle}
            transition="0.5s ease-in-out"
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
                  label={(DataAuth && DataAuth.nama) || ""}
                >
                  <Avatar
                    size={"md"}
                    bgGradient="linear(to-br, secondary.600, secondary.800, secondary.900)"
                    color={"white"}
                    name={(DataAuth && DataAuth.nama) || "U"}
                    mr={LiteModeTrigger ? 0 : 2}
                    cursor={"pointer"}
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
                  <VStack
                    w={"full"}
                    h={"full"}
                    spacing={0}
                    align={"start"}
                    p={1}
                  >
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
                      color={
                        colorMode == "light" ? "primary.500" : "primary.100"
                      }
                      // color={"secondary.200"}
                    >
                      {(DataAuth && DataAuth.teamRole?.specName) ||
                        (DataAuth && DataAuth.jabatan)}
                    </Text>
                  </VStack>
                </Flex>
              </Flex>

              {/* Hover Indicator */}
              <Flex
                position="absolute"
                bottom={1}
                left="50%"
                transform="translateX(-50%)"
                opacity={isHovered ? 0 : 0.7}
                transition="opacity 0.2s"
                mt={2}
              >
                <Box
                  w={6}
                  h={1}
                  bg={colorMode == "light" ? "gray.400" : "gray.500"}
                  rounded="full"
                />
              </Flex>
            </Flex>
          </Box>

          {/* Hover Drawer */}
          <MotionBox
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isHovered ? "auto" : 0,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            overflow="hidden"
            bg="secondary.500"
            color="white"
            mx={2}
            mr={LiteModeTrigger ? 2 : 3}
            roundedTop="none"
            roundedBottom={radiusStyle}
            mt={-2}
          >
            <Flex
              px={LiteModeTrigger ? 1 : 2}
              py={1}
              w={"full"}
              justifyContent={LiteModeTrigger ? "center" : "start"}
            >
              <Button
                as={Link}
                href="/profile"
                size="xs"
                variant="ghost"
                w="full"
                leftIcon={LiteModeTrigger ? undefined : <FiUser />}
                justifyContent={LiteModeTrigger ? "center" : "flex-start"}
                color="white"
                fontSize="xs"
                h={5}
                _hover={{
                  bg: "secondary.600",
                }}
              >
                {LiteModeTrigger ? "👤" : "Go to Profile"}
              </Button>
            </Flex>
          </MotionBox>
        </Box>

        {/* UPGRADE PLAN */}
        <Flex m={2} pt={2} mr={LiteModeTrigger ? 2 : 3}>
          <Flex
            as={Button}
            w="full"
            size={LiteModeTrigger ? "sm" : "md"}
            bgGradient="linear(to-r, blue.600, secondary.500, yellow.500)"
            color="white"
            rounded="xl"
            fontWeight="bold"
            fontSize={LiteModeTrigger ? "xs" : "sm"}
            _hover={{
              bgGradient: "linear(to-r, blue.500, secondary.400, yellow.400)",
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
            display={"none"}
          >
            {LiteModeTrigger ? "+" : "Upgrade IT bjb +"}
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
