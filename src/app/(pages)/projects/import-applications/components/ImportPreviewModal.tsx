"use client";

import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Alert,
  AlertIcon,
  useColorMode,
} from "@chakra-ui/react";

interface ImportedData {
  requiredFlags: Record<string, string>;
  fieldKeys: Record<string, string>;
  dataRows: Record<string, any>[];
}

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ImportedData;
  onImport: (data: ImportedData) => void;
}

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  onImport,
}) => {
  const { colorMode } = useColorMode();

  const handleConfirm = () => {
    onImport(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg={colorMode === "light" ? "white" : "gray.800"}>
        <ModalHeader>Import Preview</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Alert status="info" mb={4}>
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Ready to Import</Text>
              <Text fontSize="sm">
                Found {data?.dataRows?.length || 0} applications to import
              </Text>
            </Box>
          </Alert>
          
          <Text fontSize="sm" color="gray.500">
            This is a preview of your import. Click "Confirm Import" to proceed.
          </Text>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleConfirm}>
            Confirm Import
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ImportPreviewModal;
