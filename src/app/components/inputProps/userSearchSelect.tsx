"use client";

import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  Stack,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import { FiMinusCircle, FiPlusCircle } from "react-icons/fi";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { UsersResponse } from "@/app/services/useUsers";

interface UserSearchSelectProps {
  selectedUserCode: string | undefined | null;
  onUserSelect: (user: UsersResponse | null) => void;
  usersData: UsersResponse[];
  editMode?: boolean;
}

function UserSearchSelect({
  selectedUserCode,
  onUserSelect,
  usersData,
  editMode = false,
}: UserSearchSelectProps) {
  const { colorMode } = useColorMode();

  return (
    <Flex as={Stack} w="full" pt={2}>
      {usersData.map((user, index) => (
        <Flex
          key={index}
          bg={colorMode == "light" ? "gray.100" : "gray.700"}
          // bg={"gray.100"}
          w="full"
          py={3}
          px={8}
          rounded={radiusStyle}
          boxShadow="md"
          as={HStack}
          spacing={8}
        >
          <Box>
            <Avatar name={user.nama} src={user.profilePict ?? ""} />
          </Box>
          <Box>
            <Stack spacing={0}>
              <Text fontWeight={600}>
                {user.nama} 
              </Text>
              <Text fontWeight={500} fontSize="small" color="gray.600">
                {user.userId} | {user.email}
              </Text>
            </Stack>
          </Box>
          <Spacer />
          {selectedUserCode == user.userId ? (
            <>
              <Badge colorScheme={"secondary"} rounded={radiusStyle} px={2}>
                Selected
              </Badge>
              {editMode && (
                <Button
                  rounded={radiusStyle}
                  colorScheme="red"
                  size="sm"
                  onClick={() => onUserSelect(null)}
                >
                  <FiMinusCircle />
                </Button>
              )}
            </>
          ) : (
            <Button
              rounded={radiusStyle}
              colorScheme="green"
              size="sm"
              leftIcon={<FiPlusCircle />}
              onClick={() => onUserSelect(user)}
            >
              Tambah
            </Button>
          )}
        </Flex>
      ))}
    </Flex>
  );
}

export default UserSearchSelect;
