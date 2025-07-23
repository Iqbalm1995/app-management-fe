"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Badge,
  Stack,
  IconButton,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Tooltip,
} from "@chakra-ui/react";
import { FiBell, FiCheck, FiTrash2, FiMoreVertical } from "react-icons/fi";
import useNotifications, { NotificationResponse } from "../services/useNotifications";
import { useAuth } from "../context/AuthContext";
import { RES_CODE_OK } from "../constants/applicationConstants";
import { useToastHelper } from "../helper/ToastMessagesHelper";

const NotificationExample: React.FC = () => {
  const { authData } = useAuth();
  const { showToast } = useToastHelper();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  
  const {
    GetUserNotifications,
    UpdateNotification,
    BulkUpdateNotifications,
    DeleteNotification,
    isLoading: serviceLoading,
    error: serviceError,
  } = useNotifications();

  // Fetch notifications on component mount
  useEffect(() => {
    if (authData.dataAuth?.apiKey && authData.dataLogin) {
      fetchNotifications();
    }
  }, [authData]);

  // Update unread count whenever notifications change
  useEffect(() => {
    const count = notifications.filter(notification => !notification.isRead).length;
    setUnreadCount(count);
  }, [notifications]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    setIsLoading(true);
    
    try {
      const userId = (authData.dataLogin as any)?.id;
      const token = authData.dataAuth?.apiKey as string;
      
      if (!userId || !token) {
        showToast({
          description: "User information not available",
          statusToast: "error",
        });
        return;
      }
      
      const response = await GetUserNotifications(userId, token);
      
      if (response?.statusCode === RES_CODE_OK && response.data) {
        setNotifications(response.data);
      } else {
        showToast({
          description: response?.message || "Failed to fetch notifications",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while fetching notifications",
        statusToast: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (id: string) => {
    try {
      const token = authData.dataAuth?.apiKey as string;
      
      const response = await UpdateNotification(
        { id, isRead: true },
        token
      );
      
      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === id 
              ? { ...notification, isRead: true } 
              : notification
          )
        );
        
        showToast({
          description: "Notification marked as read",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to update notification",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while updating notification",
        statusToast: "error",
      });
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = authData.dataAuth?.apiKey as string;
      const userId = (authData.dataLogin as any)?.id;
      
      const response = await BulkUpdateNotifications(
        { userIds: [userId], isRead: true },
        token
      );
      
      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, isRead: true }))
        );
        
        showToast({
          description: "All notifications marked as read",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to update notifications",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while updating notifications",
        statusToast: "error",
      });
    }
  };

  // Delete a notification
  const deleteNotification = async (id: string) => {
    try {
      const token = authData.dataAuth?.apiKey as string;
      
      const response = await DeleteNotification(id, token);
      
      if (response?.statusCode === RES_CODE_OK) {
        // Update local state
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        
        showToast({
          description: "Notification deleted",
          statusToast: "success",
        });
      } else {
        showToast({
          description: response?.message || "Failed to delete notification",
          statusToast: "error",
        });
      }
    } catch (error) {
      showToast({
        description: "An error occurred while deleting notification",
        statusToast: "error",
      });
    }
  };

  // Get badge color based on notification type
  const getNotificationTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INFO':
        return 'blue';
      case 'WARNING':
        return 'orange';
      case 'ERROR':
        return 'red';
      case 'SUCCESS':
        return 'green';
      default:
        return 'gray';
    }
  };

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading size="md">Notifications</Heading>
        
        <Menu>
          <Tooltip label={`${unreadCount} unread notifications`} isDisabled={unreadCount === 0}>
            <MenuButton
              as={IconButton}
              icon={
                <>
                  <FiBell />
                  {unreadCount > 0 && (
                    <Badge
                      colorScheme="red"
                      borderRadius="full"
                      position="absolute"
                      top="-2px"
                      right="-2px"
                      fontSize="xs"
                      minW="1.5em"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </>
              }
              variant="outline"
              aria-label="Notifications"
              position="relative"
            />
          </Tooltip>
          <MenuList maxH="400px" overflowY="auto" minW="320px">
            <Flex px={4} py={2} justifyContent="space-between" alignItems="center">
              <Text fontWeight="bold">Notifications</Text>
              {unreadCount > 0 && (
                <Button size="xs" onClick={markAllAsRead} leftIcon={<FiCheck />}>
                  Mark all as read
                </Button>
              )}
            </Flex>
            <MenuDivider />
            
            {isLoading || serviceLoading ? (
              <Flex justifyContent="center" py={4}>
                <Spinner />
              </Flex>
            ) : notifications.length === 0 ? (
              <Box py={4} textAlign="center">
                <Text color="gray.500">No notifications</Text>
              </Box>
            ) : (
              notifications.map((notification) => (
                <MenuItem key={notification.id} py={3} px={4} _hover={{ bg: 'gray.50' }}>
                  <Stack spacing={1} width="100%">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Badge colorScheme={getNotificationTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {formatDate(notification.createdAt)}
                      </Text>
                    </Flex>
                    <Text fontWeight={notification.isRead ? 'normal' : 'bold'}>
                      {notification.title}
                    </Text>
                    <Text fontSize="sm" noOfLines={2}>
                      {notification.message}
                    </Text>
                    <Flex justifyContent="flex-end" gap={2} mt={1}>
                      {!notification.isRead && (
                        <IconButton
                          aria-label="Mark as read"
                          icon={<FiCheck />}
                          size="xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        />
                      )}
                      <IconButton
                        aria-label="Delete notification"
                        icon={<FiTrash2 />}
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      />
                    </Flex>
                  </Stack>
                </MenuItem>
              ))
            )}
            
            <MenuDivider />
            <Box py={2} px={4} textAlign="center">
              <Button size="sm" onClick={fetchNotifications} isLoading={isLoading || serviceLoading}>
                Refresh
              </Button>
            </Box>
          </MenuList>
        </Menu>
      </Flex>

      {serviceError && (
        <Box bg="red.50" p={3} borderRadius="md" mb={4}>
          <Text color="red.500">{serviceError}</Text>
        </Box>
      )}
    </Box>
  );
};

export default NotificationExample;
