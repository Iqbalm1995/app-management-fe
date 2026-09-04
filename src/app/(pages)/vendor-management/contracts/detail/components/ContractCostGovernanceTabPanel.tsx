"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  VStack,
  HStack,
  Flex,
  Grid,
  GridItem,
  Badge,
  Icon,
  Divider,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  IconButton,
  Input,
  Tooltip,
  Spinner,
  Textarea,
  useToast,
  useColorMode,
  Collapse,
} from "@chakra-ui/react";
import {
  FiTrendingUp,
  FiPieChart,
  FiBriefcase,
  FiSliders,
  FiPlus,
  FiTrash2,
  FiStar,
  FiArrowUpRight,
  FiArrowDownRight,
  FiMinus,
  FiRotateCcw,
  FiDollarSign,
  FiLayers,
  FiSave,
  FiCheckCircle,
  FiFileText,
  FiInfo,
  FiEdit3,
  FiRefreshCw,
  FiClock,
} from "react-icons/fi";

import { formatIDR } from "@/app/components/CardContract";
import CurrencyInput from "@/app/components/inputProps/currencyInput";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import useVendor, {
  VendorContractResponse,
  ContractCostGovernanceSavePayload,
  ContractCostGovernanceResponse,
  ContractPaymentResponse,
  ContractCostGovHistoryResponse,
} from "@/app/services/useVendor";
import { RES_CODE_OK } from "@/app/constants/applicationConstants";
import ModalCostGovHistory from "./ModalCostGovHistory";

export interface HpsItem {
  id: string;
  key: "hps_it" | "hps_umum" | "hps_komite" | "custom";
  name: string;
  tag: string;
  nominal: number;
  isRemovable: boolean;
  isBenchmark: boolean;
  notes?: string;
}

export interface UnifiedWorkProgramItem {
  id: string;
  source: string;
  code: string;
  name: string;
  accNumber: string;
  accCc: string;
  budget: number;
  real: number;
  leftovers: number;
  divisionName?: string | null;
}

interface ContractCostGovernanceTabPanelProps {
  contract: VendorContractResponse;
  tokenData: string;
  onRefreshContract?: () => void;
}

