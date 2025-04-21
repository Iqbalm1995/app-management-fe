"use client";

import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";
import { radiusStyle } from "../constants/applicationConstants";
import { FiCheck, FiX } from "react-icons/fi";

export function ConfirmationDialog({
  isOpenTrigger,
  action,
  trigger,
  questionMsg,
  captionMsg,
}: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = useRef<HTMLButtonElement | null>(null);

  // Use useEffect to trigger onOpen when isOpenTrigger changes
  useEffect(() => {
    if (isOpenTrigger) {
      onOpen();
      trigger(false);
    }
  }, [isOpenTrigger, onOpen]);

  return (
    <>
      <Modal
        closeOnOverlayClick={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay bg="blackAlpha.500" backdropFilter="blur(8px)" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={useColorModeValue("white", "gray.900")}
        >
          <ModalHeader>{captionMsg}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text whiteSpace="pre-line">{questionMsg}</Text>
          </ModalBody>
          <ModalFooter>
            <Button leftIcon={<FiX />} ref={initialRef} onClick={onClose}>
              Close
            </Button>
            <Button
              leftIcon={<FiCheck />}
              colorScheme="secondary"
              onClick={() => {
                onClose();
                action();
              }}
              ml={3}
            >
              Yes, {captionMsg}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
