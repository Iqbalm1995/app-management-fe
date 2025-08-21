"use client";

import React, { ReactNode, useEffect, useState } from "react";
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
  Link,
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
  Container,
  Tooltip,
  useColorMode,
  Spinner,
} from "@chakra-ui/react";
import {
  FiHome,
  FiTrendingUp,
  FiCompass,
  FiStar,
  FiSettings,
  FiMenu,
  FiBell,
  FiChevronDown,
} from "react-icons/fi";
import { IconType } from "react-icons";
import { ReactText } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { radiusStyle } from "../constants/applicationConstants";
import { usePathname, useRouter } from "next/navigation";

const MotionBox = motion(Box);

interface LinkItemProps {
  name: string;
  icon: IconType;
  link: string;
  children: LinkItemProps[];
}

interface NavItemProps extends FlexProps {
  data: LinkItemProps;
  mode: boolean;
}

interface MobileProps extends FlexProps {
  onOpen: () => void;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

const LinkItems: Array<LinkItemProps> = [
  { name: "Home", icon: FiHome, link: "/home", children: [] },
  { name: "Projects Manager", icon: FiTrendingUp, link: "/projects-manager", children: [] },
  { name: "Teams", icon: FiCompass, link: "/teams", children: [] },
  { name: "File Archives", icon: FiStar, link: "/file-archives", children: [] },
  { name: "Settings", icon: FiSettings, link: "/settings", children: [] },
];

export default function SidebarWithHeader({
  children,
}: {
  children: ReactNode;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <Box minH="100vh" bg={useColorModeValue("gray.100", "gray.900")}>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: "none", md: "block" }}
      />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
      {/* mobilenav */}
      <MobileNav onOpen={onOpen} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Container
          as={Stack}
          maxW={"container.xl"}
          pb={12}
          pt={2}
          minH={"100vh"}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.4,
                ease: "easeInOut"
              }}
              key={usePathname()}
            >
              {children}
            </MotionBox>
          </AnimatePresence>
        </Container>
      </Box>
    </Box>
  );
}

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const [mode, setMode] = useState(false);

  return (
    <Box
      transition="3s ease"
      bg={useColorModeValue("white", "gray.900")}
      borderRight="1px"
      borderRightColor={useColorModeValue("gray.200", "gray.700")}
      w={{ base: "full", md: mode ? 20 : 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
          {!mode && "KOBRA"}
        </Text>
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>
      <VStack spacing={1} align="stretch" px={4}>
        {LinkItems.map((link) => (
          <NavItem key={link.name} data={link} mode={mode} />
        ))}
      </VStack>
    </Box>
  );
};

const NavItem = ({ data, mode, ...rest }: NavItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = data.children && data.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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

    // Reset loading state when pathname changes (navigation complete)
    setIsNavigating(false);
  }, [pathname]);

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
            bgGradient: "linear(to-r, secondary.500, secondary.600)",
            pl: mode ? "4" : "5",
            boxShadow: "md",
          }}
          bgGradient={
            IsActiveNav
              ? "linear(to-r, secondary.500, secondary.600)"
              : "linear(to-r, transparent, transparent)"
          }
          color={
            IsActiveNav
              ? "white"
              : useColorModeValue("gray.900", "gray.100")
          }
          justifyContent={"center"}
          onClick={handleNavigation}
          {...rest}
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

const MobileNav = ({ onOpen, ...rest }: MobileProps) => {
  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 4 }}
      height="20"
      alignItems="center"
      bg={useColorModeValue("white", "gray.900")}
      borderBottomWidth="1px"
      borderBottomColor={useColorModeValue("gray.200", "gray.700")}
      justifyContent={{ base: "space-between", md: "flex-end" }}
      {...rest}
    >
      <IconButton
        display={{ base: "flex", md: "none" }}
        onClick={onOpen}
        variant="outline"
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Text
        display={{ base: "flex", md: "none" }}
        fontSize="2xl"
        fontFamily="monospace"
        fontWeight="bold"
      >
        KOBRA
      </Text>

      <HStack spacing={{ base: "0", md: "6" }}>
        <IconButton
          size="lg"
          variant="ghost"
          aria-label="open menu"
          icon={<FiBell />}
        />
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
                  src={
                    "https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                  }
                />
                <VStack
                  display={{ base: "none", md: "flex" }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">Justina Clark</Text>
                  <Text fontSize="xs" color="gray.600">
                    Admin
                  </Text>
                </VStack>
                <Box display={{ base: "none", md: "flex" }}>
                  <FiChevronDown />
                </Box>
              </HStack>
            </MenuButton>
            <MenuList
              bg={useColorModeValue("white", "gray.900")}
              borderColor={useColorModeValue("gray.200", "gray.700")}
            >
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Billing</MenuItem>
              <MenuDivider />
              <MenuItem>Sign out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </HStack>
    </Flex>
  );
};
