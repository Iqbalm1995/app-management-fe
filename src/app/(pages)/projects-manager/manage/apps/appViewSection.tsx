"use client";

import { ConfirmationDialog } from "@/app/components/confirmationDialog";
import { InputLayoutFull } from "@/app/components/layoutContentBody";
import LoadingMiniSignature from "@/app/components/loadingMini";
import {
  DELAY_MEDIUM,
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  radiusStyle,
  RES_CODE_OK,
  RES_GENERIC_ERROR_MSG,
} from "@/app/constants/applicationConstants";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { buildUrlPort, generateUUIDV1 } from "@/app/helper/MasterHelper";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, {
  AppsResponse,
  AppsUpdateDataPayload,
  AppsUploadDataPayload,
} from "@/app/services/useProjects";
import { AttachmentProps, OptionListProps } from "@/app/types/masterTypes";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  HStack,
  Stack,
  Text,
  Wrap,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
  Image,
  useDisclosure,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Switch,
  StackDivider,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { useFormik } from "formik";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa6";
import { FiEdit3, FiRefreshCcw, FiSave, FiXCircle } from "react-icons/fi";
import * as Yup from "yup";
import { DropZoneComponent } from "@/app/components/dropzone";

const OptionDataProjectStatus: OptionListProps[] = [
  {
    label: "NEW",
    value: "NEW",
  },
  {
    label: "ACTIVE",
    value: "ACTIVE",
  },
  {
    label: "ON HOLD",
    value: "ONHOLD",
  },
  {
    label: "IN ACTIVE",
    value: "INACTIVE",
  },
];

const FormSchemaEditApps = Yup.object().shape({
  id: Yup.string().required("Required"),
  appShortName: Yup.string().required("Required"),
  appName: Yup.string().required("Required"),
  appsDesc: Yup.string().nullable(),
  note: Yup.string().nullable(),
  appsStatus: Yup.string().required("Required"),
  readyToLaunch: Yup.string().required("Required"),
});

const DefaultPathImg: string = "/img/default-comp-logo.png";

