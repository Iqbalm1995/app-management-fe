"use client";

import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure,
  HStack,
  StackDivider,
  Container,
  Image,
  Tooltip,
  Avatar,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorMode,
  shouldForwardProp,
  chakra,
} from "@chakra-ui/react";
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MoonIcon,
  SunIcon,
} from "@chakra-ui/icons";
import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { NAV_ITEMS_LANDING, NavItem } from "../constants/navigationData";
import { useAuth } from "../context/AuthContext";
import {
  DELAY_ZERO,
  LINK_MENU_HOME,
  radiusStyle,
} from "../constants/applicationConstants";
import { LogoApplications } from "./logoApps";
import { FiChevronDown } from "react-icons/fi";
import { truncateToTwoWords } from "../helper/MasterHelper";
import { RiHomeLine } from "react-icons/ri";
import { MdPassword } from "react-icons/md";
import { FaPowerOff } from "react-icons/fa6";
import AuthPanelModal from "../(pages)/landing/authForm";
import { AuthDataResponse } from "../services/useAuthentications";

export default function TopNavigationLanding() {
  const { isOpen, onToggle } = useDisclosure();
  const [scrollY, setScrollY] = useState(0);
  //   const { logout, isLoading, error } = useLogin();
  const { isAuthenticated, authData, goLogout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  useEffect(() => {
    if (authData.dataLogin != null) {
      const authGet: AuthDataResponse = authData.dataLogin as AuthDataResponse;
      setDataAuth(authGet);
    }
  }, [authData]);

  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const logoutAuthAction = async () => {
    setTimeout(() => {
      goLogout();
    }, DELAY_ZERO); // 2-second delay
  };

  return (
    <Box
      // position={"fixed"}
      top={0}
      left={0}
      right={0}
      width="100%"
      zIndex={10}
      transition={"0.2s ease"}
    >
      {/* <pre>{JSON.stringify(authData, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(isAuthenticated, null, 2)}</pre> */}
      <Container as={Stack} maxW={"container.xl"}>
        <Flex
          // backdropFilter={scrollY > 0 ? "blur(20px)" : "none"} // Apply Gaussian blur in light mode
          transition="0.2s ease"
          minH={"65px"}
          py={{ base: 2 }}
          align={"center"}
          pos={"relative"}
          // bg={
          //   scrollY > 0 ? useColorModeValue("white", "gray.900") : "transparent"
          // }
          // bg={useColorModeValue("white", "gray.900")}
          // boxShadow={scrollY > 0 ? "xl" : "none"}
          // boxShadow={"xl"}
          px={4}
          rounded={radiusStyle}
        >
          <Flex
            flex={{ base: 1, md: "auto" }}
            ml={{ base: -2 }}
            display={{ base: "flex", md: "none" }}
          >
            <IconButton
              onClick={onToggle}
              icon={
                isOpen ? (
                  <CloseIcon w={3} h={3} />
                ) : (
                  <HamburgerIcon w={5} h={5} />
                )
              }
              variant={"ghost"}
              aria-label={"Toggle Navigation"}
              colorScheme={scrollY > 0 ? "primary" : "white"}
            />
          </Flex>
          {/* Logo Apps */}
          <>
            <LogoApplications
              colorText={scrollY > 0 ? "primary.500" : "primary.700"}
            />
          </>
          <Flex
            flex={{ base: 1 }}
            justify={{ base: "center", md: "end" }}
            pr={5}
          >
            <Flex display={{ base: "none", md: "flex" }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>
          <Stack
            flex={{ base: 1, md: 0 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={6}
          >
            <Flex alignItems={"center"}>
              <Button
                variant={"ghost"}
                // color={"white"}
                // _hover={{
                //   bg: "whiteAlpha",
                // }}
                onClick={toggleColorMode}
              >
                {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              </Button>
            </Flex>

            {isAuthenticated ? (
              <Flex alignItems={"center"}>
                <Menu>
                  <MenuButton
                    py={2}
                    transition="all 0.3s"
                    _focus={{ boxShadow: "none" }}
                  >
                    <HStack>
                      <Avatar
                        size={"md"}
                        color={"white"}
                        bgGradient={
                          "linear(to-br, primary.500, secondary.500 40%, yellow.500)"
                        }
                        // src={"/img/default-user-img.jpg"}
                        name={DataAuth?.firstName}
                        boxShadow={"md"}
                      />
                      <Box
                        color={"gray.800"}
                        display={{ base: "none", md: "flex" }}
                      >
                        <FiChevronDown />
                      </Box>
                    </HStack>
                  </MenuButton>
                  <MenuList
                    color={colorMode == "light" ? "gray.800" : "white"}
                    bg={colorMode == "light" ? "white" : "gray.900"}
                    rounded={radiusStyle}
                  >
                    <MenuItem
                      color={colorMode == "light" ? "gray.800" : "white"}
                      bg={colorMode == "light" ? "white" : "gray.900"}
                      _hover={{
                        bg: colorMode == "light" ? "gray.100" : "gray.700",
                        color: colorMode == "light" ? "gray.900" : "white",
                      }}
                      rounded={radiusStyle}
                    >
                      <VStack
                        w={"full"}
                        h={"full"}
                        spacing={1}
                        align={"start"}
                        p={1}
                      >
                        <Text
                          color={
                            colorMode == "light"
                              ? "secondary.900"
                              : "secondary.200"
                          }
                          fontSize={"sm"}
                          fontWeight={700}
                        >
                          {DataAuth && truncateToTwoWords(DataAuth.firstName)}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={colorMode == "light" ? "gray.600" : "gray.100"}
                        >
                          {(DataAuth && DataAuth.teamRole?.teamRoleName) ||
                            (DataAuth && DataAuth.role.roleName)}
                        </Text>
                      </VStack>
                    </MenuItem>
                    <MenuDivider />
                    <Link href={LINK_MENU_HOME}>
                      <MenuItem
                        icon={<RiHomeLine />}
                        color={colorMode == "light" ? "gray.800" : "white"}
                        bg={colorMode == "light" ? "white" : "gray.900"}
                        _hover={{
                          bg: colorMode == "light" ? "gray.100" : "gray.700",
                          color: colorMode == "light" ? "gray.900" : "white",
                        }}
                        rounded={radiusStyle}
                      >
                        Home
                      </MenuItem>
                    </Link>
                    <Link href={`#`}>
                      <MenuItem
                        icon={<MdPassword />}
                        color={colorMode == "light" ? "gray.800" : "white"}
                        bg={colorMode == "light" ? "white" : "gray.900"}
                        _hover={{
                          bg: colorMode == "light" ? "gray.100" : "gray.700",
                          color: colorMode == "light" ? "gray.900" : "white",
                        }}
                        rounded={radiusStyle}
                      >
                        Ganti Password
                      </MenuItem>
                    </Link>
                    <MenuItem
                      icon={<FaPowerOff />}
                      color={colorMode == "light" ? "gray.800" : "white"}
                      bg={colorMode == "light" ? "white" : "gray.900"}
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
            ) : (
              <AuthPanelModal />
            )}
            {/* <AuthPanelModal /> */}
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </Container>
    </Box>
  );
}

const DesktopNav = () => {
  const { colorMode } = useColorMode();
  return (
    <Stack direction={"row"} spacing={4}>
      {NAV_ITEMS_LANDING.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
              <Box
                as="a"
                p={2}
                href={navItem.href ?? "#"}
                fontSize={"md"}
                fontWeight={600}
                color={colorMode == "light" ? "primary.800" : "white"}
                _hover={{
                  textDecoration: "none",
                  color: colorMode == "light" ? "primary.900" : "gray.100",
                }}
              >
                {navItem.label}
              </Box>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                bg={"white"}
                p={4}
                rounded={"xl"}
                minW={"sm"}
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
  return (
    <Box
      as="a"
      href={href}
      role={"group"}
      display={"block"}
      p={2}
      rounded={"md"}
      _hover={{
        bg: "blue.50",
      }}
    >
      <Stack direction={"row"} align={"center"}>
        <Box>
          <Text
            transition={"all .3s ease"}
            _groupHover={{ color: "secondary.400" }}
            fontWeight={500}
            color={"gray.800"}
          >
            {label}
          </Text>
          <Text
            fontSize={"sm"}
            color={"gray.400"}
            transition={"all .3s ease"}
            _groupHover={{ color: "gray.800" }}
          >
            {subLabel}
          </Text>
        </Box>
        <Flex
          transition={"all .3s ease"}
          transform={"translateX(-10px)"}
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify={"flex-end"}
          align={"center"}
          flex={1}
        >
          <Icon color={"secondary.400"} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </Box>
  );
};

const MobileNav = () => {
  return (
    <Stack
      p={4}
      display={{ md: "none" }}
      mb={"60px"}
      bg={"white"}
      rounded={"xl"}
    >
      {NAV_ITEMS_LANDING.map((navItem, idx) => (
        <MobileNavItem key={idx} {...navItem} />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Stack spacing={4} onClick={children && onToggle}>
      <Box
        py={2}
        as="a"
        href={href ?? "#"}
        justifyContent="space-between"
        alignItems="center"
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text
          fontWeight={600}
          // color={useColorModeValue("gray.600", "gray.200")}
          color={"secondary.800"}
        >
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
            color={"secondary.800"}
          />
        )}
      </Box>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack
          pl={4}
          borderLeft={1}
          borderStyle={"solid"}
          borderColor={"secondary.800"}
          align={"start"}
        >
          {children &&
            children.map((child) => (
              <Box
                color={"secondary.800"}
                as="a"
                key={child.label}
                href={child.href}
              >
                {child.label}
              </Box>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  );
};
