"use client";

import {
  HeaderContent,
  HeaderContentProps,
} from "@/app/components/headerContent";
import SidebarWithHeader from "@/app/components/sidebar";
import { radiusStyle } from "@/app/constants/applicationConstants";
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Flex,
  Grid,
  GridItem,
  Icon,
  Image,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { AiFillFileExcel, AiFillFilePdf, AiFillFileWord } from "react-icons/ai";
import { FaFileAlt } from "react-icons/fa";
import { truncateText } from "../helper/MasterHelper";

export interface FileDetails {
  name: string;
  extension: string;
  size: number;
  file: File; // Adding the file object itself for multipart upload
}

export function DropZoneComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<FileDetails[]>([]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [], // Accept all images
      "application/pdf": [], // Accept PDFs
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [], // XLSX
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [], // DOCX
    },
    onDrop: (acceptedFiles) => {
      setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
    },
  });

  const handleUpload = () => {
    const fileDetails = files.map((file) => {
      const fileParts = file.name.split(".");
      const extension =
        fileParts.length > 1 ? fileParts[fileParts.length - 1] : "";

      return {
        name: fileParts[0], // Raw name without extension
        extension,
        size: file.size, // File size in bytes
        file, // Add the actual file object
      };
    });

    setUploadedFiles(fileDetails);

    // Prepare FormData for API payload
    const formData = new FormData();
    uploadedFiles.forEach((uploadedFile) => {
      formData.append("files", uploadedFile.file); // Append file objects to FormData
    });

    // Log for debugging
    console.log("Form Data Payload:", formData);
    console.log("Uploaded Files:", fileDetails);

    // This formData is ready to be sent to an API endpoint using Axios or Fetch
    // Example with Axios: axios.post('/upload', formData)
  };

  const renderFileIcon = (file: File) => {
    const ext = file.name.split(".").pop();
    switch (ext) {
      case "pdf":
        return <Icon as={AiFillFilePdf} w={12} h={12} color="red.500" />;
      case "xlsx":
        return <Icon as={AiFillFileExcel} w={12} h={12} color="green.500" />;
      case "docx":
        return <Icon as={AiFillFileWord} w={12} h={12} color="blue.500" />;
      default:
        return <Icon as={FaFileAlt} w={12} h={12} color="gray.500" />;
    }
  };

  return (
    <Flex
      p={4}
      as={VStack}
      spacing={4}
      w={"full"}
      justifyContent={"start"}
      alignItems={"start"}
    >
      {/* Upload area */}
      <Flex
        {...getRootProps()}
        p={6}
        border={"3px dashed"}
        rounded={radiusStyle}
        cursor={"pointer"}
        bg={"gray.50"}
        textAlign={"center"}
        color={"primary.300"}
        _hover={{
          bg: "primary.50",
          color: "primary.400",
        }}
        w={"full"}
        minH={"200px"} // Set a minimum height for better UX
        justifyContent={"center"} // Center the content horizontally
        alignItems={"center"} // Center the content vertically
      >
        <input {...getInputProps()} />
        <Text fontSize="xl" fontWeight={"semibold"} color="gray.600">
          Drag & drop files here, or click to select files
        </Text>
      </Flex>

      {/* Preview grid */}
      <Grid templateColumns="repeat(4, 1fr)" gap={2} w={"full"}>
        {files.map((file, index) => (
          <GridItem
            colSpan={{ base: 4, sm: 4, md: 1, lg: 1 }}
            key={index}
            w={"full"}
          >
            <Tooltip
              hasArrow
              label={file.name}
              bg={"primary.300"}
              color={"primary.900"}
              placement={"auto-start"}
              rounded={radiusStyle}
            >
              <Box
                border={"1px solid"}
                borderColor={"gray.300"}
                p={2}
                rounded={radiusStyle}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                // boxSize="130px" // Adjust size for better alignment
                w={"full"}
                boxShadow={"md"}
              >
                {file.type.startsWith("image/") ? (
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    boxSize="120px"
                    objectFit="contain" // Center the image inside the box
                    rounded={radiusStyle}
                  />
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    boxSize="120px"
                  >
                    {renderFileIcon(file)}
                  </Box>
                )}
                <Text fontSize="sm" mt={2} textAlign="center">
                  {truncateText(file.name, 20)}
                </Text>
              </Box>
            </Tooltip>
          </GridItem>
        ))}
      </Grid>
      {/* Upload Button */}
      <Flex w={"full"} justifyContent={"end"}>
        <Button colorScheme="blue" onClick={handleUpload}>
          Upload Files
        </Button>
      </Flex>
    </Flex>
  );
}
