"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  HStack,
  Icon,
  Input,
  Progress,
  Select,
  SimpleGrid,
  Text,
  Textarea,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiAlertCircle,
  FiAlertTriangle,
  FiArrowLeft,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiClock,
  FiEdit2,
  FiFileText,
  FiList,
  FiRefreshCcw,
  FiSave,
  FiSend,
  FiShield,
  FiUser,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSignature from "@/app/components/loadingMini";
import { StatusBadge } from "@/app/components/StatusBadge";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useCabRequest from "@/app/services/useCabRequest";
import { CabRequestDetail } from "@/app/types/cabTypes";

type MockRole = "maker" | "scheduler" | "approver";

// ─── Component ───────────────────────────────────────────────────────────────
const CabRequestDetailView = () => {
  useDocumentTitle("CAB Request Detail");
  const { colorMode } = useColorMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("id");
  const showToast = useToastHelper();
  const { GetCabRequestById, ScheduleCabRequest, UpdateCabRequest, UpdateCabResult, SendToApproval, ActionCabRequest, ToggleCabActivity, loading } = useCabRequest();

  // Auth
  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");

  // Role switcher
  const [mockRole, setMockRole] = useState<MockRole>("scheduler");
  const canMake = mockRole === "maker";
  const canSchedule = mockRole === "scheduler";
  const canApprove = mockRole === "approver";

  // Data
  const [Data, setData] = useState<CabRequestDetail | null>(null);
  const [IsLoading, setIsLoading] = useState(true);

  // Edit Request form (for scheduler in WAITING APPROVE status)
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [requestEditForm, setRequestEditForm] = useState({
    requestTitle: "",
    requestType: "",
    targetDate: "",
    description: "",
    impactAnalysis: "",
    rollbackPlan: "",
  });

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    scheduledDate: "",
    scheduledEndDate: "",
    cabLocation: "",
  });

  // Result form
  const [resultForm, setResultForm] = useState({
    cabResult: "",
    cabNotes: "",
    implementationStatus: "",
  });

  // Approval
  const [approvalNote, setApprovalNote] = useState("");

  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;
    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }
    if (token) setTokenData(token);
  }, []);

  useEffect(() => {
    if (!DataAuth || !requestId || !tokenData) return;
    loadDetail();
  }, [DataAuth, requestId, tokenData]);

  const loadDetail = async () => {
    setIsLoading(true);
    const res = await GetCabRequestById(tokenData, requestId!);
    if (res?.data) {
      setData(res.data);
      // Pre-fill result form if data exists
      if (res.data.cabResult) setResultForm({ cabResult: res.data.cabResult, cabNotes: res.data.cabNotes || "", implementationStatus: res.data.implementationStatus || "" });
      if (res.data.scheduledDate) {
        setScheduleForm({ scheduledDate: res.data.scheduledDate.slice(0, 16), scheduledEndDate: res.data.scheduledEndDate?.slice(0, 16) || "", cabLocation: res.data.cabLocation || "" });
      } else if (res.data.requestedCabDate) {
        // Pre-fill with maker's requested date as suggestion
        setScheduleForm({ scheduledDate: res.data.requestedCabDate.slice(0, 16), scheduledEndDate: "", cabLocation: "" });
      }
      // Initialize edit form
      setRequestEditForm({
        requestTitle: res.data.requestTitle || "",
        requestType: res.data.requestType || "DEPLOYMENT",
        targetDate: res.data.targetDate ? res.data.targetDate.slice(0, 10) : "",
        description: res.data.description || "",
        impactAnalysis: res.data.impactAnalysis || "",
        rollbackPlan: res.data.rollbackPlan || "",
      });
    }
    setIsLoading(false);
  };

  const startEditRequest = () => {
    if (!Data) return;
    setRequestEditForm({
      requestTitle: Data.requestTitle || "",
      requestType: Data.requestType || "DEPLOYMENT",
      targetDate: Data.targetDate ? Data.targetDate.slice(0, 10) : "",
      description: Data.description || "",
      impactAnalysis: Data.impactAnalysis || "",
      rollbackPlan: Data.rollbackPlan || "",
    });
    setIsEditingRequest(true);
  };

  const handleSaveRequestEdit = async () => {
    if (!requestEditForm.requestTitle.trim()) {
      showToast({ description: "Judul request wajib diisi", statusToast: "error" });
      return;
    }
    const success = await UpdateCabRequest(tokenData, requestId!, requestEditForm);
    if (success) {
      showToast({ description: "Data request CAB berhasil diperbarui", statusToast: "success" });
      setIsEditingRequest(false);
      loadDetail();
    }
  };

  // Activity checklist calculations
  const activities = Data?.activityChecklist || [];
  const completedActivitiesCount = activities.filter((a) => a.isDone).length;
  const totalActivitiesCount = activities.length;
  const allActivitiesDone = totalActivitiesCount > 0 && completedActivitiesCount === totalActivitiesCount;
  const activityPercent = totalActivitiesCount > 0 ? Math.round((completedActivitiesCount / totalActivitiesCount) * 100) : 0;

  const handleToggleActivity = async (activityId: string) => {
    if (!requestId) return;
    const success = await ToggleCabActivity(tokenData, requestId, activityId, DataAuth?.nama || "Scheduler");
    if (success) {
      loadDetail();
    }
  };

  // Handlers
  const handleSaveSchedule = async () => {
    if (!scheduleForm.scheduledDate || !scheduleForm.scheduledEndDate) {
      showToast({ description: "Tanggal mulai dan selesai wajib diisi", statusToast: "error" });
      return;
    }
    const success = await ScheduleCabRequest(tokenData, requestId!, scheduleForm);
    if (success) {
      showToast({ description: "Jadwal CAB berhasil disimpan. Status sekarang WAITING APPROVE.", statusToast: "success" });
      loadDetail();
    }
  };

  const handleSaveResult = async () => {
    if (!resultForm.cabResult || !resultForm.implementationStatus) {
      showToast({ description: "Hasil dan status implementasi wajib diisi", statusToast: "error" });
      return;
    }
    const success = await UpdateCabResult(tokenData, requestId!, {
      cabResult: resultForm.cabResult,
      cabNotes: resultForm.cabNotes,
      implementationStatus: resultForm.implementationStatus as "SUCCESS" | "FAILED" | "PARTIAL",
    });
    if (success) showToast({ description: "Hasil CAB berhasil disimpan", statusToast: "success" });
  };

  const handleSendToApproval = async () => {
    if (!allActivitiesDone) {
      showToast({
        titleToast: "Aktivitas Belum Selesai",
        description: `Harap selesaikan seluruh aktivitas checklist CAB (${completedActivitiesCount}/${totalActivitiesCount} selesai) sebelum mengirim ke Approver.`,
        statusToast: "warning",
      });
      return;
    }
    if (isEditingRequest) {
      await UpdateCabRequest(tokenData, requestId!, requestEditForm);
    }
    if (resultForm.cabResult) {
      await UpdateCabResult(tokenData, requestId!, {
        cabResult: resultForm.cabResult,
        cabNotes: resultForm.cabNotes,
        implementationStatus: (resultForm.implementationStatus || "SUCCESS") as "SUCCESS" | "FAILED" | "PARTIAL",
      });
    }
    const success = await SendToApproval(tokenData, requestId!);
    if (success) {
      showToast({ description: "Request berhasil dikirim ke approver dengan checklist aktivitas terverifikasi", statusToast: "success" });
      setIsEditingRequest(false);
      loadDetail();
    }
  };

  const handleApprovalAction = async (action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !approvalNote) {
      showToast({ description: "Catatan wajib diisi untuk reject", statusToast: "error" });
      return;
    }
    const success = await ActionCabRequest(tokenData, requestId!, { action, note: approvalNote });
    if (success) {
      showToast({ description: action === "APPROVE" ? "Request berhasil disetujui (APPROVED)" : "Request ditolak (REJECTED)", statusToast: "success" });
      loadDetail();
    }
  };

  if (IsLoading) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="400px"><LoadingMiniSignature /></Flex>
      </LayoutAdmin>
    );
  }

  if (!Data) {
    return (
      <LayoutAdmin>
        <Flex justify="center" align="center" minH="400px" direction="column" gap={4}>
          <Text color="gray.500">Request not found</Text>
          <Button onClick={() => router.push("/cab/cab-request")}>Back</Button>
        </Flex>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <HeaderContent titleName="CAB Request Detail" breadCrumb={["CAB", "CAB Request", "Detail"]} />

      {/* Role Switcher */}
      <Box mx={{ base: 4, md: 6 }} mt={3} mb={2}>
        <Card rounded="lg" shadow="sm" border="1px" borderColor="purple.200" bg={colorMode === "light" ? "purple.50" : "gray.800"} p={3}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <HStack spacing={2}>
              <Icon as={FiShield} color="purple.500" />
              <Text fontSize="xs" fontWeight="bold" color="purple.700">MOCK ROLE SWITCHER</Text>
              <Badge colorScheme="gray" fontSize="2xs">Status: {Data.status}</Badge>
            </HStack>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button leftIcon={<FiUser />} colorScheme={mockRole === "maker" ? "blue" : "gray"} variant={mockRole === "maker" ? "solid" : "outline"} onClick={() => setMockRole("maker")}>Maker</Button>
              <Button leftIcon={<FiUsers />} colorScheme={mockRole === "scheduler" ? "green" : "gray"} variant={mockRole === "scheduler" ? "solid" : "outline"} onClick={() => setMockRole("scheduler")}>Scheduler</Button>
              <Button leftIcon={<FiCheckCircle />} colorScheme={mockRole === "approver" ? "orange" : "gray"} variant={mockRole === "approver" ? "solid" : "outline"} onClick={() => setMockRole("approver")}>Approver</Button>
            </ButtonGroup>
          </Flex>
        </Card>
      </Box>

      {/* Header Banner */}
      <Box
        bgGradient="linear(to-br, secondary.800, secondary.600)"
        color="white"
        px={{ base: 4, md: 6 }} py={{ base: 4, md: 5 }}
        mx={{ base: 4, md: 6 }} mb={{ base: 4, md: 6 }}
        rounded={radiusStyle} position="relative" overflow="hidden" shadow="xl"
      >
        <VStack spacing={4} align="stretch" position="relative" zIndex={2}>
          <HStack justify="space-between" align="center">
            <Link href="/cab/cab-request">
              <Button leftIcon={<FiArrowLeft />} variant="ghost" size="sm" color="white" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" _hover={{ bg: "whiteAlpha.200" }} rounded="full" px={4}>Back</Button>
            </Link>
            <Button leftIcon={<FiRefreshCcw />} variant="ghost" size="sm" color="white" bg="whiteAlpha.100" border="1px solid" borderColor="whiteAlpha.200" _hover={{ bg: "whiteAlpha.200" }} rounded="full" px={3} onClick={loadDetail}>Refresh</Button>
          </HStack>
          <HStack spacing={4} align="center">
            <Box w="60px" h="60px" bg="whiteAlpha.200" rounded="xl" display="flex" alignItems="center" justifyContent="center">
              <FiFileText size={28} />
            </Box>
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="md" fontWeight="700">{Data.requestTitle}</Heading>
              <HStack spacing={2} wrap="wrap">
                <Badge colorScheme="blue" variant="solid" px={2} rounded="full" fontSize="xs">{Data.requestNo}</Badge>
                <Badge colorScheme="purple" variant="solid" px={2} rounded="full" fontSize="xs">{Data.requestType}</Badge>
                <StatusBadge status={Data.status} variant="solid" px={2} rounded="full" fontSize="xs" />
              </HStack>
            </VStack>
          </HStack>
        </VStack>
      </Box>

      {/* Content */}
      <Box px={{ base: 4, md: 6 }} w="full">
        <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full">

          {/* Left — Main Info + Actions */}
          <GridItem colSpan={{ base: 12, lg: 8 }}>
            <VStack spacing={5} align="stretch">

              {/* Request Information */}
              <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                  <Flex justify="space-between" align="center" w="full">
                    <HStack spacing={2}><Box w="4px" h="20px" bg="secondary.400" rounded="full" /><Heading size="sm">Request Information</Heading></HStack>
                    {canSchedule && ["WAITING APPROVE", "SCHEDULED", "IN_REVIEW"].includes(Data.status) && (
                      !isEditingRequest ? (
                        <Button
                          size="xs"
                          variant="outline"
                          colorScheme="blue"
                          leftIcon={<FiEdit2 />}
                          onClick={startEditRequest}
                        >
                          Edit Data Request
                        </Button>
                      ) : (
                        <HStack spacing={2}>
                          <Button
                            size="xs"
                            variant="ghost"
                            onClick={() => setIsEditingRequest(false)}
                          >
                            Batal
                          </Button>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            leftIcon={<FiSave />}
                            onClick={handleSaveRequestEdit}
                            isLoading={loading}
                          >
                            Simpan Perubahan
                          </Button>
                        </HStack>
                      )
                    )}
                  </Flex>
                </CardHeader>
                <CardBody px={5} py={4}>
                  {isEditingRequest ? (
                    <VStack spacing={4} align="stretch">
                      <FormControl isRequired>
                        <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Request Title</FormLabel>
                        <Input
                          size="sm"
                          rounded="lg"
                          value={requestEditForm.requestTitle}
                          onChange={(e) => setRequestEditForm({ ...requestEditForm, requestTitle: e.target.value })}
                        />
                      </FormControl>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        <InfoItem label="Request No" value={Data.requestNo} />
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Request Type</FormLabel>
                          <Select
                            size="sm"
                            rounded="lg"
                            value={requestEditForm.requestType}
                            onChange={(e) => setRequestEditForm({ ...requestEditForm, requestType: e.target.value })}
                          >
                            <option value="DEPLOYMENT">DEPLOYMENT</option>
                            <option value="CHANGE REQUEST">CHANGE REQUEST</option>
                            <option value="INFRASTRUCTURE">INFRASTRUCTURE</option>
                            <option value="MAINTENANCE">MAINTENANCE</option>
                            <option value="HOTFIX">HOTFIX</option>
                            <option value="EMERGENCY CHANGE">EMERGENCY CHANGE</option>
                          </Select>
                        </FormControl>
                        <InfoItem label="Request Date" value={new Date(Data.requestDate).toLocaleDateString("id-ID")} />
                        <FormControl isRequired>
                          <FormLabel fontSize="xs" fontWeight="semibold" color="gray.500" mb={1}>Target Date</FormLabel>
                          <Input
                            type="date"
                            size="sm"
                            rounded="lg"
                            value={requestEditForm.targetDate}
                            onChange={(e) => setRequestEditForm({ ...requestEditForm, targetDate: e.target.value })}
                          />
                        </FormControl>
                        <InfoItem label="Requester" value={Data.requesterName} />
                        <InfoItem label="Project" value={Data.projectName} />
                      </SimpleGrid>
                    </VStack>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <InfoItem label="Request No" value={Data.requestNo} />
                      <InfoItem label="Type" value={Data.requestType} />
                      <InfoItem label="Request Date" value={new Date(Data.requestDate).toLocaleDateString("id-ID")} />
                      <InfoItem label="Target Date" value={new Date(Data.targetDate).toLocaleDateString("id-ID")} />
                      <InfoItem label="Requester" value={Data.requesterName} />
                      <InfoItem label="Project" value={Data.projectName} />
                    </SimpleGrid>
                  )}
                </CardBody>
              </Card>

              {/* Description */}
              <SectionCard title="Description" accentColor="secondary.400" colorMode={colorMode}>
                {isEditingRequest ? (
                  <Textarea
                    size="sm"
                    rows={4}
                    rounded="lg"
                    value={requestEditForm.description}
                    onChange={(e) => setRequestEditForm({ ...requestEditForm, description: e.target.value })}
                    placeholder="Deskripsi request..."
                  />
                ) : (
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"} lineHeight="tall">{Data.description}</Text>
                )}
              </SectionCard>

              {/* Impact Analysis */}
              <SectionCard title="Impact Analysis" accentColor="orange.400" colorMode={colorMode}>
                {isEditingRequest ? (
                  <Textarea
                    size="sm"
                    rows={4}
                    rounded="lg"
                    value={requestEditForm.impactAnalysis}
                    onChange={(e) => setRequestEditForm({ ...requestEditForm, impactAnalysis: e.target.value })}
                    placeholder="Analisis dampak..."
                  />
                ) : (
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"} lineHeight="tall">{Data.impactAnalysis}</Text>
                )}
              </SectionCard>

              {/* Rollback Plan */}
              <SectionCard title="Rollback Plan" accentColor="red.400" colorMode={colorMode}>
                {isEditingRequest ? (
                  <Textarea
                    size="sm"
                    rows={4}
                    rounded="lg"
                    value={requestEditForm.rollbackPlan}
                    onChange={(e) => setRequestEditForm({ ...requestEditForm, rollbackPlan: e.target.value })}
                    placeholder="Rencana rollback..."
                  />
                ) : (
                  <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"} lineHeight="tall">{Data.rollbackPlan}</Text>
                )}
              </SectionCard>

              {/* ─── SECTION: Schedule CAB (User 2 Scheduler, status REQUEST / SUBMITTED) ─── */}
              {canSchedule && ["REQUEST", "SUBMITTED"].includes(Data.status) && (
                <Card rounded={radiusStyle} shadow="sm" border="2px" borderColor="blue.200" bg={colorMode === "light" ? "blue.50" : "gray.800"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "blue.100" : "gray.700"}>
                    <HStack spacing={2}><Icon as={FiCalendar} color="blue.500" /><Heading size="sm" color="blue.700">Jadwalkan CAB Meeting</Heading></HStack>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    {/* Show maker's requested date */}
                    {Data.requestedCabDate && (
                      <Box mb={4} p={3} bg={colorMode === "light" ? "white" : "gray.700"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "blue.200" : "blue.700"}>
                        <Text fontSize="xs" color="gray.500" mb={1}>Tanggal Permohonan CAB dari Maker:</Text>
                        <Text fontSize="sm" fontWeight="bold" color="blue.600">{new Date(Data.requestedCabDate).toLocaleString("id-ID")}</Text>
                      </Box>
                    )}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Tanggal & Jam Mulai</FormLabel>
                        <Input type="datetime-local" size="sm" rounded="lg" value={scheduleForm.scheduledDate} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })} />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Tanggal & Jam Selesai</FormLabel>
                        <Input type="datetime-local" size="sm" rounded="lg" value={scheduleForm.scheduledEndDate} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledEndDate: e.target.value })} />
                      </FormControl>
                    </SimpleGrid>
                    <FormControl mt={4}>
                      <FormLabel fontSize="sm">Link Zoom / Lokasi Meeting</FormLabel>
                      <Input placeholder="https://..." size="sm" rounded="lg" value={scheduleForm.cabLocation} onChange={(e) => setScheduleForm({ ...scheduleForm, cabLocation: e.target.value })} />
                    </FormControl>
                    <Button mt={4} colorScheme="blue" size="sm" leftIcon={<FiCalendar />} onClick={handleSaveSchedule} isLoading={loading}>
                      Simpan Jadwal CAB
                    </Button>
                  </CardBody>
                </Card>
              )}

              {/* ─── SECTION: Activity Checklist CAB (Verifikasi Pra-Approval) ─── */}
              {["WAITING APPROVE", "SCHEDULED", "IN_REVIEW", "APPROVED"].includes(Data.status) && (
                <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                    <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
                      <HStack spacing={2}>
                        <Icon as={FiCheckSquare} color="secondary.500" />
                        <Heading size="sm">Activity Checklist CAB (Verifikasi Pra-Approval)</Heading>
                      </HStack>
                      <Badge
                        colorScheme={allActivitiesDone ? "green" : "orange"}
                        variant="subtle"
                        rounded="full"
                        px={2.5}
                        py={0.5}
                        fontSize="xs"
                      >
                        {completedActivitiesCount} / {totalActivitiesCount} Selesai ({activityPercent}%)
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Progress
                          value={activityPercent}
                          size="xs"
                          colorScheme={allActivitiesDone ? "green" : "blue"}
                          rounded="full"
                          mb={1.5}
                        />
                        <Text fontSize="2xs" color="gray.500">
                          {allActivitiesDone
                            ? "✓ Seluruh aktivitas telah diverifikasi dan selesai."
                            : "Scheduler wajib mencentang seluruh aktivitas verifikasi sebelum mengirim request ke approval."}
                        </Text>
                      </Box>

                      <VStack spacing={2.5} align="stretch">
                        {activities.map((act) => {
                          const canToggle = canSchedule && ["WAITING APPROVE", "SCHEDULED", "IN_REVIEW"].includes(Data.status);
                          return (
                            <Box
                              key={act.id}
                              p={3}
                              rounded="lg"
                              border="1px solid"
                              borderColor={
                                act.isDone
                                  ? colorMode === "light" ? "green.200" : "green.800"
                                  : colorMode === "light" ? "gray.200" : "gray.700"
                              }
                              bg={
                                act.isDone
                                  ? colorMode === "light" ? "green.50" : "gray.800"
                                  : colorMode === "light" ? "white" : "gray.800"
                              }
                              transition="all 0.15s ease"
                              _hover={canToggle ? { borderColor: "blue.300", bg: colorMode === "light" ? "blue.50" : "gray.750" } : {}}
                            >
                              <Flex align="start" justify="space-between" gap={3}>
                                <HStack align="start" spacing={3} flex={1}>
                                  <Checkbox
                                    isChecked={act.isDone}
                                    onChange={() => canToggle && handleToggleActivity(act.id)}
                                    isDisabled={!canToggle}
                                    colorScheme="green"
                                    size="md"
                                    mt={0.5}
                                  />
                                  <VStack align="start" spacing={0.5} flex={1}>
                                    <Text
                                      fontSize="sm"
                                      fontWeight={act.isDone ? "semibold" : "medium"}
                                      color={
                                        act.isDone
                                          ? colorMode === "light" ? "green.900" : "green.200"
                                          : colorMode === "light" ? "gray.800" : "gray.200"
                                      }
                                      textDecoration={act.isDone ? "none" : "none"}
                                    >
                                      {act.label}
                                    </Text>
                                    {act.description && (
                                      <Text fontSize="xs" color="gray.500">
                                        {act.description}
                                      </Text>
                                    )}
                                  </VStack>
                                </HStack>

                                {act.isDone && (
                                  <Badge colorScheme="green" variant="solid" rounded="full" px={2} py={0.5} fontSize="3xs">
                                    Done {act.doneBy ? `by ${act.doneBy}` : ""}
                                  </Badge>
                                )}
                              </Flex>
                            </Box>
                          );
                        })}
                      </VStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* ─── SECTION: CAB Result & Send to Approval (User 2 Scheduler, status WAITING APPROVE) ─── */}
              {canSchedule && ["WAITING APPROVE", "SCHEDULED", "IN_REVIEW"].includes(Data.status) && (
                <Card rounded={radiusStyle} shadow="sm" border="2px" borderColor="green.200" bg={colorMode === "light" ? "green.50" : "gray.800"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "green.100" : "gray.700"}>
                    <HStack spacing={2}><Icon as={FiFileText} color="green.500" /><Heading size="sm" color="green.700">Hasil CAB Meeting & Kirim Approval</Heading></HStack>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={4} align="stretch">
                      {!allActivitiesDone && (
                        <HStack p={3} bg={colorMode === "light" ? "orange.50" : "orange.950"} border="1px solid" borderColor="orange.300" rounded="lg" spacing={2.5}>
                          <Icon as={FiAlertTriangle} color="orange.500" boxSize={4} flexShrink={0} />
                          <Text fontSize="xs" color={colorMode === "light" ? "orange.800" : "orange.200"}>
                            Perhatian: Anda wajib menyelesaikan dan mencentang seluruh <strong>Activity Checklist CAB ({completedActivitiesCount}/{totalActivitiesCount})</strong> di atas sebelum dapat mengirim request ini ke Approver.
                          </Text>
                        </HStack>
                      )}

                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Hasil Implementasi / Catatan Meeting</FormLabel>
                        <Textarea placeholder="Tuliskan hasil evaluasi & pembahasan CAB meeting..." rows={4} size="sm" rounded="lg" value={resultForm.cabResult} onChange={(e) => setResultForm({ ...resultForm, cabResult: e.target.value })} />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">Catatan Tambahan CAB</FormLabel>
                        <Textarea placeholder="Catatan opsional..." rows={3} size="sm" rounded="lg" value={resultForm.cabNotes} onChange={(e) => setResultForm({ ...resultForm, cabNotes: e.target.value })} />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel fontSize="sm">Status Implementasi</FormLabel>
                        <Select size="sm" rounded="lg" value={resultForm.implementationStatus} onChange={(e) => setResultForm({ ...resultForm, implementationStatus: e.target.value })}>
                          <option value="">-- Pilih Status --</option>
                          <option value="SUCCESS">SUCCESS</option>
                          <option value="FAILED">FAILED</option>
                          <option value="PARTIAL">PARTIAL</option>
                        </Select>
                      </FormControl>
                      <HStack justify="end" spacing={3} pt={2}>
                        <Button variant="outline" size="sm" onClick={handleSaveResult} isLoading={loading}>Simpan Draft</Button>
                        <Tooltip
                          label={!allActivitiesDone ? "Selesaikan semua activity checklist sebelum mengirim ke approval" : ""}
                          isDisabled={allActivitiesDone}
                        >
                          <Button
                            colorScheme="orange"
                            size="sm"
                            leftIcon={<FiSend />}
                            onClick={handleSendToApproval}
                            isLoading={loading}
                          >
                            Send to Approval
                          </Button>
                        </Tooltip>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* ─── SECTION: Approval Action (Approver, status WAITING APPROVE) ─── */}
              {canApprove && ["WAITING APPROVE", "PENDING_APPROVAL"].includes(Data.status) && (
                <Card rounded={radiusStyle} shadow="sm" border="2px" borderColor="orange.200" bg={colorMode === "light" ? "orange.50" : "gray.800"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "orange.100" : "gray.700"}>
                    <HStack spacing={2}><Icon as={FiCheckCircle} color="orange.500" /><Heading size="sm" color="orange.700">Approval Action</Heading></HStack>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={4} align="stretch">
                      {/* Show meeting result if exists */}
                      {Data.cabResult && (
                        <Box p={3} bg={colorMode === "light" ? "white" : "gray.700"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.600"}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>Hasil CAB Meeting:</Text>
                          <Text fontSize="sm">{Data.cabResult}</Text>
                          {Data.implementationStatus && <Badge mt={2} colorScheme={Data.implementationStatus === "SUCCESS" ? "green" : Data.implementationStatus === "FAILED" ? "red" : "orange"}>{Data.implementationStatus}</Badge>}
                        </Box>
                      )}
                      <FormControl>
                        <FormLabel fontSize="sm">Catatan Approver</FormLabel>
                        <Textarea placeholder="Tambahkan catatan (wajib jika reject)..." size="sm" rounded="lg" value={approvalNote} onChange={(e) => setApprovalNote(e.target.value)} rows={3} />
                      </FormControl>
                      <HStack justify="end" spacing={3}>
                        <Button colorScheme="red" variant="outline" size="sm" leftIcon={<FiX />} onClick={() => handleApprovalAction("REJECT")} isLoading={loading}>Reject</Button>
                        <Button colorScheme="green" size="sm" leftIcon={<FiCheck />} onClick={() => handleApprovalAction("APPROVE")} isLoading={loading}>Approve</Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* ─── SECTION: Approved Summary (when APPROVED) ─── */}
              {Data.status === "APPROVED" && (
                <Card rounded={radiusStyle} shadow="sm" border="2px" borderColor="green.300" bg={colorMode === "light" ? "green.50" : "gray.800"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "green.100" : "gray.700"}>
                    <HStack spacing={2}><Icon as={FiCheckCircle} color="green.500" /><Heading size="sm" color="green.700">Persetujuan Selesai (APPROVED)</Heading></HStack>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={3} align="stretch">
                      <Text fontSize="sm" color={colorMode === "light" ? "gray.700" : "gray.300"}>
                        Request CAB ini telah disetujui dan seluruh aktivitas verifikasi telah selesai.
                      </Text>
                      {Data.cabResult && (
                        <Box p={3} bg={colorMode === "light" ? "white" : "gray.700"} rounded="lg" border="1px" borderColor={colorMode === "light" ? "green.200" : "gray.600"}>
                          <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1}>Ringkasan Hasil CAB:</Text>
                          <Text fontSize="sm">{Data.cabResult}</Text>
                        </Box>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>

          {/* Right — Sidebar */}
          <GridItem colSpan={{ base: 12, lg: 4 }}>
            <VStack spacing={5} align="stretch">

              {/* Status Card */}
              <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                  <HStack spacing={2}><Box w="4px" h="20px" bg="secondary.400" rounded="full" /><Heading size="sm">Status</Heading></HStack>
                </CardHeader>
                <CardBody px={5} py={4}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Status</Text><StatusBadge status={Data.status} rounded="full" px={2} fontSize="xs" /></HStack>
                    <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Type</Text><Badge colorScheme="purple" variant="subtle" rounded="full" px={2} fontSize="xs">{Data.requestType}</Badge></HStack>
                    {Data.scheduledDate && (
                      <>
                        <Divider />
                        <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Scheduled</Text><Text fontSize="xs" fontWeight="medium">{new Date(Data.scheduledDate).toLocaleString("id-ID")}</Text></HStack>
                        {Data.cabLocation && <HStack justify="space-between"><Text fontSize="xs" color="gray.500">Location</Text><Text fontSize="xs" fontWeight="medium">{Data.cabLocation}</Text></HStack>}
                      </>
                    )}
                  </VStack>
                </CardBody>
              </Card>

              {/* Approval Timeline */}
              {Data.approvalHistory.length > 0 && (
                <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
                  <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
                    <HStack spacing={2}><Box w="4px" h="20px" bg="secondary.400" rounded="full" /><Heading size="sm">Approval Flow</Heading></HStack>
                  </CardHeader>
                  <CardBody px={5} py={4}>
                    <VStack spacing={0} align="stretch">
                      {Data.approvalHistory.map((step, idx) => {
                        const isLast = idx === Data.approvalHistory.length - 1;
                        const stepColor = step.status === "APPROVED" ? "green" : step.status === "REJECTED" ? "red" : "gray";
                        const StepIcon = step.status === "APPROVED" ? FiCheckCircle : step.status === "REJECTED" ? FiXCircle : FiClock;
                        return (
                          <HStack key={step.id} spacing={3} align="start" position="relative">
                            {!isLast && <Box position="absolute" left="15px" top="32px" bottom="-8px" w="2px" bg={colorMode === "light" ? "gray.200" : "gray.600"} />}
                            <Box w="32px" h="32px" bg={`${stepColor}.100`} rounded="full" display="flex" alignItems="center" justifyContent="center" flexShrink={0} zIndex={1}>
                              <Icon as={StepIcon} color={`${stepColor}.600`} boxSize={4} />
                            </Box>
                            <VStack align="start" spacing={0} pb={4} flex={1}>
                              <Text fontSize="sm" fontWeight="semibold">{step.approverName}</Text>
                              <Text fontSize="xs" color="gray.500">{step.approverRole}</Text>
                              <HStack spacing={2} mt={1}>
                                <Badge colorScheme={stepColor} fontSize="2xs" rounded="full" px={2}>{step.status}</Badge>
                                {step.actionDate && <Text fontSize="2xs" color="gray.400">{new Date(step.actionDate).toLocaleDateString("id-ID")}</Text>}
                              </HStack>
                              {step.note && (
                                <Box mt={2} p={2} bg={colorMode === "light" ? "gray.50" : "gray.700"} rounded="md" w="full">
                                  <Text fontSize="xs" color="gray.600" fontStyle="italic">&ldquo;{step.note}&rdquo;</Text>
                                </Box>
                              )}
                            </VStack>
                          </HStack>
                        );
                      })}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </Box>
    </LayoutAdmin>
  );
};

// ─── Reusable Components ─────────────────────────────────────────────────────
const InfoItem = ({ label, value }: { label: string; value: string }) => {
  const { colorMode } = useColorMode();
  return (
    <VStack align="start" spacing={0}>
      <Text fontSize="xs" color="gray.500">{label}</Text>
      <Text fontSize="sm" fontWeight="600" color={colorMode === "light" ? "gray.800" : "gray.100"}>{value || "-"}</Text>
    </VStack>
  );
};

const SectionCard = ({ title, accentColor, colorMode, children }: { title: string; accentColor: string; colorMode: string; children: React.ReactNode }) => (
  <Card rounded={radiusStyle} shadow="sm" border="1px" borderColor={colorMode === "light" ? "gray.200" : "gray.700"}>
    <CardHeader py={3} px={5} borderBottom="1px" borderColor={colorMode === "light" ? "gray.100" : "gray.700"}>
      <HStack spacing={2}><Box w="4px" h="20px" bg={accentColor} rounded="full" /><Heading size="sm">{title}</Heading></HStack>
    </CardHeader>
    <CardBody px={5} py={4}>{children}</CardBody>
  </Card>
);

export default CabRequestDetailView;
