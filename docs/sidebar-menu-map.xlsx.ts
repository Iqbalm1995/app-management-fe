/**
 * Run this script to generate the sidebar menu map Excel file:
 * npx ts-node --skip-project docs/sidebar-menu-map.xlsx.ts
 */

import XLSX from "xlsx-js-style";

interface MenuRow {
  Level: string;
  Parent: string;
  "Menu Name": string;
  Route: string;
  Role: string;
  "Menu ID": string;
  "Is Pro/Locked": string;
  Icon: string;
}

const rows: MenuRow[] = [
  // Dashboard
  { Level: "Parent", Parent: "-", "Menu Name": "Dashboard", Route: "/home", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbLayoutDashboardFilled" },

  // Workspace
  { Level: "Parent", Parent: "-", "Menu Name": "Workspace", Route: "/workspaces", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "BsRocketTakeoff" },
  { Level: "Child", Parent: "Workspace", "Menu Name": "My Project", Route: "/workspace", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaCode" },
  { Level: "Child", Parent: "Workspace", "Menu Name": "My Performance", Route: "/performances/my-performance", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiAward" },
  { Level: "Child", Parent: "Workspace", "Menu Name": "Division Summary", Route: "/performances/divisions/summary", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiAward" },
  { Level: "Child", Parent: "Workspace", "Menu Name": "Group Summary", Route: "/performances/groups/summary", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiAward" },

  // Requirements
  { Level: "Parent", Parent: "-", "Menu Name": "Requirements", Route: "/requirements", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaDraftingCompass" },
  { Level: "Child", Parent: "Requirements", "Menu Name": "Pending Approve", Route: "/requirements/approval-hub", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiClock" },
  { Level: "Child", Parent: "Requirements", "Menu Name": "BRD / RFC", Route: "/requirements/brd-rfc", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "MdChangeHistory" },
  { Level: "Child", Parent: "Requirements", "Menu Name": "Prerequisites", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "MdChangeHistory" },

  // Projects
  { Level: "Parent", Parent: "-", "Menu Name": "Projects", Route: "/projects", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaDiagramProject" },
  { Level: "Child", Parent: "Projects", "Menu Name": "Pending Approve", Route: "/projects/pending-approve", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiClock" },
  { Level: "Child", Parent: "Projects", "Menu Name": "Internal Development", Route: "/projects-manager?reqType=brd", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaCode" },
  { Level: "Child", Parent: "Projects", "Menu Name": "Procurement", Route: "/projects-procurements", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbContract" },
  { Level: "Child", Parent: "Projects", "Menu Name": "RFC", Route: "/projects-manager?reqType=rfc", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaCode" },
  { Level: "Child", Parent: "Projects", "Menu Name": "Deployment", Route: "/projects-deployments", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "BsCloudUpload" },
  { Level: "Child", Parent: "Projects", "Menu Name": "Timeline Simulation", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbTimeline" },

  // Vendor Management
  { Level: "Parent", Parent: "-", "Menu Name": "Vendor Management", Route: "/vendor-management", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiUmbrella" },
  { Level: "Child", Parent: "Vendor Management", "Menu Name": "Vendor List", Route: "/vendor-management", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "LiaFileContractSolid" },
  { Level: "Child", Parent: "Vendor Management", "Menu Name": "Work Program", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "FiUmbrella" },
  { Level: "Child", Parent: "Vendor Management", "Menu Name": "Payment Tracking", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "FiLayers" },

  // Resource Management
  { Level: "Parent", Parent: "-", "Menu Name": "Resource Management", Route: "/resource-monitor", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbUsers" },

  // Management Apps
  { Level: "Parent", Parent: "-", "Menu Name": "Management Apps", Route: "/master-data/Application", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaDiceD20" },
  { Level: "Child", Parent: "Management Apps", "Menu Name": "Data Applications", Route: "/master-data/Application", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaDiceD6" },
  { Level: "Child", Parent: "Management Apps", "Menu Name": "Matrix & Criteria", Route: "/master-data/conf-matrix-criteria-apps", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiList" },
  { Level: "Child", Parent: "Management Apps", "Menu Name": "Assessment of Critical Apps", Route: "/report/apps-assessments", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaRegRectangleList" },
  { Level: "Child", Parent: "Management Apps", "Menu Name": "Pending Approve Assessment Apps", Route: "/report/apps-assessments-pending-approve", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiClock" },
  { Level: "Child", Parent: "Management Apps", "Menu Name": "Upload Report Apps", Route: "/report/upload-report-assessments-apps", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaRegFileCode" },

  // Meeting
  { Level: "Parent", Parent: "-", "Menu Name": "Meeting", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "AiOutlineVideoCamera" },
  { Level: "Child", Parent: "Meeting", "Menu Name": "Meeting Calendar", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "IoCalendarOutline" },

  // Reports
  { Level: "Parent", Parent: "-", "Menu Name": "Reports", Route: "/reports", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "BiSolidReport" },
  { Level: "Child", Parent: "Reports", "Menu Name": "Historical Report", Route: "/reports/dashboard-portfolio", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiClock" },
  { Level: "Grandchild", Parent: "Historical Report", "Menu Name": "[H] Dashboard Portfolio", Route: "/reports/dashboard-portfolio", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "BiSolidReport" },
  { Level: "Grandchild", Parent: "Historical Report", "Menu Name": "[H] Projects Active List Report", Route: "/reports/project-active-portfolio", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbListDetails" },
  { Level: "Grandchild", Parent: "Historical Report", "Menu Name": "[H] Projects Close List Report", Route: "/reports/project-close-portfolio", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbListDetails" },
  { Level: "Child", Parent: "Reports", "Menu Name": "Realtime Report", Route: "/reports/dashboard-portfolio", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiZap" },
  { Level: "Grandchild", Parent: "Realtime Report", "Menu Name": "[RT] Dashboard Realtime", Route: "/reports/dashboard-portfolio-real-time", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "BiSolidReport" },
  { Level: "Grandchild", Parent: "Realtime Report", "Menu Name": "[RT] Portfolio", Route: "/reports/project-portfolio", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "BiSolidReport" },

  // Teams Performances
  { Level: "Parent", Parent: "-", "Menu Name": "Teams Performances", Route: "/performances", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaRegStar" },
  { Level: "Child", Parent: "Teams Performances", "Menu Name": "Performances Divisions", Route: "/performances/divisions", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaRegStar" },
  { Level: "Child", Parent: "Teams Performances", "Menu Name": "Performances Group", Route: "/performances/groups", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaRegStar" },
  { Level: "Child", Parent: "Teams Performances", "Menu Name": "Performances Teams", Route: "/performances/teams", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaRegStar" },

  // Assets Management
  { Level: "Parent", Parent: "-", "Menu Name": "Assets Management", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "FaRegStar" },

  // DevOps
  { Level: "Parent", Parent: "-", "Menu Name": "DevOps", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "BsDatabaseGear" },
  { Level: "Child", Parent: "DevOps", "Menu Name": "DevOps", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "BsDatabaseGear" },
  { Level: "Child", Parent: "DevOps", "Menu Name": "Maintenance Report", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbFileReport" },

  // Knowledge Base
  { Level: "Parent", Parent: "-", "Menu Name": "Knowledge Base", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "GrHelpBook" },
  { Level: "Child", Parent: "Knowledge Base", "Menu Name": "Bjb Ask", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "BsChatDots" },
  { Level: "Child", Parent: "Knowledge Base", "Menu Name": "Bjb Apps User Guide", Route: "/show-flow", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "LuBookHeart" },
  { Level: "Child", Parent: "Knowledge Base", "Menu Name": "Document Templates", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "IoMdBookmarks" },

  // Master Data
  { Level: "Parent", Parent: "-", "Menu Name": "Master Data", Route: "/master-data", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiDatabase" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master Organizations", Route: "/master-data/organizations", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "RiOrganizationChart" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master Team", Route: "/teams-center", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FaUsersRays" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master Workflow", Route: "/master-data/workflow", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "PiFlowArrow" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master SDLC Flow", Route: "/master-data/sdlc-flow", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbTimeline" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master Users", Route: "/master-data/users", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiUsers" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master User PIC", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiKey" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master Specialization", Route: "/master-data/specialization", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiAward" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master Certification", Route: "/master-data/certification", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbChartInfographic" },
  { Level: "Child", Parent: "Master Data", "Menu Name": "Master Programming Language", Route: "/master-data/masterLanguage", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbSettingsCog" },

  // Access Configurations
  { Level: "Parent", Parent: "-", "Menu Name": "Access Configurations", Route: "/master-data/authorize-groups", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "IoKeyOutline" },
  { Level: "Child", Parent: "Access Configurations", "Menu Name": "Master Menu", Route: "/master-data/menus", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TiThMenuOutline" },
  { Level: "Child", Parent: "Access Configurations", "Menu Name": "Sys Module Group", Route: "/master-data/sys-module-group", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbUsersGroup" },
  { Level: "Child", Parent: "Access Configurations", "Menu Name": "Authorize Group", Route: "/master-data/authorize-groups", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbUsersGroup" },

  // Parameter
  { Level: "Parent", Parent: "-", "Menu Name": "Parameter", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbAdjustmentsCog" },
  { Level: "Child", Parent: "Parameter", "Menu Name": "Parameter Constant", Route: "/master-data/constants-data", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiKey" },
  { Level: "Child", Parent: "Parameter", "Menu Name": "Parameter Language Mapping", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbLanguage" },
  { Level: "Child", Parent: "Parameter", "Menu Name": "Project Codes", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbCode" },

  // System Parameters
  { Level: "Parent", Parent: "-", "Menu Name": "System Parameters", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbSettingsCog" },
  { Level: "Child", Parent: "System Parameters", "Menu Name": "Calender Engine", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbCalendarTime" },
  { Level: "Child", Parent: "System Parameters", "Menu Name": "Session Timeout", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbHourglassHigh" },
  { Level: "Child", Parent: "System Parameters", "Menu Name": "System Cut-Off Time", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbClockExclamation" },
  { Level: "Child", Parent: "System Parameters", "Menu Name": "Announcements", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "RiMegaphoneLine" },
  { Level: "Child", Parent: "System Parameters", "Menu Name": "Time Tracking", Route: "/coming-soon", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "TbTimeline" },
  { Level: "Child", Parent: "System Parameters", "Menu Name": "Sequences Config", Route: "/master-data/sequences-config", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "TbNumbers" },

  // Import Data
  { Level: "Parent", Parent: "-", "Menu Name": "Import Data", Route: "/projects/import", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiUpload" },
  { Level: "Child", Parent: "Import Data", "Menu Name": "Import Data Project", Route: "/projects/import", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "FiUpload" },
  { Level: "Child", Parent: "Import Data", "Menu Name": "Import Legacy Projects", Route: "/projects/import-legacy", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "BsCloudUpload" },

  // File Archive
  { Level: "Parent", Parent: "-", "Menu Name": "File Archive", Route: "/file-archives", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "Pro", Icon: "MdOutlinePermMedia" },

  // Audit Trail
  { Level: "Parent", Parent: "-", "Menu Name": "Audit Trail", Route: "/audit-trail", Role: "admin", "Menu ID": "1", "Is Pro/Locked": "No", Icon: "RxActivityLog" },
];

// Generate Excel
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(rows);

// Column widths
ws["!cols"] = [
  { wch: 12 }, // Level
  { wch: 25 }, // Parent
  { wch: 40 }, // Menu Name
  { wch: 45 }, // Route
  { wch: 8 },  // Role
  { wch: 10 }, // Menu ID
  { wch: 14 }, // Is Pro/Locked
  { wch: 28 }, // Icon
];

XLSX.utils.book_append_sheet(wb, ws, "Sidebar Menu Map");
XLSX.writeFile(wb, "docs/Sidebar_Menu_Map.xlsx");
console.log("✅ Generated: docs/Sidebar_Menu_Map.xlsx");
