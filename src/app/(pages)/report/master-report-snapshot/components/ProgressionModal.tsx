import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Progress,
  VStack,
  HStack,
  Text,
  Box,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState, useEffect } from "react";

interface ProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isExecuting: boolean;
  progress: {
    current: number;
    total: number;
    elapsedSeconds: number;
  };
  error: string | null;
}

export function ProgressionModal({
  isOpen,
  onClose,
  onConfirm,
  isExecuting,
  progress,
  error,
}: ProgressionModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(true);

  useEffect(() => {
    if (isExecuting) {
      setShowConfirmation(false);
    }
  }, [isExecuting]);

  const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleConfirm = async () => {
    await onConfirm();
  };

  const handleClose = () => {
    if (!isExecuting) {
      setShowConfirmation(true);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered closeOnEsc={!isExecuting} closeOnOverlayClick={!isExecuting}>
      <ModalOverlay />
      <ModalContent>
        {showConfirmation && !isExecuting ? (
          <>
            <ModalHeader>Bulk Progression Update</ModalHeader>
            <ModalBody>
              <VStack spacing={4} align="start">
                <Text>
                  Are you sure you want to execute bulk progression update?
                </Text>
                <Text fontSize="sm" color="gray.600">
                  This will update all active projects and may take several
                  minutes.
                </Text>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleConfirm}>
                Confirm
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>Bulk Progression Update - In Progress</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <Box width="100%">
                  <HStack justify="space-between" mb={2}>
                    <Text fontSize="sm">
                      Processing: {progress.current}/{progress.total} projects
                    </Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {Math.round(percentage)}%
                    </Text>
                  </HStack>
                  <Progress
                    value={percentage}
                    size="lg"
                    colorScheme="blue"
                    borderRadius="md"
                  />
                </Box>
                <HStack width="100%" justify="space-between">
                  <Text fontSize="sm">
                    Elapsed: {formatTime(progress.elapsedSeconds)}
                  </Text>
                </HStack>
                {error && (
                  <Box
                    p={3}
                    bg="red.50"
                    borderRadius="md"
                    borderLeft="4px"
                    borderColor="red.500"
                    width="100%"
                  >
                    <Text fontSize="sm" color="red.700">
                      {error}
                    </Text>
                  </Box>
                )}
              </VStack>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
