"use client";

import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorMode,
  useDisclosure
} from '@chakra-ui/react';
import { FiInfo } from 'react-icons/fi';
import { BacklogDataResponse } from '@/app/services/useRequirements';
import { radiusStyle } from '@/app/constants/applicationConstants';

interface AdditionalInfoUpdateProps {
  idInput: string;
  dataSource: BacklogDataResponse;
  updateBacklog: (backlogId: string, updatedData: BacklogDataResponse) => void;
}

const AdditionalInfoUpdate = ({
  idInput,
  dataSource,
  updateBacklog,
}: AdditionalInfoUpdateProps) => {
  const { colorMode } = useColorMode();
  // Additional form
  const AdditionalForm = useDisclosure();
  const [backlogDetail, setBacklogDetail] =
    useState<BacklogDataResponse>(dataSource);

  const OpenAdditionalFormBacklog = () => {
    AdditionalForm.onOpen();
  };

  // State for form inputs
  const [formInputs, setFormInputs] = useState({
    envSide: dataSource.envSide || "",
    maintenanceCategory: dataSource.maintenanceCategory || "",
    maintenanceType: dataSource.maintenanceType || "",
    rppb: dataSource.rppb || "",
    licensing: dataSource.licensing || ""
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormInputs({
      ...formInputs,
      [name]: value
    });
  };

  // Save changes
  const handleSaveChanges = () => {
    const updatedBacklog = {
      ...backlogDetail,
      ...formInputs
    };
    
    setBacklogDetail(updatedBacklog);
    updateBacklog(updatedBacklog.id, updatedBacklog);
    AdditionalForm.onClose();
  };

  return (
    <Box>
      <Button
        onClick={() => {
          OpenAdditionalFormBacklog();
        }}
        colorScheme="secondary"
        size="xs"
      >
        <FiInfo />
      </Button>

      <Modal
        size={"xl"}
        isOpen={AdditionalForm.isOpen}
        isCentered
        onClose={AdditionalForm.onClose}
        closeOnOverlayClick={true}
        scrollBehavior={"inside"}
      >
        <ModalOverlay bg="blackAlpha.300" />
        <ModalContent
          rounded={radiusStyle}
          m={2}
          bg={colorMode == "light" ? "white" : "gray.900"}
        >
          <ModalHeader>{`Additional Info Backlog`}</ModalHeader>
          <ModalCloseButton color={"red.500"} />
          <ModalBody w={"full"}>
            <Flex as={Stack} w={"full"} spacing={4}>
              <Divider />
              
              {/* Form inputs for additional fields */}
              <FormControl>
                <FormLabel>Environment Side</FormLabel>
                <Input 
                  name="envSide"
                  value={formInputs.envSide}
                  onChange={handleInputChange}
                  placeholder="Environment Side"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Maintenance Category</FormLabel>
                <Input 
                  name="maintenanceCategory"
                  value={formInputs.maintenanceCategory}
                  onChange={handleInputChange}
                  placeholder="Maintenance Category"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Maintenance Type</FormLabel>
                <Input 
                  name="maintenanceType"
                  value={formInputs.maintenanceType}
                  onChange={handleInputChange}
                  placeholder="Maintenance Type"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>RPPB</FormLabel>
                <Input 
                  name="rppb"
                  value={formInputs.rppb}
                  onChange={handleInputChange}
                  placeholder="RPPB"
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Licensing</FormLabel>
                <Input 
                  name="licensing"
                  value={formInputs.licensing}
                  onChange={handleInputChange}
                  placeholder="Licensing"
                />
              </FormControl>

              <Box
                overflowY={"auto"}
                overflowX={"auto"}
                maxH={"350px"}
                p={4}
                bgColor={"gray.200"}
                rounded={radiusStyle}
              >
                <Text fontWeight={600}>Data Backlog</Text>
                <pre>{JSON.stringify(dataSource, null, 2)}</pre>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveChanges}>
              Save Changes
            </Button>
            <Button variant="ghost" onClick={AdditionalForm.onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AdditionalInfoUpdate;
