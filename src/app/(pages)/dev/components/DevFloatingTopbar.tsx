"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Button,
  IconButton,
  Badge,
  Spacer,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import {
  FiArrowLeft,
  FiChevronDown,
  FiFolder,
  FiSearch,
  FiLogOut,
} from "react-icons/fi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import { LogoApplications } from "@/app/components/logoApps";
import { radiusStyle } from "@/app/constants/applicationConstants";
import useAuthentications, { AuthDataResponse } from "@/app/services/useAuthentications";
import { useAuth } from "@/app/context/AuthContext";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";

interface DevFloatingTopbarProps {
  projectName?: string;
  showBack?: boolean;
  backHref?: string;
  backLabel?: string;
  onProjectSwitch?: (project: ProjectDataResponse) => void;
  isSelectionMode?: boolean;
  fullWidth?: boolean;
}

export const DevFloatingTopbar: React.FC<DevFloatingTopbarProps> = ({
  projectName,
  showBack = false,
  backHref = "/dev",
  backLabel = "Projects",
  onProjectSwitch,
  isSelectionMode = false,
  fullWidth = false,
}) => {
  const router = useRouter();
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { goLogout } = useAuth();
  const { Logout } = useAuthentications();
  const showToast = useToastHelper();

  const { GetAssignedProjects } = useProjects();
  const [scrollY, setScrollY] = useState(0);
  const [projectsList, setProjectsList] = useState<ProjectDataResponse[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isOpenSwitcher, setIsOpenSwitcher] = useState(false);
  const [dataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState("");

  // Transparent at rest (scrollY === 0), dynamic glassmorphism on scroll matching global topbar
  const isScrolled = scrollY > 0;
  const glassBg = isDark
    ? isScrolled
      ? "rgba(15, 23, 42, 0.72)"
      : "transparent"
    : isScrolled
    ? "rgba(255, 255, 255, 0.72)"
    : "transparent";
  const glassBorder = isScrolled
    ? isDark
      ? "1px solid rgba(255, 255, 255, 0.08)"
      : "1px solid rgba(255, 255, 255, 0.6)"
    : "1px solid transparent";
  const glassShadow = isScrolled
    ? isDark
      ? "0 10px 30px -10px rgba(0, 0, 0, 0.6)"
      : "0 10px 25px -5px rgba(0, 0, 0, 0.08)"
    : "none";
  const textColor = isDark ? "white" : "gray.800";
  const subTextColor = isDark ? "gray.400" : "gray.500";
  const popoverBg = isDark ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.95)";
  const hoverBg = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)";
  const projectTitleColor = isDark ? "purple.200" : "purple.600";
  const profileNameColor = isDark ? "secondary.200" : "secondary.600";

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("tokenData") || "";
      setTokenData(token);
      const stored = localStorage.getItem("authData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.dataLogin) {
            setDataAuth(parsed.dataLogin as AuthDataResponse);
          }
        } catch (e) {
          console.error("Failed to parse authData for topbar:", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpenSwitcher) return;
    const loadProjects = async () => {
      setIsLoadingProjects(true);
      try {
        const token = localStorage.getItem("tokenData") || "";
        if (!token) return;
        const res = await GetAssignedProjects(
          {
            search: "",
            limit: 50,
            page: 0,
            filterWhere: [],
            fieldOrder: ["projectName"],
            orderDir: "asc",
          },
          token
        );
        if (res?.statusCode === 200 && Array.isArray(res.data)) {
          setProjectsList(res.data);
        }
      } catch (err) {
        console.error("Failed to load switcher projects:", err);
      } finally {
        setIsLoadingProjects(false);
      }
    };
    loadProjects();
  }, [isOpenSwitcher]);

  const filteredProjects = useMemo(() => {
    if (!projectSearch.trim()) return projectsList;
    const lower = projectSearch.toLowerCase();
    return projectsList.filter(
      (p) =>
        p.projectName?.toLowerCase().includes(lower) ||
        p.projectNo?.toLowerCase().includes(lower)
    );
  }, [projectsList, projectSearch]);

  const handleSelectProject = (project: ProjectDataResponse) => {
    const backlogId = project.requirementData?.id || project.reqParentId || null;
    const selectedPayload = {
      id: project.id,
      projectNo: project.projectNo,
      projectName: project.projectName,
      projectStatus: project.projectStatus,
      backlogId,
    };

    localStorage.setItem("dev_selected_project", JSON.stringify(selectedPayload));
    setIsOpenSwitcher(false);

    if (onProjectSwitch) {
      onProjectSwitch(project);
    }

    window.dispatchEvent(
      new CustomEvent("dev_project_switched", { detail: selectedPayload })
    );

    if (window.location.pathname !== "/dev/kanban") {
      router.push("/dev/kanban");
    }
  };

  const handleBackToApps = () => {
    localStorage.removeItem("dev_mode");
    localStorage.removeItem("dev_selected_project");
    router.push("/home");
  };

  const handleBackToProjects = () => {
    localStorage.removeItem("dev_selected_project");
    window.dispatchEvent(new CustomEvent("dev_project_switched", { detail: null }));
    router.push(backHref);
  };

  const logoutAuthAction = async () => {
    try {
      const token = localStorage.getItem("tokenData") || tokenData;
      if (dataAuth && token) {
        const response = await Logout(dataAuth.userId, token);
        if (response?.statusCode === 200) {
          showToast({
            description: "Logout successful",
            statusToast: "success",
          });
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("dev_mode");
      localStorage.removeItem("dev_selected_project");
      goLogout();
    }
  };

  return (
    <Flex
      position="fixed"
      top={{ base: "12px", md: "16px" }}
      left="50%"
      transform="translateX(-50%)"
      w={{ base: "calc(100% - 32px)", md: "calc(100% - 48px)" }}
      maxW={fullWidth ? "none" : isSelectionMode ? "1400px" : "none"}
      zIndex={100}
      transition="all 0.3s ease"
    >
      <Flex
        w="full"
        px={{ base: 4, md: 6 }}
        py={2}
        minH="64px"
        alignItems="center"
        backdropFilter={isScrolled ? "blur(20px) saturate(180%)" : "none"}
        justifyContent="space-between"
        bg={glassBg}
        boxShadow={glassShadow}
        rounded={radiusStyle}
        border={glassBorder}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      >
        <HStack spacing={{ base: 2, md: 4 }} align="center">
          {/* bjb aPPs identity logo */}
          <LogoApplications colorText={isDark ? "white" : "secondary.500"} shortLabel={true} />

          {showBack && !isSelectionMode && (
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<FiArrowLeft />}
              borderRadius={radiusStyle}
              fontSize="xs"
              color={textColor}
              _hover={{ bg: hoverBg }}
              onClick={handleBackToProjects}
            >
              {backLabel}
            </Button>
          )}

          {!isSelectionMode && projectName && (
            /* Static current-project label (switching moved to the header "Change Project" button) */
            <HStack
              spacing={2}
              px={3}
              py={1.5}
              borderRadius={radiusStyle}
              bg={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"}
              border="1px solid"
              borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"}
            >
              <FiFolder size={14} color="#a78bfa" />
              <Text
                fontSize="sm"
                fontWeight={600}
                color={projectTitleColor}
                noOfLines={1}
                maxW={{ base: "140px", sm: "200px", md: "360px" }}
              >
                {projectName}
              </Text>
            </HStack>
          )}
        </HStack>

        <Spacer />

        <HStack spacing={{ base: 2, md: 3 }} align="center">
          <Button
            size="sm"
            variant="ghost"
            borderRadius={radiusStyle}
            fontSize="xs"
            fontWeight={500}
            color={textColor}
            _hover={{ bg: hoverBg }}
            onClick={handleBackToApps}
          >
            <Text display={{ base: "none", sm: "inline" }}>Back to Apps</Text>
          </Button>

          <IconButton
            aria-label="Toggle color mode"
            icon={isDark ? <SunIcon /> : <MoonIcon />}
            size="sm"
            variant="ghost"
            borderRadius={radiusStyle}
            color={textColor}
            _hover={{ bg: hoverBg }}
            onClick={toggleColorMode}
          />

          {/* User Profile Avatar matching existing sidebar.tsx */}
          {dataAuth && (
            <Menu>
              <MenuButton
                py={1.5}
                px={1.5}
                transition="all 0.3s"
                _focus={{ boxShadow: "none" }}
                borderRadius={radiusStyle}
                _hover={{ bg: hoverBg }}
              >
                <HStack spacing={2}>
                  <Avatar
                    size="sm"
                    name={dataAuth.nama || ""}
                    color="white"
                    bgGradient="linear(to-br, secondary.600, secondary.800, secondary.900)"
                  />
                  <VStack
                    display={{ base: "none", md: "flex" }}
                    alignItems="flex-start"
                    spacing="1px"
                    textAlign="left"
                  >
                    <Text
                      fontSize="xs"
                      fontWeight={600}
                      color={textColor}
                      noOfLines={1}
                      maxW="140px"
                    >
                      {dataAuth.nama}
                    </Text>
                    <Text fontSize="3xs" color={subTextColor} noOfLines={1}>
                      {(dataAuth && (dataAuth.teamRole?.specName || dataAuth.jabatan)) || "User"}
                    </Text>
                  </VStack>
                  <Box color={textColor} display={{ base: "none", md: "block" }}>
                    <FiChevronDown size={14} />
                  </Box>
                </HStack>
              </MenuButton>
              <MenuList
                bg={popoverBg}
                backdropFilter="blur(20px) saturate(180%)"
                zIndex={150}
                rounded={radiusStyle}
                boxShadow={
                  isDark
                    ? "0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)"
                    : "0 20px 40px rgba(0, 0, 0, 0.12), inset 0 1px 0 0 rgba(255, 255, 255, 0.6)"
                }
                border={glassBorder}
                p={1.5}
              >
                <Link href="/profile">
                  <MenuItem
                    bg="transparent"
                    _hover={{
                      bg: hoverBg,
                      color: textColor,
                    }}
                    rounded={radiusStyle}
                  >
                    <VStack w="full" h="full" spacing={1} align="start" p={1}>
                      <Text
                        color={profileNameColor}
                        fontSize="sm"
                        fontWeight={700}
                      >
                        {dataAuth.nama}
                      </Text>
                      <Text fontSize="xs" color={subTextColor}>
                        {(dataAuth && (dataAuth.teamRole?.specName || dataAuth.jabatan)) || "User"}
                      </Text>
                    </VStack>
                  </MenuItem>
                </Link>
                <MenuDivider borderColor={isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.08)"} />
                <MenuItem
                  icon={<FiArrowLeft />}
                  color={textColor}
                  bg="transparent"
                  _hover={{
                    bg: hoverBg,
                  }}
                  onClick={handleBackToApps}
                  rounded={radiusStyle}
                >
                  Back to Apps
                </MenuItem>
                <MenuItem
                  icon={<FiLogOut />}
                  color={textColor}
                  bg="transparent"
                  _hover={{
                    bg: "red.600",
                    color: "white",
                  }}
                  onClick={logoutAuthAction}
                  rounded={radiusStyle}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Flex>
  );
};

export default DevFloatingTopbar;