const AppInfromationSection = () => {
  const showToast = useToastHelper();
  const { colorMode } = useColorMode();
  const searchParams = useSearchParams();
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const {
    GetDetailAppsByProjectId,
    UpdateProjectsApps,
    UploadIconProjectsApps,
  } = useProjects();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const storedData = localStorage.getItem("authData");
  const tokenData: string = localStorage.getItem("tokenData") as string;
  useEffect(() => {
    if (DataAuth == null) {
      if (storedData) {
        const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
        const UserData: AuthDataResponse =
          StorageAuth.dataLogin as AuthDataResponse;
        setDataAuth(UserData);
      }
    }
  }, [DataAuth]);

  const [ProjectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    const projectId = searchParams.get("projectId");
    if (projectId) {
      setProjectId(projectId);
    }
  }, [searchParams]);

  const [DataApps, setDataApps] = useState<AppsResponse | null>(null);
  const [RefreshData, setRefreshData] = useState<number>(0);
  const [IsLoadingProcess, setIsLoadingProcess] = useState(false);
  const [ActionLoading, setActionLoading] = useState(false);
  const [IsEditMode, setIsEditMode] = useState(false);
  const [DataOptions1, setDataOptions1] = useState<OptionListProps[]>(
    OptionDataProjectStatus
  );

  const [openConfirmUpdateDialog, setOpenConfirmUpdateDialog] = useState(false);
  const [questionMsgDialog, setQuestionMsgDialog] = useState<string>("");
  const [captionDialog, setCaptionDialog] = useState<string>("");
  const [UpdatePayload, setUpdatePayload] =
    useState<AppsUpdateDataPayload | null>(null);

  const formik = useFormik<AppsUpdateDataPayload>({
    initialValues: {
      id: "",
      appShortName: "",
      appName: "",
      appsDesc: null,
      note: null,
      appsStatus: "INACTIVE",
      readyToLaunch: "N",
    },
    validationSchema: FormSchemaEditApps,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      await handleConfirmSaveData(values);
    },
  });

  const handleConfirmSaveData = async (data: AppsUpdateDataPayload) => {
    setCaptionDialog("Confirm Save");
    setQuestionMsgDialog(`Are you sure want update project info?`);
    setOpenConfirmUpdateDialog(true);
    setUpdatePayload(data);
  };

  const handleConfirmSaveDataTrigger = () => {
    setOpenConfirmUpdateDialog(!openConfirmUpdateDialog);
  };

  const handleUpdateData = async () => {
    setActionLoading(true);
    await delay(DELAY_MEDIUM);
    if (DataAuth && DataAuth.team && UpdatePayload) {
      await UpdateAppsServ();
      setIsEditMode(false);
    } else {
      showToast({
        description: "ID is invalid",
        statusToast: "error",
      });
      setActionLoading(false);
      setUpdatePayload(null);
      setIsEditMode(false);
    }
  };

  const UpdateAppsServ = async () => {
    if (UpdatePayload) {
      const requestData = await UpdateProjectsApps(UpdatePayload, tokenData);
      const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        return;
      } else {
        console.log(requestData);
        showToast({
          description: `Data apps update successfully`,
          statusToast: "success",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        setIsEditMode(false);
        RefreshAction();
        return;
      }
    }
  };

  const UpdateIconAppsServ = async () => {
    if (UpdateIconPayload) {
      await delay(DELAY_MEDIUM);
      const requestData = await UploadIconProjectsApps(
        UpdateIconPayload,
        tokenData
      );
      const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

      if (isErrorResponse || !requestData) {
        showToast({
          description: requestData?.message || RES_GENERIC_ERROR_MSG,
          statusToast: "error",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        return;
      } else {
        showToast({
          description: `Update icon apps  successfully`,
          statusToast: "success",
        });
        setIsLoadingProcess(false);
        setActionLoading(false);
        setIsEditMode(false);
        RefreshAction();
        return;
      }
    }
  };

  const RefreshAction = () => {
    setUpdatePayload(null);
    setRefreshData(RefreshData + 1);
    setUpdateIconPayload(null);
  };

  const [SelectedOption1, setSelectedOption1] =
    useState<OptionListProps | null>(null);
  const handleSelectedOption = (data: OptionListProps) => {
    setSelectedOption1(data);
    formik.setFieldValue("appsStatus", data.value);
  };
  const handleUnselectedOption = () => {
    setSelectedOption1(null);
    formik.setFieldValue("appsStatus", "INACTIVE");
  };

  useEffect(() => {
    if (DataAuth && DataAuth.team && ProjectId && DataApps == null) {
      setIsLoadingProcess(true);
      const GetDataList = async () => {
        const requestData = await GetDetailAppsByProjectId(
          ProjectId,
          tokenData
        );
        const isErrorResponse = requestData?.statusCode !== RES_CODE_OK;

        if (isErrorResponse || !requestData) {
          showToast({
            description: requestData?.message || RES_GENERIC_ERROR_MSG,
            statusToast: "error",
          });
          setIsLoadingProcess(false);
          return;
        } else {
          if (requestData.data == null) {
            showToast({
              description: "Data return error",
              statusToast: "error",
            });
            setIsLoadingProcess(false);
            return;
          }

          const itemsData: AppsResponse = requestData.data as AppsResponse;
          console.log("itemsData : ");
          console.log(itemsData);

          // set in form
          formik.setFieldValue("id", itemsData.id);
          formik.setFieldValue("appShortName", itemsData.appShortName);
          formik.setFieldValue("appName", itemsData.appName);
          formik.setFieldValue("appsDesc", itemsData.appsDesc);
          formik.setFieldValue("note", itemsData.note);
          formik.setFieldValue("appsStatus", itemsData.appsStatus);
          formik.setFieldValue("readyToLaunch", itemsData.readyToLaunch);

          const selectedStatus = DataOptions1.find(
            (x) => x.value == itemsData.appsStatus
          );
          if (selectedStatus) {
            handleSelectedOption(selectedStatus);
          }
          if (itemsData.iconApps && itemsData.iconApps.length > 0) {
            setImage(
              buildUrlPort(ENDPOINT_API_BASEURL, ENDPOINT_PORT_BASIC) +
                itemsData.iconApps
            );
          } else {
            setImage(DefaultPathImg);
          }

          setDataApps(itemsData);
          setIsLoadingProcess(false);
        }
      };
      GetDataList();
    }
  }, [ProjectId, DataApps]);

  const handleCheckRtL = (checked: boolean) => {
    formik.setFieldValue("readyToLaunch", checked ? "Y" : "N");
  };

  //   Image Configuration
  const [UpdateIconPayload, setUpdateIconPayload] =
    useState<AppsUploadDataPayload | null>(null);
  const [image, setImage] = useState("/img/default-comp-logo.png");
  useEffect(() => {
    const SendUpdateIcon = async () => {
      await UpdateIconAppsServ();
    };
    if (UpdateIconPayload) {
      SendUpdateIcon();
    }
  }, [image, UpdateIconPayload]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (DataAuth && DataAuth.team && DataApps) {
      if (file) {
        if (file.type.startsWith("image/")) {
          const imageUrl = URL.createObjectURL(file); // Generate a URL for the image preview
          setImage(imageUrl); // Set the new image preview URL
          setUpdateIconPayload({
            id: DataApps.id,
            iconApps: file,
          }); // Set the image file in state
        } else {
          showToast({
            description: "File is not an image",
            statusToast: "error",
          });
        }
      }
    }
  };

  return (
    <Flex w={"full"}>
      <ConfirmationDialog
        key={"confirmUpdateData"}
        isOpenTrigger={openConfirmUpdateDialog}
        action={handleUpdateData}
        trigger={handleConfirmSaveDataTrigger}
        questionMsg={questionMsgDialog}
        captionMsg={captionDialog}
      />

      {IsLoadingProcess ? (
        <LoadingMiniSignature />
      ) : (
        <Flex
          as={Stack}
          w={"full"}
          divider={<StackDivider borderColor="gray.200" />}
          spacing={6}
        >
          {/* Data Application */}
          <Flex p={2} as={Stack} w={"full"}>
            <form onSubmit={formik.handleSubmit} onReset={formik.handleReset}>
              <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
                <Heading as="h5" size="md" w={"full"}>
                  Data Application
                </Heading>
                <Flex as={Wrap} justifyContent={"end"} px={0} w={"full"}>
                  <Button
                    display={IsEditMode ? "none" : "flex"}
                    size={"sm"}
                    leftIcon={<FiRefreshCcw />}
                    onClick={() => RefreshAction()}
                    isLoading={ActionLoading}
                  >
                    Refresh
                  </Button>
                  <Button
                    display={IsEditMode ? "flex" : "none"}
                    size={"sm"}
                    colorScheme={"red"}
                    leftIcon={<FiXCircle />}
                    onClick={() => setIsEditMode(false)}
                    isLoading={ActionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    display={IsEditMode ? "none" : "flex"}
                    size={"sm"}
                    leftIcon={<FiEdit3 />}
                    colorScheme={"secondary"}
                    onClick={() => setIsEditMode(true)}
                    isLoading={ActionLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    display={IsEditMode ? "flex" : "none"}
                    size={"sm"}
                    colorScheme={"green"}
                    leftIcon={<FiSave />}
                    type={"submit"}
                    isLoading={ActionLoading}
                  >
                    Save
                  </Button>
                </Flex>
              </Flex>
              {/* Form Input */}
              <Flex as={Stack} w={"full"} pt={6} px={2}>
                <FormControl
                  id="appShortName"
                  isInvalid={formik.errors.appShortName ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Aplication Short Name
                    </FormLabel>
                    <Stack spacing={0}>
                      <Input
                        id="appShortName"
                        name="appShortName"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.appShortName ?? ""}
                        placeholder="Team Name"
                        readOnly={!IsEditMode}
                        variant={IsEditMode ? "outline" : "filled"}
                        minLength={3}
                        maxLength={80}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.appShortName}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>
                <FormControl
                  id="appName"
                  isInvalid={formik.errors.appName ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Application Full Name
                    </FormLabel>
                    <Stack spacing={0}>
                      <Input
                        id="appName"
                        name="appName"
                        type="text"
                        onChange={formik.handleChange}
                        value={formik.values.appName ?? ""}
                        placeholder="Team Name"
                        readOnly={!IsEditMode}
                        variant={IsEditMode ? "outline" : "filled"}
                        minLength={3}
                        maxLength={80}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.appName}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>
                <FormControl
                  id="appsDesc"
                  isInvalid={formik.errors.appsDesc ? true : false}
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Descriptions
                    </FormLabel>
                    <Stack spacing={0}>
                      <Textarea
                        id="appsDesc"
                        name="appsDesc"
                        onChange={formik.handleChange}
                        defaultValue={formik.values.appsDesc ?? ""}
                        placeholder="Descriptions"
                        readOnly={!IsEditMode}
                        variant={IsEditMode ? "outline" : "filled"}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.appsDesc}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>
                <FormControl
                  id="note"
                  isInvalid={formik.errors.note ? true : false}
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Note
                    </FormLabel>
                    <Stack spacing={0}>
                      <Textarea
                        id="note"
                        name="note"
                        onChange={formik.handleChange}
                        defaultValue={formik.values.note ?? ""}
                        placeholder="Note"
                        readOnly={!IsEditMode}
                        variant={IsEditMode ? "outline" : "filled"}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>{formik.errors.note}</FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id={"appsStatus"}
                  isInvalid={formik.errors.appsStatus ? true : false}
                  isRequired
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Application Status
                    </FormLabel>
                    <Stack spacing={0}>
                      <Select
                        id={"appsStatus"}
                        options={DataOptions1}
                        isSearchable={true}
                        onChange={(e) => {
                          e
                            ? handleSelectedOption({
                                label: e.label,
                                value: e.value,
                              })
                            : handleUnselectedOption();
                        }}
                        value={SelectedOption1}
                        variant={IsEditMode ? "outline" : "filled"}
                        isReadOnly={!IsEditMode}
                      />
                      <FormErrorMessage>
                        {formik.errors.appsStatus}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>

                <FormControl
                  id={"readyToLaunch"}
                  isInvalid={formik.errors.readyToLaunch ? true : false}
                >
                  <InputLayoutFull>
                    <FormLabel h={"full"} mt={2}>
                      Is Apps Ready to Launch?
                    </FormLabel>
                    <Stack spacing={0}>
                      <Switch
                        id="readyToLaunch"
                        size={"lg"}
                        isChecked={formik.values.readyToLaunch === "Y"}
                        onChange={(e) => {
                          handleCheckRtL(e.target.checked);
                        }}
                        isReadOnly={!IsEditMode}
                        isDisabled={ActionLoading}
                      />
                      <FormErrorMessage>
                        {formik.errors.readyToLaunch}
                      </FormErrorMessage>
                    </Stack>
                  </InputLayoutFull>
                </FormControl>
              </Flex>
            </form>
            <Box overflowY={"auto"}>
              {/* <pre>{JSON.stringify(DataApps, null, 2)}</pre> */}
            </Box>
          </Flex>
          {/* Icon Application */}
          <Flex p={2} as={Stack} w={"full"}>
            <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
              <Heading as="h5" size="md" w={"full"}>
                Icon Application
              </Heading>
            </Flex>
            <Flex as={HStack} w={"full"} py={6} px={2} spacing={8}>
              <Box
                as="label" // Make the box a label to trigger file input click
                w={"150px"}
                h={"150px"}
                backgroundImage={`url(${image})`} // Dynamic image source
                backgroundSize={"cover"}
                backgroundPosition={"center"}
                rounded={"3xl"}
                cursor={"pointer"}
                boxShadow={"lg"}
                position="relative"
                overflow="hidden" // Ensure text stays inside the rounded box
                p={"8px"}
                border={"3px solid"}
                borderColor={colorMode == "light" ? "gray.300" : "gray.600"}
              >
                {/* Add Image Placeholder */}
                {image == DefaultPathImg && (
                  <Box
                    rounded={"3xl"}
                    w={"full"}
                    h={"full"}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    //   bg="gray.100" // Placeholder background
                    border="3px dashed" // Dashed border to signify 'add' functionality
                    color="rgba(73, 73, 73, 0.5)" // Example with 50% opacity
                  >
                    <FaPlus size={50} />
                  </Box>
                )}

                {/* Text that appears in the center on hover */}
                <Box
                  display={"flex"}
                  alignItems="center"
                  justifyContent="center"
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  bg="rgba(0, 0, 0, 0.5)" // Semi-transparent gray background with correct opacity
                  color="white"
                  fontWeight="bold"
                  opacity="0" // Hidden by default
                  transition="opacity 0.3s ease"
                  _hover={{
                    opacity: "1", // Show text on hover
                  }}
                >
                  <FiEdit3 />
                  <Text pl={2}>Change Icon</Text>
                </Box>

                {/* Hidden input file */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={ActionLoading}
                  style={{ display: "none" }} // Hide the input
                />
              </Box>
              <Flex>
                <Text textAlign={"center"}>Click image to change icon</Text>
              </Flex>
            </Flex>
          </Flex>
          {/* Preview Application */}
          <Flex p={2} as={Stack} w={"full"}>
            <Flex w={"full"} as={HStack} justifyContent={"space-between"}>
              <Heading as="h5" size="md" w={"full"}>
                Preview Application
              </Heading>
            </Flex>
            <Flex as={Stack} w={"full"} py={6} px={2} spacing={8}>
              <Grid templateColumns="repeat(4, 1fr)" gap={4}>
                <GridItem colSpan={{ base: 4, sm: 4, md: 1, lg: 1 }} w={"full"}>
                  <ImageAddMore />
                </GridItem>
                {ImageAttachment.map((image, index) => (
                  <GridItem
                    colSpan={{ base: 4, sm: 4, md: 1, lg: 1 }}
                    w={"full"}
                    key={index}
                  >
                    <ImagePreview {...image} />
                  </GridItem>
                ))}
              </Grid>
            </Flex>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};

const ImageAttachment: AttachmentProps[] = [
  {
    id: generateUUIDV1(),
    name: "Image 1",
    src: "/img/business/corp-assets-004.jpg",
    alt: "Image 1",
    extension: "jpg",
    size: "1.2MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 2",
    src: "/img/business/corp-assets-002.jpg",
    alt: "Image 2",
    extension: "jpg",
    size: "1.5MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 3",
    src: "/img/business/corp-assets-005.jpg",
    alt: "Image 3",
    extension: "jpg",
    size: "1.8MB",
  },
  {
    id: generateUUIDV1(),
    name: "Image 4",
    src: "/img/business/corp-assets-006.jpg",
    alt: "Image 4",
    extension: "jpg",
    size: "2.0MB",
  },
];

const ImagePreview = ({ name, alt, src }: AttachmentProps) => {
  const ImageModalDisc = useDisclosure();

  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      w={"full"}
      h={"140px"}
      cursor="pointer"
      p={1}
      border={"1px solid"}
      borderColor={"gray.300"}
      onClick={() => ImageModalDisc.onOpen()}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      <Image
        rounded={radiusStyle}
        src={src}
        // boxSize="120px"
        w={"full"}
        h={"full"}
        objectFit="cover"
      />
      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
      >
        <Text fontSize="lg" fontWeight="light" color="white">
          Preview
        </Text>
      </Box>

      {/* Modal for image preview */}
      <Modal
        isOpen={ImageModalDisc.isOpen}
        onClose={ImageModalDisc.onClose}
        isCentered
        size={"xl"} // Set to "xl" for a more responsive size
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          maxW="90vw"
          maxH="90vh"
          bg="rgba(255, 255, 255, 0.1)" // Semi-transparent background for glass effect
          backdropFilter="blur(10px)" // Apply blur for frosted glass effect
          boxShadow="lg" // Optionally add shadow to enhance the look
        >
          <ModalCloseButton color={"white"} />
          <ModalBody p={0}>
            <Box
              w="full"
              h="80vh" // Set the height to make it fit within the modal size
              backgroundPosition="center"
              backgroundRepeat="no-repeat"
              backgroundSize="contain" // Ensure the image fits well without stretching
              backgroundImage={`url(${src})`}
              rounded={radiusStyle}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ImageAddMore = () => {
  const AddImageModalDisc = useDisclosure();
  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      //   boxSize={{ base: "80px", sm: "80px", md: "100px", lg: "100px" }}
      w={"full"}
      h={"140px"}
      cursor="pointer"
      p={1}
      border={"1px solid"}
      borderColor={"gray.300"}
      _hover={{
        "& > .previewOverlay": { opacity: 1 },
      }}
    >
      {/* Add Image Placeholder */}
      <Box
        rounded={radiusStyle}
        w={"full"}
        h={"full"}
        display="flex"
        justifyContent="center"
        alignItems="center"
        bg="gray.100" // Placeholder background
        border="2px dashed" // Dashed border to signify 'add' functionality
        color={"primary.300"}
      >
        <FaPlus size={50} />
      </Box>

      {/* Hover overlay */}
      <Box
        rounded={radiusStyle}
        className="previewOverlay"
        position="absolute"
        top={0}
        left={0}
        w="100%"
        h="100%"
        bg="rgba(0, 0, 0, 0.6)"
        display="flex"
        justifyContent="center"
        alignItems="center"
        opacity={0}
        transition="opacity 0.3s"
        onClick={AddImageModalDisc.onOpen}
      >
        <Text fontSize="lg" fontWeight="light" color="white">
          Add New
        </Text>
      </Box>
      {/* Modal for image preview */}
      <Modal
        isOpen={AddImageModalDisc.isOpen}
        onClose={AddImageModalDisc.onClose}
        isCentered
        size={"2xl"} // Set to "xl" for a more responsive size
      >
        <ModalOverlay />
        <ModalContent
          rounded={radiusStyle}
          // bg="rgba(255, 255, 255, 0.1)" // Semi-transparent background for glass effect
          // backdropFilter="blur(10px)" // Apply blur for frosted glass effect
          boxShadow="lg" // Optionally add shadow to enhance the look
        >
          <ModalCloseButton />
          <ModalHeader>Upload Files</ModalHeader>
          <ModalBody p={4}>
            <DropZoneComponent />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AppInfromationSection;