export default function ContractCostGovernanceTabPanel({
  contract,
  tokenData,
  onRefreshContract,
}: ContractCostGovernanceTabPanelProps) {
  const { colorMode } = useColorMode();
  const toast = useToast();
  const { GetDetailById: GetProjectDetail } = useProjects();
  const vendorHook = useVendor();
  const GetCostGovernanceByContractId = vendorHook?.GetCostGovernanceByContractId;
  const SaveCostGovernance = vendorHook?.SaveCostGovernance;
  const GetPaymentByContractId = vendorHook?.GetPaymentByContractId;
  const GetCostGovHistoryList = vendorHook?.GetCostGovHistoryList;

  const [project, setProject] = useState<ProjectDataResponse | null>(null);
  const [paymentData, setPaymentData] = useState<ContractPaymentResponse | null>(null);
  const [isLoadingWorkPrograms, setIsLoadingWorkPrograms] = useState<boolean>(false);
  const [isLoadingGov, setIsLoadingGov] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [costGovId, setCostGovId] = useState<string | null>(null);
  const [manualBudgetRbb, setManualBudgetRbb] = useState<number | null>(null);
  const [isEditingRbb, setIsEditingRbb] = useState<boolean>(false);
  const [revisionReason, setRevisionReason] = useState<string>("");
  const [governanceNotes, setGovernanceNotes] = useState<string>("");

  const [hpsList, setHpsList] = useState<HpsItem[]>([]);
  const [activeSelectedHpsId, setActiveSelectedHpsId] = useState<string>("hps_komite");

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [costGovHistories, setCostGovHistories] = useState<ContractCostGovHistoryResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Total Contract Work Value (C)
  const contractWorkValue = contract.workValue || 0;

  // Unified Work Programs List (Aggregated from Contract, Project, and/or Contract Payment)
  const unifiedWorkPrograms = useMemo<UnifiedWorkProgramItem[]>(() => {
    const map = new Map<string, UnifiedWorkProgramItem>();

    // 1. Contract Work Programs (Directly populated from Backend GetContractDetail)
    if (contract?.workPrograms && contract.workPrograms.length > 0) {
      contract.workPrograms.forEach((wp, idx) => {
        const itemKey = wp.id || wp.workProgramCode || `contract_wp_${idx}`;
        map.set(itemKey, {
          id: wp.id || `contract_wp_${idx}`,
          source: wp.workProgramSource || "RBB (Project)",
          code: wp.workProgramCode || "-",
          name: wp.workProgramAccName || wp.workProgramName || "Project Budget Line",
          accNumber: wp.workProgramAccNumber || "-",
          accCc: wp.workProgramAccCc || "-",
          budget: wp.workProgramBudget || 0,
          real: contractWorkValue,
          leftovers: Math.max(0, (wp.workProgramBudget || 0) - contractWorkValue),
          divisionName: wp.divisionName || contract?.proOwnerDivisionName || null,
        });
      });
    }

    // 2. Project Work Programs (Primary Source from useProjects GetDetailById)
    if (project?.workPrograms && project.workPrograms.length > 0) {
      project.workPrograms.forEach((wp, idx) => {
        const itemKey = wp.id || wp.workProgramCode || `prj_wp_${idx}`;
        if (!map.has(itemKey)) {
          map.set(itemKey, {
            id: wp.id || `prj_wp_${idx}`,
            source: wp.workProgramSource || "RBB (Project)",
            code: wp.workProgramCode || "-",
            name: wp.workProgramAccName || wp.workProgramName || "Project Budget Line",
            accNumber: wp.workProgramAccNumber || "-",
            accCc: wp.workProgramAccCc || "-",
            budget: wp.workProgramBudget || 0,
            real: contractWorkValue,
            leftovers: Math.max(0, (wp.workProgramBudget || 0) - contractWorkValue),
            divisionName: wp.divisionName || project?.proOwnerDivisionName || contract?.proOwnerDivisionName || null,
          });
        }
      });
    }

    // 3. Contract Payment Work Programs (Secondary/Complementary Source)
    if (paymentData?.workPrograms && paymentData.workPrograms.length > 0) {
      paymentData.workPrograms.forEach((wp, idx) => {
        const itemKey = wp.id || wp.reqWorkProgramId || wp.workProgramCode || `pmt_wp_${idx}`;
        if (!map.has(itemKey)) {
          map.set(itemKey, {
            id: wp.id || wp.reqWorkProgramId || `pmt_wp_${idx}`,
            source: wp.workProgramSource || "RBB (Payment)",
            code: wp.workProgramCode || "-",
            name: wp.workProgramAccName || wp.workProgramName || "Contract Budget Line",
            accNumber: wp.workProgramAccNumber || "-",
            accCc: wp.workProgramAccCc || "-",
            budget: wp.workProgramBudget || 0,
            real: wp.workProgramReal || contractWorkValue,
            leftovers:
              wp.workProgramLeftovers ??
              Math.max(0, (wp.workProgramBudget || 0) - (wp.workProgramReal || contractWorkValue)),
            divisionName: wp.divisionName || null,
          });
        }
      });
    }

    return Array.from(map.values());
  }, [
    contract?.workPrograms,
    contract?.proOwnerDivisionName,
    project?.workPrograms,
    project?.proOwnerDivisionName,
    paymentData?.workPrograms,
    contractWorkValue,
  ]);

  // Total Work Program Budget Sum
  const totalWorkProgramBudget = useMemo(() => {
    if (unifiedWorkPrograms.length > 0) {
      return unifiedWorkPrograms.reduce((acc, wp) => acc + (wp.budget || 0), 0);
    }
    return 0;
  }, [unifiedWorkPrograms]);

  // Effective Baseline Anggaran RBB (A)
  const A = useMemo(() => {
    // 1. If user explicitly entered manual override:
    if (manualBudgetRbb !== null && manualBudgetRbb > 0) {
      return manualBudgetRbb;
    }
    // 2. If work programs loaded from Contract/Project/Payment:
    if (totalWorkProgramBudget > 0) {
      return totalWorkProgramBudget;
    }
    // 3. Fallback to contract's saved costGovernance totalBudgetRbb if valid and > 0
    if (contract.costGovernance?.totalBudgetRbb && contract.costGovernance.totalBudgetRbb > 0) {
      return contract.costGovernance.totalBudgetRbb;
    }
    // 4. Final Fallback
    return contractWorkValue > 0 ? contractWorkValue : 100000000;
  }, [manualBudgetRbb, totalWorkProgramBudget, contract.costGovernance?.totalBudgetRbb, contractWorkValue]);

  const C = contractWorkValue; // Baseline Nilai Kontrak Vendor

  // Helper to build initial 3 default HPS items
  const buildDefaultHpsList = (budgetA: number, contractC: number): HpsItem[] => {
    const baseC = contractC > 0 ? contractC : budgetA * 0.95;
    return [
      {
        id: "hps_it",
        key: "hps_it",
        name: "Harga Perkiraan Sendiri (HPS) IT",
        tag: "HPS IT",
        nominal: Math.round(baseC * 1.05), // Default: 105% of contract (Internal technical ceiling)
        isRemovable: false, // Mandatory minimum 1 HPS
        isBenchmark: false,
        notes: "Estimasi teknis internal IT / Solution Architect",
      },
      {
        id: "hps_umum",
        key: "hps_umum",
        name: "Harga Perkiraan Sendiri (HPS) Umum",
        tag: "HPS Umum",
        nominal: Math.round(baseC * 1.02), // Default: 102% of contract (Procurement benchmark)
        isRemovable: true,
        isBenchmark: false,
        notes: "Procurement unit estimation",
      },
      {
        id: "hps_komite",
        key: "hps_komite",
        name: "Harga Perkiraan Sendiri (HPS) Komite",
        tag: "HPS Komite",
        nominal: Math.round(baseC * 1.0), // Default: Target final tender committee limit
        isRemovable: true,
        isBenchmark: true, // Primary benchmark
        notes: "Ceiling approved by Tender Committee / Board",
      },
    ];
  };

  // Robust data initialization per contract ID
  useEffect(() => {
    if (!contract?.id || !tokenData) return;

    let isMounted = true;

    const applyGovernanceData = (gov: ContractCostGovernanceResponse): boolean => {
      if (gov.id) setCostGovId(gov.id);
      if (gov.totalBudgetRbb && gov.totalBudgetRbb > 0 && gov.totalBudgetRbb !== contract.workValue) {
        setManualBudgetRbb(gov.totalBudgetRbb);
      }
      if (gov.governanceNotes) setGovernanceNotes(gov.governanceNotes);
      if (gov.hpsItems && gov.hpsItems.length > 0) {
        const mappedHps: HpsItem[] = gov.hpsItems.map((item) => ({
          id: item.id || item.hpsKey,
          key: (item.hpsKey as any) || "custom",
          name: item.hpsName,
          tag: item.hpsTag,
          nominal: item.hpsNominal,
          isRemovable: item.isRemovable,
          isBenchmark: item.isBenchmark,
          notes: item.notes || "",
        }));
        setHpsList(mappedHps);
        const benchmark = mappedHps.find((h) => h.isBenchmark) || mappedHps[0];
        if (benchmark) setActiveSelectedHpsId(benchmark.id);
        return true;
      }
      return false;
    };

    // 1. If contract prop already includes costGovernance data
    if (
      contract.costGovernance &&
      contract.costGovernance.hpsItems &&
      contract.costGovernance.hpsItems.length > 0
    ) {
      applyGovernanceData(contract.costGovernance);
    } else if (typeof GetCostGovernanceByContractId === "function") {
      // 2. Otherwise fetch from backend API
      setIsLoadingGov(true);
      GetCostGovernanceByContractId(contract.id, tokenData)
        .then((res) => {
          if (!isMounted) return;
          if (res?.statusCode === RES_CODE_OK && res.data && applyGovernanceData(res.data)) {
            // Applied successfully
          } else {
            setHpsList(buildDefaultHpsList(totalWorkProgramBudget, contract.workValue || 0));
          }
        })
        .catch(() => {
          if (isMounted) {
            setHpsList(buildDefaultHpsList(totalWorkProgramBudget, contract.workValue || 0));
          }
        })
        .finally(() => {
          if (isMounted) setIsLoadingGov(false);
        });
    } else {
      setHpsList(buildDefaultHpsList(totalWorkProgramBudget, contract.workValue || 0));
    }

    // 3. Fetch linked project & payment work programs
    const targetProjectId = contract.projectId;
    if (targetProjectId || typeof GetPaymentByContractId === "function") {
      setIsLoadingWorkPrograms(true);

      const loadWorkProgramsData = async () => {
        try {
          if (targetProjectId) {
            const prjRes = await GetProjectDetail(targetProjectId, tokenData);
            if (isMounted && prjRes?.statusCode === RES_CODE_OK && prjRes.data) {
              setProject(prjRes.data);
            }
          }

          if (typeof GetPaymentByContractId === "function") {
            const pmtRes = await GetPaymentByContractId(contract.id, tokenData);
            if (isMounted && pmtRes?.statusCode === RES_CODE_OK && pmtRes.data) {
              setPaymentData(pmtRes.data);
            }
          }
        } catch {
          // graceful fallback
        } finally {
          setIsLoadingWorkPrograms(false);
        }
      };

      loadWorkProgramsData();
    } else {
      setIsLoadingWorkPrograms(false);
    }

    // 4. Fetch Cost Governance Revision Snapshots
    if (typeof GetCostGovHistoryList === "function") {
      setIsLoadingHistory(true);
      GetCostGovHistoryList(contract.id, tokenData)
        .then((res) => {
          if (!isMounted) return;
          if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data)) {
            setCostGovHistories(res.data);
          }
        })
        .catch(() => {})
        .finally(() => {
          if (isMounted) setIsLoadingHistory(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [contract?.id, contract?.projectId, tokenData]);

  const fetchCostGovHistory = async () => {
    if (!contract?.id || !tokenData || typeof GetCostGovHistoryList !== "function") return;
    setIsLoadingHistory(true);
    try {
      const res = await GetCostGovHistoryList(contract.id, tokenData);
      if (res?.statusCode === RES_CODE_OK && Array.isArray(res.data)) {
        setCostGovHistories(res.data);
      }
    } catch {
      // graceful fallback
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // -------------------------------------------------------------
  // DYNAMIC HPS ACTIONS
  // -------------------------------------------------------------

  const handleUpdateHpsNominal = (id: string, nominal: number) => {
    setHpsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, nominal } : item))
    );
  };

  const handleUpdateHpsName = (id: string, name: string) => {
    setHpsList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleSetBenchmark = (id: string) => {
    setHpsList((prev) =>
      prev.map((item) => ({
        ...item,
        isBenchmark: item.id === id,
      }))
    );
    setActiveSelectedHpsId(id);
  };

  const handleAddCustomHps = () => {
    const customCount = hpsList.filter((h) => h.key === "custom").length + 1;
    const newId = `hps_custom_${Date.now()}`;
    const defaultNominal = C > 0 ? C : Math.round(A * 0.95);
    const newItem: HpsItem = {
      id: newId,
      key: "custom",
      name: `Harga Perkiraan Sendiri (HPS) Kustom ${customCount}`,
      tag: `Kustom ${customCount}`,
      nominal: defaultNominal,
      isRemovable: true,
      isBenchmark: false,
      notes: "Additional estimation / Independent reviewer",
    };
    setHpsList((prev) => [...prev, newItem]);
    setActiveSelectedHpsId(newId);
  };

  const handleDeleteHps = (id: string) => {
    const itemToDelete = hpsList.find((h) => h.id === id);
    if (!itemToDelete || !itemToDelete.isRemovable) return; // Prevent deleting mandatory HPS IT

    const remaining = hpsList.filter((h) => h.id !== id);
    if (itemToDelete.isBenchmark && remaining.length > 0) {
      remaining[0].isBenchmark = true;
    }
    if (activeSelectedHpsId === id && remaining.length > 0) {
      setActiveSelectedHpsId(remaining[0].id);
    }
    setHpsList(remaining);
  };

  const handleResetDefault = () => {
    setHpsList(buildDefaultHpsList(A, C));
    setActiveSelectedHpsId("hps_komite");
    toast({
      title: "Reset Parameter HPS",
      description: "HPS baselines reset to 3 default variants (IT, General, Committee)",
      status: "info",
      duration: 3000,
      isClosable: true,
      position: "top-right",
    });
  };

  const handleSyncBudgetWithWorkPrograms = () => {
    if (totalWorkProgramBudget > 0) {
      setManualBudgetRbb(totalWorkProgramBudget);
      toast({
        title: "Sync Successful",
        description: `Total RBB Budget synchronized to ${formatIDR(totalWorkProgramBudget)}`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const handleSaveGovernance = async () => {
    if (!contract?.id || !tokenData) return;
    setIsSaving(true);
    try {
      const benchmarkItem = hpsList.find((h) => h.isBenchmark) || hpsList[0];

      const payload: ContractCostGovernanceSavePayload = {
        id: costGovId || null,
        venContractId: contract.id,
        projectId: contract.projectId || null,
        totalBudgetRbb: A,
        contractWorkValue: C,
        benchmarkHpsKey: benchmarkItem?.key || "hps_komite",
        globalResapanNominal: diff3Nominal,
        globalResapanPercentage: diff3Percentage,
        globalResapanStatus: note3,
        hpsSpreadNominal: spreadNominal,
        itVsKomiteDelta: itVsKomiteDelta,
        itVsKomitePercentage: itVsKomitePct,
        governanceNotes: governanceNotes.trim() || null,
        status: "ACTIVE",
        revisionReason: revisionReason.trim() || "Cost Governance & HPS Parameter Modification",
        hpsItems: evaluatedHpsList.map((item, idx) => ({
          id:
            item.id.startsWith("hps_custom_") ||
            item.id === "hps_it" ||
            item.id === "hps_umum" ||
            item.id === "hps_komite"
              ? item.id.length === 36
                ? item.id
                : null
              : item.id,
          hpsKey: item.key,
          hpsName: item.name,
          hpsTag: item.tag,
          hpsNominal: item.nominal,
          isBenchmark: item.isBenchmark,
          isRemovable: item.isRemovable,
          stepOrder: idx + 1,
          diffRbbNominal: item.diff1Nominal,
          diffRbbPercentage: item.diff1Percentage,
          diffRbbStatus: item.note1,
          diffContractNominal: item.diff2Nominal,
          diffContractPercentage: item.diff2Percentage,
          diffContractStatus: item.note2,
          notes: item.notes || null,
        })),
      };

      if (typeof SaveCostGovernance !== "function") {
        throw new Error("Storage service is not ready. Please refresh the page.");
      }

      const res = await SaveCostGovernance(payload, tokenData);
      if (res?.statusCode === RES_CODE_OK) {
        toast({
          title: "Save Successful",
          description: "Cost Governance data & HPS comparisons updated successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
        if (res.data) setCostGovId(res.data);
        setRevisionReason("");
        fetchCostGovHistory();
        onRefreshContract?.();
      } else {
        toast({
          title: "Failed to Save",
          description: res?.message || "An error occurred while saving",
          status: "error",
          duration: 4000,
          isClosable: true,
          position: "top-right",
        });
      }
    } catch (err: any) {
      toast({
        title: "Failed to Save",
        description: err?.message || "Terjadi kesalahan jaringan",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // -------------------------------------------------------------
  // CALCULATIONS & FORMULAS (Multi-HPS Governance Matrix)
  // -------------------------------------------------------------

  // Global Ratio: Anggaran RBB vs Contract Value (Budget Absorption)
  // Formula: (A - C) / A
  const diff3Nominal = A - C;
  const diff3Percentage = A > 0 ? (diff3Nominal / A) * 100 : 0;
  const note3 =
    diff3Nominal > 0
      ? "RBB Budget Surplus / Remaining"
      : diff3Nominal === 0
      ? "Matches RBB Budget Ceiling"
      : "Contract Exceeds RBB Budget";

  // Calculations for each HPS item
  const evaluatedHpsList = useMemo(() => {
    return hpsList.map((item) => {
      const H = item.nominal;

      // 1. Ratio Anggaran RBB vs HPS (Budget Sufficiency)
      // Formula: (A - H) / A
      const diff1Nominal = A - H;
      const diff1Percentage = A > 0 ? (diff1Nominal / A) * 100 : 0;
      const isBudgetSufficient = diff1Nominal >= 0;
      const note1 = isBudgetSufficient
        ? "RBB Budget is Sufficient"
        : "RBB Budget is Insufficient";

      // 2. Ratio HPS vs Kontrak (Procurement Savings vs HPS)
      // Formula: (H - C) / H
      const diff2Nominal = H - C;
      const diff2Percentage = H > 0 ? (diff2Nominal / H) * 100 : 0;
      const note2 =
        diff2Nominal > 0
          ? "Terdapat Penghematan"
          : diff2Nominal === 0
          ? "Sesuai HPS"
          : "Contract Exceeds HPS";

      return {
        ...item,
        H,
        diff1Nominal,
        diff1Percentage,
        isBudgetSufficient,
        note1,
        diff2Nominal,
        diff2Percentage,
        note2,
      };
    });
  }, [hpsList, A, C]);

  // Selected HPS Item for the 3 Hero Comparison Cards
  const selectedHpsItem =
    evaluatedHpsList.find((h) => h.id === activeSelectedHpsId) ||
    evaluatedHpsList.find((h) => h.isBenchmark) ||
    evaluatedHpsList[0];

  // Inter-HPS Statistics (Spread)
  const hpsNominals = evaluatedHpsList.map((h) => h.H);
  const minHps = hpsNominals.length > 0 ? Math.min(...hpsNominals) : 0;
  const maxHps = hpsNominals.length > 0 ? Math.max(...hpsNominals) : 0;
  const spreadNominal = maxHps - minHps;

  const hpsItItem = evaluatedHpsList.find((h) => h.key === "hps_it");
  const hpsKomiteItem = evaluatedHpsList.find((h) => h.key === "hps_komite");
  const itVsKomiteDelta =
    hpsItItem && hpsKomiteItem ? hpsItItem.H - hpsKomiteItem.H : 0;
  const itVsKomitePct =
    hpsItItem && hpsItItem.H > 0
      ? (itVsKomiteDelta / hpsItItem.H) * 100
      : 0;

  const formatPct = (num: number) => {
    const formatted = num.toFixed(2);
    return num > 0 ? `+${formatted}%` : `${formatted}%`;
  };

  const getTagColor = (key: string) => {
    switch (key) {
      case "hps_it":
        return "purple";
      case "hps_umum":
        return "cyan";
      case "hps_komite":
        return "blue";
      default:
        return "orange";
    }
  };

  return (
    <VStack spacing={6} align="stretch" w="full">
      {/* ========================================================= */}
      {/* SECTION 1: HEADER BANNER & GLOBAL FINANCIAL BASELINE      */}
      {/* ========================================================= */}
      <Card
        rounded="xl"
        border="1px"
        borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
        bg={colorMode === "light" ? "blue.50/40" : "gray.850"}
        shadow="sm"
      >
        <CardBody p={5}>
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            direction={{ base: "column", md: "row" }}
            gap={4}
          >
            {/* Left Title */}
            <HStack spacing={3.5}>
              <Box
                w={12}
                h={12}
                rounded="xl"
                bg="blue.500"
                color="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                shadow="md"
              >
                <Icon as={FiTrendingUp} boxSize={6} />
              </Box>
              <VStack align="start" spacing={0.5}>
                <HStack spacing={2}>
                  <Heading size="md" color={colorMode === "light" ? "gray.800" : "white"}>
                    Cost Governance & Multi-HPS Analytics
                  </Heading>
                  <Badge colorScheme="purple" fontSize="xs" px={2} py={0.5} rounded="md">
                    Multi-Tier Review ({evaluatedHpsList.length} HPS)
                  </Badge>
                  {costGovHistories.length > 0 && (
                    <Badge
                      as="button"
                      colorScheme="blue"
                      variant="outline"
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      rounded="md"
                      cursor="pointer"
                      _hover={{ bg: "blue.500", color: "white" }}
                      onClick={() => setIsHistoryModalOpen(true)}
                    >
                      {costGovHistories.length} Snapshot History
                    </Badge>
                  )}
                </HStack>
                <Text fontSize="sm" color="gray.500">
                  3-pillar comparison analytics: RBB Work Program Budget, Multi-HPS (IT, General, Committee), and Vendor Contract Value
                </Text>
              </VStack>
            </HStack>

            {/* Right: 3 Global Baseline Metrics */}
            <HStack
              spacing={5}
              divider={<Divider orientation="vertical" h="36px" borderColor="gray.300" />}
              wrap="wrap"
            >
              {/* Metric A: Anggaran RBB */}
              <VStack align={{ base: "start", md: "end" }} spacing={0}>
                <HStack spacing={1.5}>
                  <Text fontSize="xs" fontWeight="bold" color="blue.600" textTransform="uppercase">
                    Total RBB Budget (A)
                  </Text>
                  <Tooltip label="Click to modify or adjust RBB Budget Ceiling" fontSize="xs">
                    <IconButton
                      aria-label="Edit RBB Budget Ceiling"
                      icon={<FiEdit3 />}
                      size="xs"
                      variant="ghost"
                      colorScheme="blue"
                      onClick={() => setIsEditingRbb(!isEditingRbb)}
                    />
                  </Tooltip>
                </HStack>
                <Heading size="md" color="blue.600" fontWeight="800">
                  {formatIDR(A)}
                </Heading>
              </VStack>

              {/* Metric C: Nilai Kontrak */}
              <VStack align={{ base: "start", md: "end" }} spacing={0}>
                <Text fontSize="xs" fontWeight="bold" color="teal.600" textTransform="uppercase">
                  Contract Value (C)
                </Text>
                <Heading size="md" color="teal.600" fontWeight="800">
                  {formatIDR(C)}
                </Heading>
              </VStack>

              {/* Metric A vs C: Resapan Anggaran RBB */}
              <VStack align={{ base: "start", md: "end" }} spacing={0}>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                  Budget Absorption (A vs C)
                </Text>
                <HStack spacing={2}>
                  <Text
                    fontSize="sm"
                    fontWeight="800"
                    color={diff3Nominal >= 0 ? "blue.600" : "red.500"}
                  >
                    {formatPct(diff3Percentage)}
                  </Text>
                  <Badge
                    colorScheme={diff3Nominal > 0 ? "blue" : diff3Nominal === 0 ? "gray" : "red"}
                    fontSize="xs"
                    px={1.5}
                    py={0.5}
                    rounded="md"
                  >
                    {diff3Nominal > 0 ? "Terserap" : diff3Nominal === 0 ? "Sesuai" : "Defisit"}
                  </Badge>
                </HStack>
              </VStack>
            </HStack>
          </Flex>

          {/* Expandable Manual Anggaran RBB Configuration */}
          <Collapse in={isEditingRbb} animateOpacity>
            <Box
              mt={4}
              pt={4}
              borderTop="1px"
              borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
            >
              <Grid templateColumns={{ base: "1fr", md: "1.5fr 1fr" }} gap={4} alignItems="center">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold" color={colorMode === "light" ? "gray.700" : "gray.200"}>
                    Manual Adjustment of RBB Budget Ceiling (A):
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    This value serves as the comparison baseline against all HPS variants and Contract Value.
                  </Text>
                  <Box w="full" maxW="380px" mt={1}>
                    <CurrencyInput
                      size="md"
                      rounded="lg"
                      name="manual_budget_rbb"
                      value={A}
                      onChange={(_, val) => setManualBudgetRbb(val || 0)}
                    />
                  </Box>
                </VStack>

                <VStack align={{ base: "start", md: "end" }} spacing={2}>
                  {totalWorkProgramBudget > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      colorScheme="purple"
                      leftIcon={<FiRefreshCw />}
                      onClick={handleSyncBudgetWithWorkPrograms}
                    >
                      Sinkronkan Total Pos RBB ({formatIDR(totalWorkProgramBudget)})
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="gray"
                    onClick={() => setIsEditingRbb(false)}
                  >
                    Close Adjustment Panel
                  </Button>
                </VStack>
              </Grid>
            </Box>
          </Collapse>
        </CardBody>
      </Card>

      {/* ========================================================= */}
      {/* SECTION 2: DYNAMIC MULTI-HPS INPUT MANAGER                */}
      {/* ========================================================= */}
      <Card
        rounded="xl"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
        shadow="sm"
      >
        <CardHeader
          bg={colorMode === "light" ? "gray.50" : "gray.900"}
          py={4}
          px={5}
          roundedTop="xl"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={2.5}>
              <Icon as={FiSliders} color="purple.500" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Heading size="md">
                  Konfigurasi Dynamic HPS ({evaluatedHpsList.length} Model)
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  IT HPS is required (minimum 1 HPS). General & Committee HPS are active by default. You can dynamically add custom HPS.
                </Text>
              </VStack>
            </HStack>

            {/* Actions: Reset, Add HPS & Save */}
            <HStack spacing={2.5} wrap="wrap">
              <Button
                size="sm"
                variant="outline"
                colorScheme="gray"
                leftIcon={<FiRotateCcw />}
                onClick={handleResetDefault}
              >
                Reset Default (3 HPS)
              </Button>

              <Button
                size="sm"
                colorScheme="purple"
                leftIcon={<FiPlus />}
                onClick={handleAddCustomHps}
              >
                Add Custom HPS
              </Button>

              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<FiSave />}
                isLoading={isSaving}
                loadingText="Saving..."
                onClick={handleSaveGovernance}
              >
                Save Cost Governance
              </Button>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody p={5}>
          <Grid
            templateColumns={{
              base: "1fr",
              md: evaluatedHpsList.length <= 3 ? `repeat(${evaluatedHpsList.length}, 1fr)` : "repeat(3, 1fr)",
              lg: `repeat(${Math.min(evaluatedHpsList.length, 3)}, 1fr)`,
            }}
            gap={4}
          >
            {evaluatedHpsList.map((item) => {
              const tagColor = getTagColor(item.key);
              const isSelected = item.id === activeSelectedHpsId;

              return (
                <GridItem key={item.id}>
                  <Box
                    p={4}
                    rounded="xl"
                    border="2px solid"
                    borderColor={
                      isSelected
                        ? "purple.500"
                        : item.isBenchmark
                        ? "blue.400"
                        : colorMode === "light"
                        ? "gray.200"
                        : "gray.700"
                    }
                    bg={
                      isSelected
                        ? colorMode === "light"
                          ? "purple.50/20"
                          : "purple.900/10"
                        : item.isBenchmark
                        ? colorMode === "light"
                          ? "blue.50/20"
                          : "blue.900/10"
                        : colorMode === "light"
                        ? "white"
                        : "gray.800"
                    }
                    shadow={isSelected || item.isBenchmark ? "sm" : "none"}
                    transition="all 0.15s ease-in-out"
                  >
                    <VStack align="stretch" spacing={3}>
                      {/* Card Header: Tag, Name & Controls */}
                      <Flex justify="space-between" align="center" gap={2}>
                        <HStack spacing={2} flex={1} minW={0}>
                          <Badge
                            colorScheme={tagColor}
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            rounded="md"
                            flexShrink={0}
                          >
                            {item.tag}
                          </Badge>

                          {item.key === "custom" ? (
                            <Input
                              size="sm"
                              value={item.name}
                              onChange={(e) => handleUpdateHpsName(item.id, e.target.value)}
                              fontWeight="bold"
                              rounded="md"
                              placeholder="Nama HPS..."
                            />
                          ) : (
                            <Text
                              fontSize="sm"
                              fontWeight="bold"
                              noOfLines={1}
                              title={item.name}
                            >
                              {item.name}
                            </Text>
                          )}
                        </HStack>

                        {/* Benchmark Star & Delete Button */}
                        <HStack spacing={1}>
                          <Tooltip
                            label={item.isBenchmark ? "Acuan Utama Aktif" : "Jadikan Acuan Utama"}
                            fontSize="xs"
                          >
                            <IconButton
                              aria-label="Set Benchmark"
                              icon={<FiStar />}
                              size="sm"
                              variant={item.isBenchmark ? "solid" : "ghost"}
                              colorScheme={item.isBenchmark ? "yellow" : "gray"}
                              onClick={() => handleSetBenchmark(item.id)}
                            />
                          </Tooltip>

                          {item.isRemovable && (
                            <Tooltip label="Delete this HPS" fontSize="xs">
                              <IconButton
                                aria-label="Delete HPS"
                                icon={<FiTrash2 />}
                                size="sm"
                                variant="ghost"
                                colorScheme="red"
                                onClick={() => handleDeleteHps(item.id)}
                              />
                            </Tooltip>
                          )}
                        </HStack>
                      </Flex>

                      {/* Currency Input (Medium Size) */}
                      <Box>
                        <CurrencyInput
                          size="md"
                          rounded="lg"
                          name={`hps_${item.id}`}
                          value={item.nominal}
                          onChange={(_, val) => handleUpdateHpsNominal(item.id, val || 0)}
                        />
                      </Box>

                      {/* Card Subtext / Mini Stats */}
                      <Flex justify="space-between" align="center" fontSize="xs" pt={1}>
                        <HStack spacing={1}>
                          <Text color="gray.500">vs RBB Budget:</Text>
                          <Text
                            fontWeight="bold"
                            color={item.isBudgetSufficient ? "green.500" : "red.500"}
                          >
                            {formatPct(item.diff1Percentage)}
                          </Text>
                        </HStack>
                        <HStack spacing={1}>
                          <Text color="gray.500">vs Contract:</Text>
                          <Text
                            fontWeight="bold"
                            color={
                              item.diff2Percentage > 0
                                ? "teal.500"
                                : item.diff2Percentage === 0
                                ? "gray.500"
                                : "red.500"
                            }
                          >
                            {formatPct(item.diff2Percentage)}
                          </Text>
                        </HStack>
                      </Flex>
                    </VStack>
                  </Box>
                </GridItem>
              );
            })}
          </Grid>
        </CardBody>
      </Card>

      {/* ========================================================= */}
      {/* SECTION 3: 3 COMPARATIVE GOVERNANCE RESULT CARDS          */}
      {/* ========================================================= */}
      <Box>
        {/* Selector Tab for active HPS perspective */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={3} mb={3}>
          <HStack spacing={2}>
            <Icon as={FiPieChart} color="blue.500" boxSize={5} />
            <VStack align="start" spacing={0}>
              <Heading size="md">Cost Comparison & Deviation Analytics</Heading>
              <Text fontSize="sm" color="gray.500">
                Select an HPS baseline to view deviation evaluations, percentage differences, and trend indicators
              </Text>
            </VStack>
          </HStack>

          {/* Perspective Selector Pills */}
          <HStack spacing={2} wrap="wrap">
            <Text fontSize="xs" color="gray.500" fontWeight="bold">
              Tinjau Berdasarkan:
            </Text>
            {evaluatedHpsList.map((h) => (
              <Button
                key={h.id}
                size="sm"
                variant={activeSelectedHpsId === h.id ? "solid" : "outline"}
                colorScheme={getTagColor(h.key)}
                onClick={() => setActiveSelectedHpsId(h.id)}
                leftIcon={h.isBenchmark ? <FiStar /> : undefined}
              >
                {h.tag} {h.isBenchmark && "(Acuan)"}
              </Button>
            ))}
          </HStack>
        </Flex>

        {/* 3 Large Result Cards (Nominal + Percentage + Up/Down Arrows) */}
        {selectedHpsItem && (
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={4}>
            {/* Card 1: RBB Budget Sufficiency (A vs Selected HPS) */}
            <GridItem>
              <Box
                p={5}
                rounded="xl"
                border="1px"
                borderColor={selectedHpsItem.isBudgetSufficient ? "green.300" : "red.300"}
                bg={
                  selectedHpsItem.isBudgetSufficient
                    ? colorMode === "light"
                      ? "green.50/50"
                      : "gray.850"
                    : colorMode === "light"
                    ? "red.50/50"
                    : "gray.850"
                }
                shadow="sm"
              >
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={selectedHpsItem.isBudgetSufficient ? "green.600" : "red.600"}
                      >
                        1. RBB Budget Sufficiency
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Total RBB Budget vs {selectedHpsItem.tag}
                      </Text>
                    </VStack>
                    <Icon
                      as={selectedHpsItem.isBudgetSufficient ? FiArrowUpRight : FiArrowDownRight}
                      color={selectedHpsItem.isBudgetSufficient ? "green.500" : "red.500"}
                      boxSize={6}
                    />
                  </Flex>

                  <VStack align="start" spacing={0.5}>
                    <HStack spacing={2.5} align="baseline">
                      <Text
                        fontSize="3xl"
                        fontWeight="800"
                        color={selectedHpsItem.isBudgetSufficient ? "green.600" : "red.500"}
                      >
                        {formatPct(selectedHpsItem.diff1Percentage)}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        ({formatIDR(selectedHpsItem.diff1Nominal)})
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={selectedHpsItem.isBudgetSufficient ? "green" : "red"}
                      fontSize="xs"
                      px={2.5}
                      py={1}
                      rounded="md"
                    >
                      {selectedHpsItem.note1}
                    </Badge>
                  </VStack>

                  <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

                  <Text fontSize="xs" color="gray.500">
                    Formula: (Total RBB Budget - {selectedHpsItem.tag}) / Total RBB Budget
                  </Text>
                </VStack>
              </Box>
            </GridItem>

            {/* Card 2: Efisiensi Pengadaan (Selected HPS vs Kontrak) */}
            <GridItem>
              <Box
                p={5}
                rounded="xl"
                border="1px"
                borderColor={
                  selectedHpsItem.diff2Percentage > 0
                    ? "teal.300"
                    : selectedHpsItem.diff2Percentage === 0
                    ? "gray.300"
                    : "red.300"
                }
                bg={
                  selectedHpsItem.diff2Percentage > 0
                    ? colorMode === "light"
                      ? "teal.50/50"
                      : "gray.850"
                    : selectedHpsItem.diff2Percentage === 0
                    ? colorMode === "light"
                      ? "gray.50"
                      : "gray.850"
                    : colorMode === "light"
                    ? "red.50/50"
                    : "gray.850"
                }
                shadow="sm"
              >
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={
                          selectedHpsItem.diff2Percentage > 0
                            ? "teal.600"
                            : selectedHpsItem.diff2Percentage === 0
                            ? "gray.600"
                            : "red.600"
                        }
                      >
                        2. Procurement Efficiency vs HPS
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {selectedHpsItem.tag} vs Contract Value
                      </Text>
                    </VStack>
                    <Icon
                      as={
                        selectedHpsItem.diff2Percentage > 0
                          ? FiArrowUpRight
                          : selectedHpsItem.diff2Percentage === 0
                          ? FiMinus
                          : FiArrowDownRight
                      }
                      color={
                        selectedHpsItem.diff2Percentage > 0
                          ? "teal.500"
                          : selectedHpsItem.diff2Percentage === 0
                          ? "gray.400"
                          : "red.500"
                      }
                      boxSize={6}
                    />
                  </Flex>

                  <VStack align="start" spacing={0.5}>
                    <HStack spacing={2.5} align="baseline">
                      <Text
                        fontSize="3xl"
                        fontWeight="800"
                        color={
                          selectedHpsItem.diff2Percentage > 0
                            ? "teal.600"
                            : selectedHpsItem.diff2Percentage === 0
                            ? "gray.600"
                            : "red.500"
                        }
                      >
                        {formatPct(selectedHpsItem.diff2Percentage)}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        ({formatIDR(selectedHpsItem.diff2Nominal)})
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        selectedHpsItem.diff2Percentage > 0
                          ? "teal"
                          : selectedHpsItem.diff2Percentage === 0
                          ? "gray"
                          : "red"
                      }
                      fontSize="xs"
                      px={2.5}
                      py={1}
                      rounded="md"
                    >
                      {selectedHpsItem.note2}
                    </Badge>
                  </VStack>

                  <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

                  <Text fontSize="xs" color="gray.500">
                    Formula: ({selectedHpsItem.tag} - Contract Value) / {selectedHpsItem.tag}
                  </Text>
                </VStack>
              </Box>
            </GridItem>

            {/* Card 3: Resapan Anggaran RBB (A vs Kontrak) */}
            <GridItem>
              <Box
                p={5}
                rounded="xl"
                border="1px"
                borderColor={
                  diff3Percentage > 0
                    ? "blue.300"
                    : diff3Percentage === 0
                    ? "gray.300"
                    : "red.300"
                }
                bg={
                  diff3Percentage > 0
                    ? colorMode === "light"
                      ? "blue.50/50"
                      : "gray.850"
                    : diff3Percentage === 0
                    ? colorMode === "light"
                      ? "gray.50"
                      : "gray.850"
                    : colorMode === "light"
                    ? "red.50/50"
                    : "gray.850"
                }
                shadow="sm"
              >
                <VStack align="stretch" spacing={3}>
                  <Flex justify="space-between" align="center">
                    <VStack align="start" spacing={0}>
                      <Text
                        fontSize="sm"
                        fontWeight="bold"
                        color={
                          diff3Percentage > 0
                            ? "blue.600"
                            : diff3Percentage === 0
                            ? "gray.600"
                            : "red.600"
                        }
                      >
                        3. RBB Budget Absorption
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        Total RBB Budget vs Contract Value
                      </Text>
                    </VStack>
                    <Icon
                      as={
                        diff3Percentage > 0
                          ? FiArrowUpRight
                          : diff3Percentage === 0
                          ? FiMinus
                          : FiArrowDownRight
                      }
                      color={
                        diff3Percentage > 0
                          ? "blue.500"
                          : diff3Percentage === 0
                          ? "gray.400"
                          : "red.500"
                      }
                      boxSize={6}
                    />
                  </Flex>

                  <VStack align="start" spacing={0.5}>
                    <HStack spacing={2.5} align="baseline">
                      <Text
                        fontSize="3xl"
                        fontWeight="800"
                        color={
                          diff3Percentage > 0
                            ? "blue.600"
                            : diff3Percentage === 0
                            ? "gray.600"
                            : "red.500"
                        }
                      >
                        {formatPct(diff3Percentage)}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" color="gray.600">
                        ({formatIDR(diff3Nominal)})
                      </Text>
                    </HStack>
                    <Badge
                      colorScheme={
                        diff3Percentage > 0
                          ? "blue"
                          : diff3Percentage === 0
                          ? "gray"
                          : "red"
                      }
                      fontSize="xs"
                      px={2.5}
                      py={1}
                      rounded="md"
                    >
                      {note3}
                    </Badge>
                  </VStack>

                  <Divider borderColor={colorMode === "light" ? "gray.200" : "gray.700"} />

                  <Text fontSize="xs" color="gray.500">
                    Formula: (Total RBB Budget - Contract Value) / Total RBB Budget
                  </Text>
                </VStack>
              </Box>
            </GridItem>
          </Grid>
        )}
      </Box>

      {/* ========================================================= */}
      {/* SECTION 4: UNIFIED MULTI-HPS COMPARATIVE MATRIX TABLE     */}
      {/* ========================================================= */}
      <Card
        rounded="xl"
        shadow="sm"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <CardHeader
          bg={colorMode === "light" ? "gray.50" : "gray.900"}
          py={4}
          px={5}
          roundedTop="xl"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={2.5}>
              <Icon as={FiPieChart} color="teal.500" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Heading size="md">Multi-HPS Comparison Matrix</Heading>
                <Text fontSize="sm" color="gray.500">
                  Comprehensive comparison matrix of all HPS variants against RBB Budget and Contract Value
                </Text>
              </VStack>
            </HStack>

            {selectedHpsItem && (
              <Badge colorScheme="blue" fontSize="sm" px={3} py={1} rounded="md">
                Acuan Aktif: {selectedHpsItem.name} ({formatIDR(selectedHpsItem.nominal)})
              </Badge>
            )}
          </Flex>
        </CardHeader>

        <CardBody p={0}>
          <TableContainer>
            <Table variant="simple" size="md">
              <Thead bg={colorMode === "light" ? "gray.50" : "gray.850"}>
                <Tr>
                  <Th fontSize="xs" py={3} w="40px">
                    No.
                  </Th>
                  <Th fontSize="xs" py={3}>
                    Pilar & Model HPS
                  </Th>
                  <Th fontSize="xs" py={3} isNumeric>
                    Nominal HPS (Rp.)
                  </Th>
                  <Th fontSize="xs" py={3} isNumeric>
                    vs RBB Budget (A - H)
                  </Th>
                  <Th fontSize="xs" py={3}>
                    RBB Budget Sufficiency
                  </Th>
                  <Th fontSize="xs" py={3} isNumeric>
                    vs Contract Value (H - C)
                  </Th>
                  <Th fontSize="xs" py={3}>
                    Efficiency vs HPS
                  </Th>
                </Tr>
              </Thead>
              <Tbody fontSize="sm">
                {evaluatedHpsList.map((item, idx) => {
                  const tagColor = getTagColor(item.key);

                  return (
                    <Tr
                      key={item.id}
                      bg={
                        item.isBenchmark
                          ? colorMode === "light"
                            ? "blue.50/30"
                            : "blue.900/10"
                          : "transparent"
                      }
                      _hover={{
                        bg: colorMode === "light" ? "gray.50" : "gray.800",
                      }}
                    >
                      {/* No */}
                      <Td fontWeight="bold" fontSize="sm">
                        {idx + 1}
                      </Td>

                      {/* Name & Tag */}
                      <Td>
                        <HStack spacing={2.5}>
                          <Badge
                            colorScheme={tagColor}
                            fontSize="xs"
                            px={2}
                            py={0.5}
                            rounded="md"
                          >
                            {item.tag}
                          </Badge>
                          <VStack align="start" spacing={0}>
                            <HStack spacing={1.5}>
                              <Text fontWeight="semibold" fontSize="sm">
                                {item.name}
                              </Text>
                              {item.isBenchmark && (
                                <Badge colorScheme="yellow" fontSize="xs" px={1.5} rounded="sm">
                                  Acuan Utama
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {item.notes || "Procurement evaluation HPS model"}
                            </Text>
                          </VStack>
                        </HStack>
                      </Td>

                      {/* Nominal HPS */}
                      <Td isNumeric fontWeight="bold" fontSize="sm">
                        {formatIDR(item.nominal)}
                      </Td>

                      {/* vs Anggaran RBB */}
                      <Td isNumeric>
                        <VStack align="end" spacing={0}>
                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color={item.isBudgetSufficient ? "green.500" : "red.500"}
                          >
                            {formatPct(item.diff1Percentage)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatIDR(item.diff1Nominal)}
                          </Text>
                        </VStack>
                      </Td>

                      {/* Status Anggaran RBB */}
                      <Td>
                        <Badge
                          colorScheme={item.isBudgetSufficient ? "green" : "red"}
                          fontSize="xs"
                          px={2.5}
                          py={0.5}
                          rounded="md"
                        >
                          {item.note1}
                        </Badge>
                      </Td>

                      {/* vs Contract Value */}
                      <Td isNumeric>
                        <VStack align="end" spacing={0}>
                          <Text
                            fontWeight="bold"
                            fontSize="sm"
                            color={
                              item.diff2Percentage > 0
                                ? "teal.500"
                                : item.diff2Percentage === 0
                                ? "gray.500"
                                : "red.500"
                            }
                          >
                            {formatPct(item.diff2Percentage)}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {formatIDR(item.diff2Nominal)}
                          </Text>
                        </VStack>
                      </Td>

                      {/* Status Efisiensi HPS */}
                      <Td>
                        <Badge
                          colorScheme={
                            item.diff2Percentage > 0
                              ? "teal"
                              : item.diff2Percentage === 0
                              ? "gray"
                              : "red"
                          }
                          fontSize="xs"
                          px={2.5}
                          py={0.5}
                          rounded="md"
                        >
                          {item.note2}
                        </Badge>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>

          {/* Footer Statistics Bar (Inter-HPS Spread & Variance) */}
          <Box
            p={4}
            bg={colorMode === "light" ? "gray.50" : "gray.850"}
            borderTop="1px"
            borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
          >
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={3}
              fontSize="xs"
              color="gray.600"
            >
              <HStack spacing={4} wrap="wrap">
                <HStack spacing={1.5}>
                  <Text fontWeight="bold">Sebaran HPS (Spread):</Text>
                  <Text fontWeight="bold" color="purple.600">
                    {formatIDR(spreadNominal)}
                  </Text>
                  <Text color="gray.500">
                    ({formatIDR(minHps)} s/d {formatIDR(maxHps)})
                  </Text>
                </HStack>

                {hpsItItem && hpsKomiteItem && (
                  <HStack spacing={1.5}>
                    <Text fontWeight="bold">• Rasionalisasi Komite vs IT:</Text>
                    <Text
                      fontWeight="bold"
                      color={itVsKomiteDelta >= 0 ? "teal.600" : "red.500"}
                    >
                      {formatPct(itVsKomitePct)} ({formatIDR(itVsKomiteDelta)})
                    </Text>
                  </HStack>
                )}
              </HStack>

              <HStack spacing={1.5}>
                <Text fontWeight="bold">Global Contract Absorption (A vs C):</Text>
                <Badge
                  colorScheme={diff3Percentage >= 0 ? "blue" : "red"}
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  rounded="md"
                >
                  {note3} ({formatPct(diff3Percentage)})
                </Badge>
              </HStack>
            </Flex>
          </Box>
        </CardBody>
      </Card>

      {/* ========================================================= */}
      {/* SECTION 4.5: GOVERNANCE NOTES & AUDIT REVISION ACTIONS   */}
      {/* ========================================================= */}
      <Card
        rounded="xl"
        shadow="sm"
        border="1px"
        borderColor={colorMode === "light" ? "blue.200" : "blue.800"}
        bg={colorMode === "light" ? "white" : "gray.850"}
      >
        <CardHeader
          bg={colorMode === "light" ? "blue.50/50" : "gray.900"}
          py={4}
          px={5}
          roundedTop="xl"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={2.5}>
              <Icon as={FiFileText} color="blue.500" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Heading size="md">
                  Governance Notes & Change Log
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  Save HPS evaluation parameters and document revision rationale for procurement compliance audit trail
                </Text>
              </VStack>
            </HStack>

            <HStack spacing={2.5}>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                leftIcon={<FiClock />}
                isLoading={isLoadingHistory}
                onClick={() => setIsHistoryModalOpen(true)}
              >
                Snapshot History ({costGovHistories.length})
              </Button>
            </HStack>
          </Flex>
        </CardHeader>

        <CardBody p={5}>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={4} mb={4}>
            <GridItem>
              <VStack align="start" spacing={1.5}>
                <HStack spacing={1.5}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
                    Governance Notes / Rationale (Optional)
                  </Text>
                  <Tooltip label="Additional notes regarding calculation rationale or reviewer recommendations." fontSize="xs">
                    <Box as="span" cursor="pointer"><Icon as={FiInfo} color="gray.400" boxSize={3.5} /></Box>
                  </Tooltip>
                </HStack>
                <Textarea
                  size="sm"
                  rows={3}
                  rounded="lg"
                  placeholder="Contoh: Plafon HPS Komite telah disesuaikan berdasarkan persetujuan Rapat Direksi No. RD-042/2026..."
                  value={governanceNotes}
                  onChange={(e) => setGovernanceNotes(e.target.value)}
                />
              </VStack>
            </GridItem>

            <GridItem>
              <VStack align="start" spacing={1.5}>
                <HStack spacing={1.5}>
                  <Text fontSize="xs" fontWeight="bold" color="gray.600" textTransform="uppercase">
                    Revision Reason / Change Rationale
                  </Text>
                  <Tooltip label="Revision reason will be recorded in the cost governance change history snapshot log." fontSize="xs">
                    <Box as="span" cursor="pointer"><Icon as={FiInfo} color="gray.400" boxSize={3.5} /></Box>
                  </Tooltip>
                </HStack>
                <Textarea
                  size="sm"
                  rows={3}
                  rounded="lg"
                  placeholder="e.g. IT HPS adjustment following cloud tier architecture updates..."
                  value={revisionReason}
                  onChange={(e) => setRevisionReason(e.target.value)}
                />
              </VStack>
            </GridItem>
          </Grid>

          <Divider mb={4} />

          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={2} color="gray.500" fontSize="xs">
              <Icon as={FiCheckCircle} color="green.500" boxSize={4} />
              <Text>
                Modifications to HPS parameters will automatically capture a snapshot log for audit trail.
              </Text>
            </HStack>

            <HStack spacing={3}>
              <Button
                size="md"
                colorScheme="blue"
                leftIcon={<FiSave />}
                isLoading={isSaving}
                loadingText="Saving Cost Governance..."
                onClick={handleSaveGovernance}
                px={6}
                shadow="md"
              >
                Save Cost Governance
              </Button>
            </HStack>
          </Flex>
        </CardBody>
      </Card>

      {/* ========================================================= */}
      {/* SECTION 5: LINKED RBB WORK PROGRAMS ALLOCATION BREAKDOWN  */}
      {/* ========================================================= */}
      <Card
        rounded="xl"
        shadow="sm"
        border="1px"
        borderColor={colorMode === "light" ? "gray.200" : "gray.700"}
      >
        <CardHeader
          bg={colorMode === "light" ? "gray.50" : "gray.900"}
          py={4}
          px={5}
          roundedTop="xl"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
            <HStack spacing={2.5}>
              <Icon as={FiBriefcase} color="purple.500" boxSize={5} />
              <VStack align="start" spacing={0}>
                <Heading size="md">
                  RBB Work Programs Allocation ({unifiedWorkPrograms.length} Budget Lines)
                </Heading>
                <Text fontSize="sm" color="gray.500">
                  {project
                    ? `Proyek Terhubung: ${project.projectCode || "-"} • ${project.projectName || "-"}`
                    : paymentData
                    ? "Work program budget allocation from contract payment data"
                    : "Work program budget allocation linked to this contract"}
                </Text>
              </VStack>
            </HStack>

            {project?.proOwnerDivisionName && (
              <Badge colorScheme="purple" fontSize="xs" px={2.5} py={0.5} rounded="md">
                Owner: {project.proOwnerDivisionName}
              </Badge>
            )}
          </Flex>
        </CardHeader>

        <CardBody p={0}>
          {isLoadingWorkPrograms ? (
            <Flex justify="center" align="center" py={8} gap={2}>
              <Spinner size="sm" color="purple.500" />
              <Text fontSize="sm" color="gray.500">
                Loading work program budget item details...
              </Text>
            </Flex>
          ) : unifiedWorkPrograms.length === 0 ? (
            <Box p={6} textAlign="center">
              <VStack spacing={2}>
                <Text fontSize="sm" color="gray.500">
                  No specific work program budget items currently linked to this project.
                </Text>
                <Text fontSize="xs" color="gray.400">
                  Current RBB Budget baseline ceiling uses the contract reference value of{" "}
                  <strong>{formatIDR(A)}</strong>. You can adjust the RBB Budget Ceiling using the edit button in the header banner above.
                </Text>
              </VStack>
            </Box>
          ) : (
            <TableContainer>
              <Table variant="simple" size="md">
                <Thead bg={colorMode === "light" ? "gray.50" : "gray.850"}>
                  <Tr>
                    <Th fontSize="xs" py={3} w="40px">
                      No.
                    </Th>
                    <Th fontSize="xs" py={3}>
                      Sumber
                    </Th>
                    <Th fontSize="xs" py={3}>
                      Kode Program
                    </Th>
                    <Th fontSize="xs" py={3}>
                      Nama Pos Akun / Program
                    </Th>
                    <Th fontSize="xs" py={3}>
                      No. Rekening & Cost Center
                    </Th>
                    <Th fontSize="xs" py={3} isNumeric>
                      RBB Budget Ceiling (Rp.)
                    </Th>
                    <Th fontSize="xs" py={3} isNumeric>
                      Contract Realization (Rp.)
                    </Th>
                    <Th fontSize="xs" py={3} isNumeric>
                      Remaining Budget (Rp.)
                    </Th>
                    <Th fontSize="xs" py={3} isNumeric>
                      Porsi (%)
                    </Th>
                  </Tr>
                </Thead>
                <Tbody fontSize="sm">
                  {unifiedWorkPrograms.map((wp, idx) => {
                    const portionPct =
                      totalWorkProgramBudget > 0
                        ? ((wp.budget / totalWorkProgramBudget) * 100).toFixed(1)
                        : "0.0";

                    return (
                      <Tr
                        key={wp.id || idx}
                        _hover={{
                          bg: colorMode === "light" ? "gray.50" : "gray.800",
                        }}
                      >
                        <Td fontWeight="bold" fontSize="sm">
                          {idx + 1}
                        </Td>
                        <Td>
                          <Badge colorScheme="blue" fontSize="xs">
                            {wp.source || "RBB"}
                          </Badge>
                        </Td>
                        <Td fontWeight="semibold" fontSize="sm">
                          {wp.code || "-"}
                        </Td>
                        <Td>
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="semibold" fontSize="sm">
                              {wp.name}
                            </Text>
                            {wp.divisionName && (
                              <Text fontSize="xs" color="gray.500">
                                Div: {wp.divisionName}
                              </Text>
                            )}
                          </VStack>
                        </Td>
                        <Td fontSize="xs" color="gray.600">
                          Acc: {wp.accNumber} • CC: {wp.accCc}
                        </Td>
                        <Td isNumeric fontWeight="bold" color="blue.600" fontSize="sm">
                          {formatIDR(wp.budget)}
                        </Td>
                        <Td isNumeric fontWeight="semibold" color="teal.600" fontSize="sm">
                          {formatIDR(wp.real)}
                        </Td>
                        <Td
                          isNumeric
                          fontWeight="semibold"
                          color={wp.leftovers >= 0 ? "gray.700" : "red.500"}
                          fontSize="sm"
                        >
                          {formatIDR(wp.leftovers)}
                        </Td>
                        <Td isNumeric fontSize="xs" color="gray.500">
                          {portionPct}%
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
                <Tfoot bg={colorMode === "light" ? "gray.100" : "gray.900"} fontWeight="bold">
                  <Tr>
                    <Td colSpan={5} fontSize="sm">
                      Total Work Program Budget Lines Allocation
                    </Td>
                    <Td isNumeric color="blue.600" fontSize="sm">
                      {formatIDR(totalWorkProgramBudget)}
                    </Td>
                    <Td isNumeric color="teal.600" fontSize="sm">
                      {formatIDR(C)}
                    </Td>
                    <Td
                      isNumeric
                      color={totalWorkProgramBudget - C >= 0 ? "green.600" : "red.500"}
                      fontSize="sm"
                    >
                      {formatIDR(totalWorkProgramBudget - C)}
                    </Td>
                    <Td isNumeric fontSize="xs">
                      100.0%
                    </Td>
                  </Tr>
                </Tfoot>
              </Table>
            </TableContainer>
          )}
        </CardBody>
      </Card>

      {/* Snapshot History Modal */}
      <ModalCostGovHistory
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        contractId={contract.id}
        contractNumber={contract.contractNumber}
        tokenData={tokenData}
      />
    </VStack>
  );
}
