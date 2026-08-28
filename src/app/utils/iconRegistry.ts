/**
 * Icon Registry
 * Centralized registry for all icons used in the application
 * Only imports icons that are actually used to maintain tree-shaking
 */

import { IconType } from "react-icons";

// Ant Design Icons
import { AiOutlineVideoCamera, AiOutlineVideoCameraAdd } from "react-icons/ai";

// BoxIcons
import { BiAnalyse, BiSolidReport } from "react-icons/bi";

// Bootstrap Icons
import {
  BsChatDots,
  BsCloudUpload,
  BsDatabaseGear,
  BsKanban,
  BsRocketTakeoff,
} from "react-icons/bs";

// Circum Icons
import { CiMobile2, CiMoneyCheck1, CiServer } from "react-icons/ci";

// Font Awesome
import {
  FaChess,
  FaCode,
  FaDraftingCompass,
  FaDiceD20,
  FaDiceD6,
  FaFire,
  FaRegFileCode,
  FaRegFolderOpen,
  FaRegHeart,
  FaRegStar,
  FaUserPlus,
  FaVial,
} from "react-icons/fa";

// Font Awesome 6
import {
  FaDiagramProject,
  FaO,
  FaRegRectangleList,
  FaUsersRays,
} from "react-icons/fa6";

// Feather Icons
import {
  FiAward,
  FiCircle,
  FiClock,
  FiDatabase,
  FiDollarSign,
  FiKey,
  FiLayers,
  FiList,
  FiSettings,
  FiUmbrella,
  FiUpload,
  FiUser,
  FiUsers,
  FiZap,
  FiGlobe,
} from "react-icons/fi";

// Grommet Icons
import { GrHelpBook } from "react-icons/gr";

// Heroicons
import {
  HiOutlineDesktopComputer,
  HiOutlineDocumentReport,
  HiOutlineInformationCircle,
} from "react-icons/hi";

// IcoMoon
import { ImUserTie } from "react-icons/im";

// Ionicons
import { IoIosCodeDownload, IoMdBookmarks } from "react-icons/io";

// Ionicons 5
import {
  IoCalendarNumberOutline,
  IoCalendarOutline,
  IoChatbubblesOutline,
  IoKeyOutline,
} from "react-icons/io5";

// Line Awesome
import { LiaFileContractSolid } from "react-icons/lia";

// Lucide
import { LuBookHeart, LuServer } from "react-icons/lu";

// Material Design
import {
  MdChangeHistory,
  MdOutlineCircle,
  MdOutlineCode,
  MdOutlinePermMedia,
  MdOutlineSystemUpdateAlt,
  MdOutlineWorkOutline,
  MdWebAsset,
} from "react-icons/md";

// Phosphor Icons
import { PiCertificate, PiFlowArrow } from "react-icons/pi";

// Remix Icons
import {
  RiApps2AiLine,
  RiCodeBlock,
  RiMegaphoneLine,
  RiOrganizationChart,
} from "react-icons/ri";

// Radix Icons
import { RxActivityLog } from "react-icons/rx";

// Tabler Icons
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
  TbNumbers,
  TbProgressCheck,
  TbServerCog,
  TbSettingsCog,
  TbShare,
  TbTimeline,
  TbUserBolt,
  TbUserHeart,
  TbUserShare,
  TbUsers,
  TbUsersGroup,
} from "react-icons/tb";

// Typicons
import { TiThMenuOutline } from "react-icons/ti";

/**
 * Icon Registry Map
 * Maps icon name strings to their IconType components
 */
const iconRegistry: Record<string, IconType> = {
  // Ant Design Icons (Ai)
  AiOutlineVideoCamera,
  AiOutlineVideoCameraAdd,

  // BoxIcons (Bi)
  BiAnalyse,
  BiSolidReport,

  // Bootstrap Icons (Bs)
  BsChatDots,
  BsCloudUpload,
  BsDatabaseGear,
  BsKanban,
  BsRocketTakeoff,

  // Circum Icons (Ci)
  CiMobile2,
  CiMoneyCheck1,
  CiServer,

  // Font Awesome (Fa)
  FaChess,
  FaCode,
  FaDraftingCompass,
  FaDiceD20,
  FaDiceD6,
  FaFire,
  FaRegFileCode,
  FaRegFolderOpen,
  FaRegHeart,
  FaRegStar,
  FaUserPlus,
  FaVial,

  // Font Awesome 6 (Fa6)
  FaDiagramProject,
  FaO,
  FaRegRectangleList,
  FaUsersRays,

  // Feather Icons (Fi)
  FiAward,
  FiCircle,
  FiClock,
  FiDatabase,
  FiDollarSign,
  FiKey,
  FiLayers,
  FiSettings,
  FiUmbrella,
  FiUpload,
  FiUser,
  FiUsers,
  FiList,
  FiZap,
  FiGlobe,

  // Grommet Icons (Gr)
  GrHelpBook,

  // Heroicons (Hi)
  HiOutlineDesktopComputer,
  HiOutlineDocumentReport,
  HiOutlineInformationCircle,

  // IcoMoon (Im)
  ImUserTie,

  // Ionicons (Io)
  IoIosCodeDownload,
  IoMdBookmarks,

  // Ionicons 5 (Io5)
  IoCalendarNumberOutline,
  IoCalendarOutline,
  IoChatbubblesOutline,
  IoKeyOutline,

  // Line Awesome (Lia)
  LiaFileContractSolid,

  // Lucide (Lu)
  LuBookHeart,
  LuServer,

  // Material Design (Md)
  MdChangeHistory,
  MdOutlineCircle,
  MdOutlineCode,
  MdOutlinePermMedia,
  MdOutlineSystemUpdateAlt,
  MdOutlineWorkOutline,
  MdWebAsset,

  // Phosphor Icons (Pi)
  PiCertificate,
  PiFlowArrow,

  // Remix Icons (Ri)
  RiApps2AiLine,
  RiCodeBlock,
  RiMegaphoneLine,
  RiOrganizationChart,

  // Radix Icons (Rx)
  RxActivityLog,

  // Tabler Icons (Tb)
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
  TbNumbers,
  TbProgressCheck,
  TbServerCog,
  TbSettingsCog,
  TbShare,
  TbTimeline,
  TbUserBolt,
  TbUserHeart,
  TbUserShare,
  TbUsers,
  TbUsersGroup,

  // Typicons (Ti)
  TiThMenuOutline,
};

/**
 * Get Icon Component by Name
 * Returns the IconType component for the given icon name string
 * Falls back to FiCircle if icon not found
 *
 * @param iconName - The name of the icon (e.g., "FiHome", "TbUsers")
 * @returns IconType component
 *
 * @example
 * const icon = getIconComponent("FiHome");
 * <Icon as={icon} />
 */
export const getIconComponent = (
  iconName: string | null | undefined,
): IconType => {
  if (!iconName) return FiCircle;

  const IconComponent = iconRegistry[iconName];

  if (!IconComponent) {
    console.warn(
      `Icon "${iconName}" not found in registry. Using FiCircle as fallback.`,
    );
    return FiCircle;
  }

  return IconComponent;
};

/**
 * Check if an icon exists in the registry
 *
 * @param iconName - The name of the icon to check
 * @returns boolean indicating if icon exists
 */
export const hasIcon = (iconName: string): boolean => {
  return iconName in iconRegistry;
};

/**
 * Get all available icon names
 * Useful for debugging or building icon pickers
 *
 * @returns Array of all registered icon names
 */
export const getAvailableIcons = (): string[] => {
  return Object.keys(iconRegistry).sort();
};
