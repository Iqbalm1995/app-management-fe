"use client";

import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Progress,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import { radiusStyle } from "../constants/applicationConstants";
import { FiCheck, FiTrash2, FiX } from "react-icons/fi";

export interface ConfirmationDialogProps {
  isOpenTrigger: boolean;
  action: () => void | Promise<void>;
  trigger: (val: boolean) => void;
  questionMsg: string;
  captionMsg: string;
  requireHold?: boolean;
  holdDurationSeconds?: number;
  isLoading?: boolean;
  colorScheme?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
}

export function ConfirmationDialog({
  isOpenTrigger,
  action,
  trigger,
  questionMsg,
  captionMsg,
  requireHold = false,
  holdDurationSeconds = 5,
  isLoading = false,
  colorScheme = "secondary",
  confirmButtonText,
  cancelButtonText = "Close",
}: ConfirmationDialogProps | any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef<HTMLButtonElement | null>(null);
  const { colorMode } = useColorMode();

  // Hold-to-confirm states
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [holdRemaining, setHoldRemaining] = useState(holdDurationSeconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredActionRef = useRef(false);

  // Sync open state
  useEffect(() => {
    if (isOpenTrigger) {
      hasTriggeredActionRef.current = false;
      setHoldProgress(0);
      setIsHolding(false);
      setHoldRemaining(holdDurationSeconds);
      onOpen();
      trigger(false);
    }
  }, [isOpenTrigger, onOpen, holdDurationSeconds, trigger]);

  // Cleanup on unmount or close
  const cleanupHold = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
    setHoldRemaining(holdDurationSeconds);
  };

  const handleModalClose = () => {
    cleanupHold();
    onClose();
  };

  const startHold = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (isLoading || hasTriggeredActionRef.current) return;

    setIsHolding(true);
    const startTime = Date.now();
    const durationMs = holdDurationSeconds * 1000;

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / durationMs) * 100, 100);
      const remaining = Math.max((durationMs - elapsed) / 1000, 0);

      setHoldProgress(progress);
      setHoldRemaining(remaining);

      if (elapsed >= durationMs) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setIsHolding(false);
        setHoldProgress(100);
        setHoldRemaining(0);
        hasTriggeredActionRef.current = true;
        // Hold is complete! Execute action
        action();
      }
    }, 40);
  };

  const stopHold = () => {
    if (hasTriggeredActionRef.current) return;
    cleanupHold();
  };

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={handleModalClose}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(8px)" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode === "light" ? "white" : "gray.900"}
        >
          <ModalHeader>{captionMsg}</ModalHeader>
          <ModalCloseButton isDisabled={isLoading || isHolding} />
          <ModalBody>
            <Text whiteSpace="pre-line">{questionMsg}</Text>

            {requireHold && (
              <Box
                mt={4}
                p={3.5}
                rounded="lg"
                bg={colorMode === "light" ? "red.50" : "whiteAlpha.50"}
                border="1px solid"
                borderColor={colorMode === "light" ? "red.200" : "red.800"}
              >
                <HStack justify="space-between" mb={1.5}>
                  <Text fontSize="2xs" fontWeight="bold" color={isHolding ? "red.500" : "gray.500"}>
                    {isLoading
                      ? "Sedang memproses..."
                      : isHolding
                      ? `Menahan tombol... (${holdRemaining.toFixed(1)}s)`
                      : `Tekan dan tahan tombol selama ${holdDurationSeconds} detik`}
                  </Text>
                  <Text fontSize="2xs" fontWeight="extrabold" color={isHolding ? "red.500" : "gray.500"}>
                    {Math.round(holdProgress)}%
                  </Text>
                </HStack>
                <Progress
                  value={holdProgress}
                  size="sm"
                  colorScheme={colorScheme || "red"}
                  rounded="full"
                  hasStripe={isHolding}
                  isAnimated={isHolding}
                />
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              leftIcon={<FiX />}
              ref={initialRef}
              onClick={handleModalClose}
              isDisabled={isLoading || isHolding}
              variant="outline"
              size="sm"
              rounded="md"
            >
              {cancelButtonText}
            </Button>

            {requireHold ? (
              <Button
                leftIcon={isLoading ? undefined : <FiTrash2 />}
                colorScheme={colorScheme || "red"}
                isLoading={isLoading}
                loadingText="Menghapus..."
                isDisabled={isLoading}
                onMouseDown={startHold}
                onMouseUp={stopHold}
                onMouseLeave={stopHold}
                onTouchStart={startHold}
                onTouchEnd={stopHold}
                onContextMenu={(e) => e.preventDefault()}
                userSelect="none"
                size="sm"
                rounded="md"
                ml={3}
                cursor={isLoading ? "not-allowed" : "pointer"}
                transition="all 0.1s ease"
                _active={{ transform: "scale(0.98)" }}
              >
                {isLoading
                  ? "Menghapus..."
                  : isHolding
                  ? `Tahan... (${holdRemaining.toFixed(1)}s)`
                  : confirmButtonText || `Tahan ${holdDurationSeconds}s untuk Konfirmasi`}
              </Button>
            ) : (
              <Button
                leftIcon={<FiCheck />}
                colorScheme={colorScheme}
                onClick={() => {
                  onClose();
                  action();
                }}
                ml={3}
                size="sm"
                rounded="md"
              >
                {confirmButtonText || `Yes, ${captionMsg}`}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
