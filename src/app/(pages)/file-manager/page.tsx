"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Button,
  IconButton,
  Card,
  CardBody,
  Divider,
  SimpleGrid,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Tooltip,
  Spinner,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  useColorModeValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  Heading,
  Icon,
} from "@chakra-ui/react";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { HeaderContent, HeaderContentProps } from "@/app/components/headerContent";
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import useFileManager, {
  FolderNode,
  FileManagerItem,
  FileAvailabilityResult,
} from "@/app/services/useFileManager";
import {
  FiFolder,
  FiFileText,
  FiDownload,
  FiSearch,
  FiGrid,
  FiList,
  FiCheckSquare,
  FiSquare,
  FiRefreshCw,
  FiLock,
  FiEye,
  FiLayers,
  FiCheckCircle,
  FiAlertCircle,
  FiX,
  FiCopy,
  FiShield,
  FiMaximize2,
  FiMinimize2,
  FiCloud,
} from "react-icons/fi";
import {
  FaRegFolder,
  FaRegFolderOpen,
  FaRegFilePdf,
  FaRegFileWord,
  FaRegFileExcel,
  FaRegFilePowerpoint,
  FaRegFileZipper,
  FaRegFileImage,
  FaRegFileCode,
  FaRegFileAudio,
  FaRegFileVideo,
  FaRegFileLines,
  FaRegFile,
} from "react-icons/fa6";
import { TbFolders, TbFolderShare } from "react-icons/tb";
import { radiusStyle } from "@/app/constants/applicationConstants";

const HeaderDataContent: HeaderContentProps = {
  titleName: "File Manager & Virtual Hierarchy",
  breadCrumb: ["Workspace", "File Manager"],
};

const formatBytesHelper = (bytes?: number | null): string => {
  if (!bytes || bytes <= 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export default function FileManagerPage() {
  useDocumentTitle("File Manager");

  const toast = useToast();
  const [token, setToken] = useState<string>("");
  const { GetFolderTree, GetFiles, CheckFileAvailability, SecureDownloadFiles, isLoading } = useFileManager();

  // State
  const [treeData, setTreeData] = useState<FolderNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<FolderNode | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Record<string, boolean>>({
    root: true,
    "module-requirements": true,
    "module-projects": true,
    "module-cab": true,
  });

  const [files, setFiles] = useState<FileManagerItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [treeSearchQuery, setTreeSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCopiedCode, setIsCopiedCode] = useState<boolean>(false);

  // MinIO check state
  const [checkingFileId, setCheckingFileId] = useState<string | null>(null);
  const [activeFileAvailability, setActiveFileAvailability] = useState<FileAvailabilityResult | null>(null);

  // Detail Drawer State
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure();
  const [activeFileDetail, setActiveFileDetail] = useState<FileManagerItem | null>(null);

  // Colors
  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const hoverBg = useColorModeValue("blue.50", "gray.700");
  const activeNodeBg = useColorModeValue("blue.100", "blue.900");
  const secondaryTextColor = useColorModeValue("gray.500", "gray.400");
  const treeBg = useColorModeValue("gray.50", "gray.900");

  // Load Folder Hierarchy Tree and Files
  const loadData = async (authToken: string) => {
    if (!authToken) return;
    const resTree = await GetFolderTree(authToken);
    if (resTree) {
      setTreeData(resTree);
      setSelectedNode(resTree);

      // Auto expand root, modules, and categories
      const initialExpanded: Record<string, boolean> = { root: true };
      const traverse = (node: FolderNode) => {
        if (["root", "module", "category", "quarter"].includes(node.nodeType)) {
          initialExpanded[node.id] = true;
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      };
      traverse(resTree);
      setExpandedNodeIds(initialExpanded);
    }
    const resFiles = await GetFiles({ page: 1, pageSize: 100 }, authToken);
    if (resFiles && resFiles.data) {
      setFiles(resFiles.data);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("tokenData") || "";
      setToken(storedToken);
      if (storedToken) {
        loadData(storedToken);
      }
    }
  }, []);

  const fetchTree = async () => {
    if (!token) return;
    const res = await GetFolderTree(token);
    if (res) {
      setTreeData(res);
      if (!selectedNode) {
        setSelectedNode(res);
      }
    }
  };

  const fetchFiles = async (node?: FolderNode | null, searchStr?: string) => {
    if (!token) return;
    const targetNode = node !== undefined ? node : selectedNode;
    const search = searchStr !== undefined ? searchStr : searchQuery;

    const params: Record<string, any> = {
      page: 1,
      pageSize: 100,
      search: search || undefined,
    };

    if (targetNode && targetNode.id !== "root") {
      if (targetNode.nodeType === "entity" && targetNode.referenceId) {
        params.referenceId = targetNode.referenceId;
      } else {
        params.virtualPath = targetNode.path;
      }
    }

    const res = await GetFiles(params, token);
    if (res && res.data) {
      setFiles(res.data);
    } else {
      setFiles([]);
    }
  };

  useEffect(() => {
    if (token && selectedNode) {
      fetchFiles(selectedNode, searchQuery);
    }
  }, [selectedNode, searchQuery]);

  // Expand / Collapse All
  const handleToggleExpandAll = () => {
    if (!treeData) return;
    const areSomeCollapsed = Object.values(expandedNodeIds).some((v) => !v);
    const newExpanded: Record<string, boolean> = {};

    const traverse = (node: FolderNode) => {
      newExpanded[node.id] = areSomeCollapsed;
      if (node.children) node.children.forEach(traverse);
    };

    traverse(treeData);
    setExpandedNodeIds(newExpanded);
  };

  // Toggle Single Folder Node Expand/Collapse
  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodeIds((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  // Handle Node Click
  const handleSelectNode = (node: FolderNode) => {
    setSelectedNode(node);
    setSelectedFileIds([]);
  };

  // Checkbox selection
  const handleToggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  const handleSelectAllCurrent = () => {
    if (selectedFileIds.length === files.length && files.length > 0) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(files.map((f) => f.id));
    }
  };

  // Enhanced File Icon Helper for All File Formats
  const getFileIcon = (ext?: string | null, size = 26) => {
    const cleanExt = ext ? ext.replace(".", "").toLowerCase().trim() : "";

    // PDF
    if (cleanExt === "pdf") return <FaRegFilePdf size={size} color="#E53E3E" />;

    // Word / Documents
    if (["doc", "docx", "odt", "rtf", "dot", "dotx"].includes(cleanExt))
      return <FaRegFileWord size={size} color="#2B6CB0" />;

    // Excel / Spreadsheets / CSV
    if (["xls", "xlsx", "csv", "tsv", "ods", "numbers"].includes(cleanExt))
      return <FaRegFileExcel size={size} color="#2F855A" />;

    // PowerPoint / Presentations
    if (["ppt", "pptx", "pot", "potx", "pps", "odp", "key"].includes(cleanExt))
      return <FaRegFilePowerpoint size={size} color="#DD6B20" />;

    // Compressed / Archives
    if (["zip", "rar", "7z", "tar", "gz", "bz2", "xz", "iso"].includes(cleanExt))
      return <FaRegFileZipper size={size} color="#D69E2E" />;

    // Images
    if (["png", "jpg", "jpeg", "webp", "gif", "svg", "bmp", "tiff", "ico", "psd"].includes(cleanExt))
      return <FaRegFileImage size={size} color="#805AD5" />;

    // Audio
    if (["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma"].includes(cleanExt))
      return <FaRegFileAudio size={size} color="#319795" />;

    // Video
    if (["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv", "m4v"].includes(cleanExt))
      return <FaRegFileVideo size={size} color="#E53E3E" />;

    // Code & Data
    if (["json", "xml", "html", "css", "scss", "js", "jsx", "ts", "tsx", "cs", "java", "py", "sql", "sh", "yml", "yaml", "go", "rs", "cpp", "c", "h"].includes(cleanExt))
      return <FaRegFileCode size={size} color="#DD6B20" />;

    // Text & Notes
    if (["txt", "log", "md", "markdown", "conf", "ini", "env"].includes(cleanExt))
      return <FaRegFileLines size={size} color="#4A5568" />;

    return <FaRegFile size={size} color="#718096" />;
  };

  // MinIO Live Storage Check Action
  const handleCheckMinIO = async (file: FileManagerItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!token) return;
    setCheckingFileId(file.id);
    try {
      const res = await CheckFileAvailability(file.id, token);
      if (activeFileDetail?.id === file.id) {
        setActiveFileAvailability(res);
      }
      if (res?.isAvailable) {
        toast({
          title: "Berkas Fisik Tersedia",
          description: `[${file.objectRawName || file.objectName}] Terverifikasi aktif di ${res.storageSource} (Bucket: '${res.bucketName || "media-objects"}', Ukuran: ${res.sizeFormatted || file.objectSizeFormatted || "-"}).`,
          status: "success",
          duration: 4500,
          isClosable: true,
        });
      } else {
        toast({
          title: "Berkas Tidak Ditemukan di Storage",
          description: `[${file.objectRawName || file.objectName}] ${res?.message || "Berkas fisik tidak ditemukan pada MinIO storage."}`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    } catch {
      toast({
        title: "Gagal Memeriksa Storage",
        description: "Terjadi kesalahan saat memeriksa ketersediaan berkas di MinIO.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setCheckingFileId(null);
    }
  };

  // Secure Bulk Download with Single OTP
  const handleBulkDownload = async () => {
    if (selectedFileIds.length === 0) {
      toast({
        title: "Pilih File Terlebih Dahulu",
        description: "Silakan centang satu atau beberapa file untuk diunduh.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsDownloading(true);
    const nodeLabel = selectedNode?.name ? selectedNode.name.replace(/[^a-zA-Z0-9_-]/g, "_") : "Files";
    const zipName = `Export_${nodeLabel}_${new Date().getTime()}.zip`;

    try {
      const blob = await SecureDownloadFiles(
        selectedFileIds,
        token,
        selectedNode?.referenceId || "FILE-MANAGER",
        "FileManager",
        zipName
      );

      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", zipName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download Berhasil Dimulai",
          description: `File ZIP (${selectedFileIds.length} item) terenkripsi AES-256 telah diunduh. Silakan cek email Anda untuk 1 kode password OTP.`,
          status: "success",
          duration: 7000,
          isClosable: true,
        });
      }
    } catch (downloadErr: any) {
      toast({
        title: "Gagal Mengunduh",
        description: downloadErr?.message || "Terjadi kendala saat memaketkan berkas.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Copy Code Helper
  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  // Breadcrumbs Array calculation
  const breadcrumbParts = useMemo(() => {
    if (!selectedNode || selectedNode.path === "/") return ["Root"];
    const parts = selectedNode.path.split("/").filter(Boolean);
    return ["Root", ...parts];
  }, [selectedNode]);

  // Statistics from treeData
  const totalAssetsCount = treeData?.fileCount || files.length || 0;
  const totalAssetsSizeFormatted = formatBytesHelper(treeData?.totalSizeBytes);
  const reqModule = treeData?.children?.find((c) => c.moduleKey === "Requirements" || c.id.includes("requirements"));
  const prjModule = treeData?.children?.find((c) => c.moduleKey === "Projects" || c.id.includes("projects"));
  const cabModule = treeData?.children?.find((c) => c.moduleKey === "CAB" || c.id.includes("cab"));

  const reqFilesCount = reqModule?.fileCount || 0;
  const prjFilesCount = prjModule?.fileCount || 0;
  const cabFilesCount = cabModule?.fileCount || 0;

  // Render Recursive Tree Node
  const renderTreeNode = (node: FolderNode, level: number = 0) => {
    if (treeSearchQuery.trim()) {
      const q = treeSearchQuery.toLowerCase();
      const matchesSelf = node.name.toLowerCase().includes(q);
      const matchesChildren = node.children && node.children.some((c) => c.name.toLowerCase().includes(q));
      if (!matchesSelf && !matchesChildren && level > 0) return null;
    }

    const isExpanded = !!expandedNodeIds[node.id];
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children && node.children.length > 0;

    return (
      <Box key={node.id} pl={level > 0 ? 3 : 0}>
        <Flex
          align="center"
          py={1.5}
          px={2.5}
          my={0.5}
          borderRadius="md"
          cursor="pointer"
          bg={isSelected ? activeNodeBg : "transparent"}
          _hover={{ bg: isSelected ? activeNodeBg : hoverBg }}
          onClick={() => handleSelectNode(node)}
          fontSize="xs"
          userSelect="none"
          transition="background 0.15s ease"
        >
          {hasChildren ? (
            <HStack spacing={1.5} mr={1.5}>
              <Box
                as="span"
                onClick={(e: React.MouseEvent) => toggleExpand(node.id, e)}
                color="gray.400"
                _hover={{ color: "gray.600" }}
                cursor="pointer"
                p={0.5}
              >
                {isExpanded ? <ChevronDownIcon boxSize={4} /> : <ChevronRightIcon boxSize={4} />}
              </Box>
              <Box as="span">
                {isExpanded ? <FaRegFolderOpen color="#D69E2E" size={15} /> : <FaRegFolder color="#D69E2E" size={15} />}
              </Box>
            </HStack>
          ) : (
            <Box as="span" mr={2} ml={5} color="gray.400">
              <FaRegFolder color="#A0AEC0" size={14} />
            </Box>
          )}

          <Text
            fontWeight={isSelected ? "bold" : "normal"}
            isTruncated
            flex="1"
            title={node.name}
            color={isSelected ? "blue.600" : "inherit"}
          >
            {node.name}
          </Text>

          {node.nodeType === "quarter" && (
            <Badge size="xs" colorScheme="orange" variant="subtle" mr={1} borderRadius="sm" fontSize="3xs">
              Quartal
            </Badge>
          )}

          {node.fileCount > 0 && (
            <Badge size="sm" ml={1} colorScheme={isSelected ? "blue" : "gray"} borderRadius="full" fontSize="3xs">
              {node.fileCount}
            </Badge>
          )}
        </Flex>

        {hasChildren && isExpanded && (
          <Box borderLeft="1px dashed" borderColor={borderColor} ml={3.5} pl={1}>
            {node.children.map((child) => renderTreeNode(child, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <LayoutAdmin>
      <HeaderContent {...HeaderDataContent} />

      <Box px={{ base: 2, md: 4 }} py={2}>
        {/* ══════════════════════════════════════════════════════════════════
            HERO HEADER SECTION (Matching /master-data/Application/detail Pattern)
            ══════════════════════════════════════════════════════════════════ */}
        <Box
          bgGradient="linear(to-br, secondary.800, secondary.600)"
          color="white"
          px={{ base: 4, md: 6 }}
          py={{ base: 5, md: 6 }}
          rounded={radiusStyle}
          position="relative"
          overflow="hidden"
          shadow="xl"
          mb={4}
        >
          {/* Ambient Glass Shapes */}
          <Box
            position="absolute"
            top="-20px"
            right="-20px"
            w="140px"
            h="140px"
            bg="whiteAlpha.150"
            rounded="full"
            pointerEvents="none"
          />
          <Box
            position="absolute"
            bottom="-30px"
            right="160px"
            w="100px"
            h="100px"
            bg="whiteAlpha.100"
            transform="rotate(45deg)"
            pointerEvents="none"
          />

          <Flex
            direction={{ base: "column", lg: "row" }}
            justify="space-between"
            align={{ base: "start", lg: "center" }}
            gap={4}
            position="relative"
            zIndex={1}
          >
            {/* Left Identity Strip */}
            <HStack spacing={{ base: 3, md: 4 }} align="center" flex={1}>
              {/* Frosted Avatar Box */}
              <Box
                w={{ base: "52px", md: "60px" }}
                h={{ base: "52px", md: "60px" }}
                bg="whiteAlpha.250"
                backdropFilter="blur(12px)"
                border="1.5px solid"
                borderColor="whiteAlpha.400"
                rounded="2xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                shadow="lg"
                flexShrink={0}
              >
                <TbFolders size={32} />
              </Box>

              <VStack align="start" spacing={1} overflow="hidden">
                <HStack spacing={2} wrap="wrap">
                  {/* Status Pills */}
                  <Badge bg="green.400" color="green.950" px={2.5} py={0.5} rounded="full" fontSize="3xs" fontWeight="extrabold">
                    VAULT ONLINE
                  </Badge>
                  <Badge bg="whiteAlpha.300" color="white" px={2.5} py={0.5} rounded="md" fontSize="3xs" fontWeight="bold">
                    <HStack spacing={1}>
                      <Icon as={FiShield} boxSize={2.5} />
                      <Text>AES-256 OTP SECURED</Text>
                    </HStack>
                  </Badge>
                  <Badge bg="cyan.400" color="cyan.950" px={2.5} py={0.5} rounded="md" fontSize="3xs" fontWeight="extrabold">
                    LEFT JOIN ARTIFACTS
                  </Badge>
                </HStack>

                <Heading size={{ base: "sm", md: "md" }} fontWeight="800" color="white" lineHeight="shorter">
                  File Manager & Virtual Hierarchy Explorer
                </Heading>

                <Text fontSize="2xs" color="whiteAlpha.850" noOfLines={1}>
                  Dokumen SDLC Workstage • Kontrak SPK/BAST Pengadaan • Requirement BRD/RFC • Lampiran CAB Requests
                </Text>
              </VStack>
            </HStack>

            {/* Right Hero Actions */}
            <HStack spacing={2.5} alignSelf={{ base: "flex-end", lg: "center" }}>
              <Button
                leftIcon={<FiMaximize2 />}
                size="sm"
                h="36px"
                variant="outline"
                color="white"
                borderColor="whiteAlpha.300"
                bg="whiteAlpha.100"
                backdropFilter="blur(8px)"
                _hover={{ bg: "whiteAlpha.250", borderColor: "whiteAlpha.450" }}
                rounded="full"
                px={3.5}
                fontSize="xs"
                onClick={handleToggleExpandAll}
              >
                Expand / Collapse
              </Button>
              <Button
                leftIcon={<FiRefreshCw />}
                size="sm"
                h="36px"
                variant="outline"
                color="white"
                borderColor="whiteAlpha.300"
                bg="whiteAlpha.100"
                backdropFilter="blur(8px)"
                _hover={{ bg: "whiteAlpha.250", borderColor: "whiteAlpha.450" }}
                rounded="full"
                px={4}
                fontSize="xs"
                isLoading={isLoading}
                onClick={fetchTree}
              >
                Refresh Directory
              </Button>
            </HStack>
          </Flex>

          {/* Sub-Hero 4 Quick Metrics Grid */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3} mt={4} pt={3.5} borderTop="1px solid" borderColor="whiteAlpha.200">
            <Box p={3} rounded="xl" bg="whiteAlpha.150" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.200">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={0}>
                  <Text fontSize="3xs" textTransform="uppercase" fontWeight="bold" color="whiteAlpha.700">
                    Total Berkas Media
                  </Text>
                  <Text fontSize="xs" fontWeight="extrabold" color="white" noOfLines={1}>
                    {totalAssetsCount} Berkas ({totalAssetsSizeFormatted})
                  </Text>
                </VStack>
                <Icon as={FiFolder} boxSize={4} color="green.300" />
              </HStack>
            </Box>

            <Box p={3} rounded="xl" bg="whiteAlpha.150" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.200">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={0}>
                  <Text fontSize="3xs" textTransform="uppercase" fontWeight="bold" color="whiteAlpha.700">
                    Requirements Vault
                  </Text>
                  <Text fontSize="xs" fontWeight="extrabold" color="white" noOfLines={1}>
                    {reqFilesCount} Berkas (BRD / RFC)
                  </Text>
                </VStack>
                <Icon as={FiFileText} boxSize={4} color="cyan.300" />
              </HStack>
            </Box>

            <Box p={3} rounded="xl" bg="whiteAlpha.150" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.200">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={0}>
                  <Text fontSize="3xs" textTransform="uppercase" fontWeight="bold" color="whiteAlpha.700">
                    Projects & Procurement
                  </Text>
                  <Text fontSize="xs" fontWeight="extrabold" color="white" noOfLines={1}>
                    {prjFilesCount} Berkas SDLC & SPK
                  </Text>
                </VStack>
                <Icon as={FiLayers} boxSize={4} color="yellow.300" />
              </HStack>
            </Box>

            <Box p={3} rounded="xl" bg="whiteAlpha.150" backdropFilter="blur(8px)" border="1px solid" borderColor="whiteAlpha.200">
              <HStack justify="space-between" align="center">
                <VStack align="start" spacing={0}>
                  <Text fontSize="3xs" textTransform="uppercase" fontWeight="bold" color="whiteAlpha.700">
                    CAB Request Vault
                  </Text>
                  <Text fontSize="xs" fontWeight="extrabold" color="white" noOfLines={1}>
                    {cabFilesCount} Berkas Perubahan
                  </Text>
                </VStack>
                <Icon as={FiCheckCircle} boxSize={4} color="purple.300" />
              </HStack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════
            FLOATING / TOP MULTI-SELECT ACTION BAR
            ══════════════════════════════════════════════════════════════════ */}
        {selectedFileIds.length > 0 && (
          <Card
            mb={4}
            bg="blue.600"
            color="white"
            shadow="lg"
            border="1px solid"
            borderColor="blue.700"
            borderRadius={radiusStyle}
          >
            <CardBody py={3} px={6}>
              <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                <HStack spacing={3}>
                  <TbFolders size={24} />
                  <Text fontWeight="bold">
                    {selectedFileIds.length} file dipilih
                  </Text>
                  <Badge colorScheme="green" px={2} py={0.5} borderRadius="md" fontSize="2xs">
                    1 ZIP Enkripsi AES-256 (1 OTP)
                  </Badge>
                </HStack>

                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="whiteAlpha"
                    rounded="full"
                    onClick={() => setSelectedFileIds([])}
                  >
                    Batal Pilih
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="yellow"
                    rounded="full"
                    leftIcon={<FiLock />}
                    isLoading={isDownloading}
                    loadingText="Memaketkan ZIP..."
                    onClick={handleBulkDownload}
                  >
                    Download Terpilih (Secure OTP)
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            MAIN CONTAINER: TREE SIDEBAR + FILE EXPLORER AREA
            ══════════════════════════════════════════════════════════════════ */}
        <Flex gap={4} direction={{ base: "column", lg: "row" }} align="stretch">
          {/* Left Side: Directory Hierarchy Tree */}
          <Box
            w={{ base: "100%", lg: "340px" }}
            minW={{ lg: "320px" }}
            bg={treeBg}
            p={4}
            borderRadius={radiusStyle}
            border="1px solid"
            borderColor={borderColor}
            height={{ lg: "calc(100vh - 280px)" }}
            display="flex"
            flexDirection="column"
            shadow="xs"
          >
            <Flex justify="space-between" align="center" mb={2.5}>
              <HStack spacing={2}>
                <TbFolders size={18} color="#3182CE" />
                <Text fontWeight="bold" fontSize="sm">
                  Virtual Hierarchy
                </Text>
              </HStack>
              <IconButton
                aria-label="Refresh Tree"
                icon={<FiRefreshCw size={13} />}
                size="xs"
                variant="ghost"
                rounded="full"
                onClick={fetchTree}
                isLoading={isLoading}
              />
            </Flex>

            {/* Tree quick search */}
            <InputGroup size="xs" mb={3}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Filter folder..."
                borderRadius="md"
                value={treeSearchQuery}
                onChange={(e) => setTreeSearchQuery(e.target.value)}
              />
              {treeSearchQuery && (
                <InputRightElement>
                  <IconButton
                    aria-label="Clear tree search"
                    icon={<FiX size={10} />}
                    size="xs"
                    variant="ghost"
                    onClick={() => setTreeSearchQuery("")}
                  />
                </InputRightElement>
              )}
            </InputGroup>

            <Divider mb={2} />

            <Box flex="1" overflowY="auto" pr={1}>
              {treeData ? (
                renderTreeNode(treeData)
              ) : (
                <Flex justify="center" align="center" py={10}>
                  <Spinner size="md" color="blue.500" />
                </Flex>
              )}
            </Box>
          </Box>

          {/* Right Side: File Explorer Area */}
          <Box
            flex="1"
            minW={0}
            maxW={{ base: "100%", lg: "calc(100% - 356px)" }}
            bg={bgCard}
            p={5}
            borderRadius={radiusStyle}
            border="1px solid"
            borderColor={borderColor}
            height={{ lg: "calc(100vh - 280px)" }}
            display="flex"
            flexDirection="column"
            shadow="xs"
            overflow="hidden"
          >
            {/* Top Bar: Breadcrumbs & Controls */}
            <Flex justify="space-between" align="center" mb={4} wrap="wrap" gap={3}>
              <Breadcrumb fontSize="xs" color={secondaryTextColor}>
                {breadcrumbParts.map((part, index) => (
                  <BreadcrumbItem key={index} isCurrentPage={index === breadcrumbParts.length - 1}>
                    <BreadcrumbLink
                      fontWeight={index === breadcrumbParts.length - 1 ? "bold" : "normal"}
                      color={index === breadcrumbParts.length - 1 ? "blue.500" : "inherit"}
                    >
                      {part}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ))}
              </Breadcrumb>

              <HStack spacing={2}>
                <InputGroup size="sm" maxW="260px">
                  <InputLeftElement pointerEvents="none">
                    <FiSearch color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Cari file / nomor req..."
                    borderRadius="md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") fetchFiles(selectedNode, searchQuery);
                    }}
                  />
                  {searchQuery && (
                    <InputRightElement>
                      <IconButton
                        aria-label="Clear search"
                        icon={<FiX size={12} />}
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          setSearchQuery("");
                          fetchFiles(selectedNode, "");
                        }}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>

                <HStack spacing={1} bg={treeBg} p={0.5} borderRadius="md" border="1px solid" borderColor={borderColor}>
                  <IconButton
                    aria-label="Grid View"
                    icon={<FiGrid />}
                    size="xs"
                    variant={viewMode === "grid" ? "solid" : "ghost"}
                    colorScheme={viewMode === "grid" ? "blue" : "gray"}
                    onClick={() => setViewMode("grid")}
                  />
                  <IconButton
                    aria-label="List View"
                    icon={<FiList />}
                    size="xs"
                    variant={viewMode === "list" ? "solid" : "ghost"}
                    colorScheme={viewMode === "list" ? "blue" : "gray"}
                    onClick={() => setViewMode("list")}
                  />
                </HStack>

                <Button
                  size="sm"
                  variant="outline"
                  borderRadius="md"
                  fontSize="xs"
                  leftIcon={
                    selectedFileIds.length === files.length && files.length > 0 ? (
                      <FiCheckSquare />
                    ) : (
                      <FiSquare />
                    )
                  }
                  onClick={handleSelectAllCurrent}
                  disabled={files.length === 0}
                >
                  {selectedFileIds.length === files.length && files.length > 0
                    ? "Batal Semua"
                    : "Pilih Semua"}
                </Button>
              </HStack>
            </Flex>

            <Divider mb={4} />

            {/* Explorer Content Container */}
            <Box flex="1" overflowY="auto" overflowX="hidden" pr={1}>
              {isLoading ? (
                <Flex justify="center" align="center" height="250px">
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : files.length === 0 ? (
                <Flex
                  direction="column"
                  justify="center"
                  align="center"
                  height="250px"
                  color={secondaryTextColor}
                >
                  <TbFolderShare size={54} color="#A0AEC0" />
                  <Text mt={3} fontSize="md" fontWeight="medium">
                    Tidak ada berkas di folder ini
                  </Text>
                  <Text fontSize="xs">
                    Pilih folder lain pada hierarki virtual di sisi kiri atau ubah filter pencarian.
                  </Text>
                </Flex>
              ) : viewMode === "grid" ? (
                /* GRID VIEW */
                <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 4 }} spacing={4}>
                  {files.map((file) => {
                    const isChecked = selectedFileIds.includes(file.id);
                    return (
                      <Card
                        key={file.id}
                        border="1px solid"
                        borderColor={isChecked ? "blue.400" : borderColor}
                        bg={isChecked ? hoverBg : bgCard}
                        borderRadius={radiusStyle}
                        shadow="xs"
                        _hover={{ shadow: "sm", borderColor: "blue.300", transform: "translateY(-1px)" }}
                        transition="all 0.15s ease"
                        position="relative"
                        cursor="pointer"
                        onClick={() => handleToggleSelectFile(file.id)}
                      >
                        <CardBody p={3.5}>
                          <Flex justify="space-between" align="start" mb={2}>
                            <Box>{getFileIcon(file.objectExtension)}</Box>
                            <Checkbox
                              isChecked={isChecked}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleSelectFile(file.id);
                              }}
                              colorScheme="blue"
                            />
                          </Flex>

                          <Text
                            fontWeight="semibold"
                            fontSize="sm"
                            isTruncated
                            title={file.objectRawName || file.objectName}
                          >
                            {file.objectRawName || file.objectName}
                          </Text>

                          <VStack align="start" spacing={0.5} mt={1.5}>
                            <HStack spacing={1}>
                              <Badge
                                size="xs"
                                colorScheme={
                                  file.moduleName === "Requirements"
                                    ? "teal"
                                    : file.moduleName === "Projects"
                                    ? "blue"
                                    : "purple"
                                }
                                fontSize="3xs"
                              >
                                {file.moduleName}
                              </Badge>
                              {file.referenceCode && (
                                <Text
                                  fontSize="xs"
                                  fontWeight="semibold"
                                  color="blue.600"
                                  isTruncated
                                  maxW="160px"
                                  title={file.referenceCode}
                                >
                                  [{file.referenceCode}]
                                </Text>
                              )}
                            </HStack>
                            {file.referenceName && (
                              <Text
                                fontSize="xs"
                                color={secondaryTextColor}
                                isTruncated
                                maxW="100%"
                                title={file.referenceName}
                              >
                                {file.referenceName}
                              </Text>
                            )}
                          </VStack>

                          <Flex justify="space-between" align="center" mt={3} pt={2} borderTop="1px solid" borderColor={borderColor}>
                            <Text fontSize="xs" color="gray.500">
                              {file.objectSizeFormatted || "-"}
                            </Text>
                            <HStack spacing={1}>
                              <Tooltip label="Cek Ketersediaan MinIO" hasArrow>
                                <IconButton
                                  aria-label="Cek MinIO"
                                  icon={checkingFileId === file.id ? <Spinner size="xs" /> : <FiCheckCircle size={14} />}
                                  size="xs"
                                  variant="ghost"
                                  rounded="full"
                                  colorScheme="teal"
                                  isLoading={checkingFileId === file.id}
                                  onClick={(e) => handleCheckMinIO(file, e)}
                                />
                              </Tooltip>
                              <IconButton
                                aria-label="Detail File"
                                icon={<FiEye size={13} />}
                                size="xs"
                                variant="ghost"
                                rounded="full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveFileDetail(file);
                                  setActiveFileAvailability(null);
                                  onDetailOpen();
                                }}
                              />
                              <IconButton
                                aria-label="Unduh Satuan"
                                icon={<FiDownload size={13} />}
                                size="xs"
                                variant="ghost"
                                rounded="full"
                                colorScheme="blue"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedFileIds([file.id]);
                                  handleBulkDownload();
                                }}
                              />
                            </HStack>
                          </Flex>
                        </CardBody>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              ) : (
                /* LIST / TABLE VIEW (With Horizontal Scroll & Fixed Header) */
                <TableContainer
                  overflowX="auto"
                  overflowY="auto"
                  maxH="100%"
                  maxW="100%"
                  border="1px solid"
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <Table variant="simple" size="sm" style={{ tableLayout: "auto" }}>
                    <Thead bg={treeBg} position="sticky" top={0} zIndex={1}>
                      <Tr>
                        <Th width="40px" whiteSpace="nowrap">
                          <Checkbox
                            isChecked={selectedFileIds.length === files.length && files.length > 0}
                            onChange={handleSelectAllCurrent}
                            colorScheme="blue"
                          />
                        </Th>
                        <Th minW="260px" whiteSpace="nowrap">Nama Berkas</Th>
                        <Th minW="240px" whiteSpace="nowrap">Modul / Referensi</Th>
                        <Th minW="90px" whiteSpace="nowrap">Ukuran</Th>
                        <Th minW="130px" whiteSpace="nowrap">Diupload Oleh</Th>
                        <Th minW="110px" whiteSpace="nowrap">Tanggal</Th>
                        <Th width="120px" textAlign="center" whiteSpace="nowrap">Aksi</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {files.map((file) => {
                        const isChecked = selectedFileIds.includes(file.id);
                        return (
                          <Tr
                            key={file.id}
                            bg={isChecked ? hoverBg : "transparent"}
                            _hover={{ bg: hoverBg }}
                            cursor="pointer"
                            onClick={() => handleToggleSelectFile(file.id)}
                          >
                            <Td onClick={(e) => e.stopPropagation()} whiteSpace="nowrap">
                              <Checkbox
                                isChecked={isChecked}
                                onChange={() => handleToggleSelectFile(file.id)}
                                colorScheme="blue"
                              />
                            </Td>
                            <Td>
                              <HStack spacing={2.5}>
                                <Box flexShrink={0}>{getFileIcon(file.objectExtension)}</Box>
                                <Box maxW="280px">
                                  <Text fontWeight="medium" fontSize="sm" isTruncated title={file.objectRawName || file.objectName}>
                                    {file.objectRawName || file.objectName}
                                  </Text>
                                  <Text fontSize="xs" color={secondaryTextColor} isTruncated title={file.virtualPath}>
                                    {file.virtualPath}
                                  </Text>
                                </Box>
                              </HStack>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  file.moduleName === "Requirements"
                                    ? "teal"
                                    : file.moduleName === "Projects"
                                    ? "blue"
                                    : "purple"
                                }
                                size="sm"
                                mb={1}
                                fontSize="3xs"
                              >
                                {file.moduleName}
                              </Badge>
                              <VStack align="start" spacing={0} maxW="260px">
                                {file.referenceCode && (
                                  <Text fontSize="xs" fontWeight="semibold" color="blue.600" isTruncated title={file.referenceCode}>
                                    [{file.referenceCode}]
                                  </Text>
                                )}
                                {file.referenceName && (
                                  <Text fontSize="xs" color={secondaryTextColor} isTruncated maxW="260px" title={file.referenceName}>
                                    {file.referenceName}
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td fontSize="xs" whiteSpace="nowrap">{file.objectSizeFormatted || "-"}</Td>
                            <Td fontSize="xs" whiteSpace="nowrap">{file.createdBy || "System"}</Td>
                            <Td fontSize="xs" whiteSpace="nowrap">{new Date(file.createdAt).toLocaleDateString("id-ID")}</Td>
                            <Td textAlign="center" onClick={(e) => e.stopPropagation()} whiteSpace="nowrap">
                              <HStack spacing={1} justify="center">
                                <Tooltip label="Cek Ketersediaan MinIO" hasArrow>
                                  <IconButton
                                    aria-label="Cek MinIO"
                                    icon={checkingFileId === file.id ? <Spinner size="xs" /> : <FiCheckCircle size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    rounded="full"
                                    colorScheme="teal"
                                    isLoading={checkingFileId === file.id}
                                    onClick={(e) => handleCheckMinIO(file, e)}
                                  />
                                </Tooltip>
                                <IconButton
                                  aria-label="Detail"
                                  icon={<FiEye size={14} />}
                                  size="xs"
                                  variant="ghost"
                                  rounded="full"
                                  onClick={() => {
                                    setActiveFileDetail(file);
                                    setActiveFileAvailability(null);
                                    onDetailOpen();
                                  }}
                                />
                                <IconButton
                                  aria-label="Download"
                                  icon={<FiDownload size={14} />}
                                  size="xs"
                                  variant="ghost"
                                  rounded="full"
                                  colorScheme="blue"
                                  onClick={() => {
                                    setSelectedFileIds([file.id]);
                                    handleBulkDownload();
                                  }}
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </Box>
        </Flex>

        {/* ══════════════════════════════════════════════════════════════════
            FILE DETAIL DRAWER (With Fixed Constrained Width & No Horizontal Overlap)
            ══════════════════════════════════════════════════════════════════ */}
        <Drawer isOpen={isDetailOpen} placement="right" size="md" onClose={onDetailClose}>
          <DrawerOverlay />
          <DrawerContent maxW={{ base: "100vw", sm: "460px" }} overflowX="hidden">
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack spacing={2}>
                <FiFileText color="#3182CE" />
                <Text fontSize="lg">Detail Berkas Media</Text>
              </HStack>
            </DrawerHeader>

            <DrawerBody py={4} overflowX="hidden">
              {activeFileDetail && (
                <VStack spacing={4} align="stretch" maxW="100%">
                  <Box p={4} bg={treeBg} borderRadius={radiusStyle} textAlign="center">
                    <Box mb={2} display="flex" justifyContent="center">
                      {getFileIcon(activeFileDetail.objectExtension, 36)}
                    </Box>
                    <Text fontWeight="bold" fontSize="md" wordBreak="break-word">
                      {activeFileDetail.objectRawName || activeFileDetail.objectName}
                    </Text>
                    <Badge mt={1} colorScheme="blue">
                      {activeFileDetail.objectExtension || "File"}
                    </Badge>
                  </Box>

                  {/* MinIO Live Storage Check Section */}
                  <Box p={3.5} bg={treeBg} borderRadius={radiusStyle} border="1px solid" borderColor={borderColor}>
                    <Flex justify="space-between" align="center" mb={2}>
                      <HStack spacing={1.5}>
                        <FiCheckCircle size={16} color="#319795" />
                        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.500">
                          MinIO Storage Check
                        </Text>
                      </HStack>
                      <Button
                        size="xs"
                        colorScheme="teal"
                        variant="outline"
                        leftIcon={<FiCheckCircle />}
                        isLoading={checkingFileId === activeFileDetail.id}
                        onClick={() => handleCheckMinIO(activeFileDetail)}
                      >
                        Cek Fisik
                      </Button>
                    </Flex>
                    {activeFileAvailability ? (
                      <VStack align="stretch" spacing={1.5} fontSize="xs" mt={2} pt={2} borderTop="1px solid" borderColor={borderColor}>
                        <Flex justify="space-between" align="center">
                          <Text color="gray.500">Status Fisik:</Text>
                          <Badge colorScheme={activeFileAvailability.isAvailable ? "green" : "red"}>
                            {activeFileAvailability.isAvailable ? `TERSEDIA (${activeFileAvailability.storageSource})` : "TIDAK DITEMUKAN"}
                          </Badge>
                        </Flex>
                        {activeFileAvailability.bucketName && (
                          <Flex justify="space-between" align="center">
                            <Text color="gray.500">Bucket MinIO:</Text>
                            <Text fontFamily="monospace" fontWeight="semibold">{activeFileAvailability.bucketName}</Text>
                          </Flex>
                        )}
                        {activeFileAvailability.sizeFormatted && (
                          <Flex justify="space-between" align="center">
                            <Text color="gray.500">Ukuran Storage:</Text>
                            <Text fontWeight="semibold">{activeFileAvailability.sizeFormatted}</Text>
                          </Flex>
                        )}
                        <Text color={activeFileAvailability.isAvailable ? "green.600" : "red.500"} fontSize="2xs" mt={1}>
                          {activeFileAvailability.message}
                        </Text>
                      </VStack>
                    ) : (
                      <Text fontSize="2xs" color="gray.400" fontStyle="italic">
                        Klik &quot;Cek Fisik&quot; untuk memverifikasi apakah objek berkas ada di MinIO.
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                      Informasi Berkas
                    </Text>
                    <Divider my={2} />
                    <SimpleGrid columns={2} spacing={3} fontSize="sm">
                      <Text color="gray.500">Ukuran Berkas:</Text>
                      <Text fontWeight="medium">{activeFileDetail.objectSizeFormatted || "-"}</Text>

                      <Text color="gray.500">Object Code:</Text>
                      <HStack spacing={1} overflow="hidden">
                        <Text fontWeight="medium" fontSize="xs" isTruncated maxW="130px">
                          {activeFileDetail.objectCode}
                        </Text>
                        <Tooltip label={isCopiedCode ? "Tersalin!" : "Salin Code"} hasArrow>
                          <IconButton
                            aria-label="Salin kode"
                            icon={<FiCopy size={11} />}
                            size="xs"
                            variant="ghost"
                            onClick={() => handleCopyCode(activeFileDetail.objectCode)}
                          />
                        </Tooltip>
                      </HStack>

                      <Text color="gray.500">Diupload Oleh:</Text>
                      <Text fontWeight="medium" isTruncated>{activeFileDetail.createdBy || "System"}</Text>

                      <Text color="gray.500">Tanggal Unggah:</Text>
                      <Text fontWeight="medium" fontSize="xs">
                        {new Date(activeFileDetail.createdAt).toLocaleString("id-ID")}
                      </Text>
                    </SimpleGrid>
                  </Box>

                  <Box>
                    <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
                      Relasi & Virtual Path
                    </Text>
                    <Divider my={2} />
                    <VStack align="stretch" spacing={2.5} fontSize="sm">
                      <Flex justify="space-between" align="center">
                        <Text color="gray.500">Modul Sumber:</Text>
                        <Badge
                          colorScheme={
                            activeFileDetail.moduleName === "Requirements"
                              ? "teal"
                              : activeFileDetail.moduleName === "Projects"
                              ? "blue"
                              : "purple"
                          }
                        >
                          {activeFileDetail.moduleName}
                        </Badge>
                      </Flex>
                      {activeFileDetail.referenceCode && (
                        <Flex justify="space-between" align="center">
                          <Text color="gray.500">
                            {activeFileDetail.moduleName === "Requirements"
                              ? "Nomor Requirement:"
                              : activeFileDetail.moduleName === "Projects"
                              ? "Nomor / Kode Project:"
                              : "Nomor CAB:"}
                          </Text>
                          <Text fontWeight="bold" color="blue.600" isTruncated maxW="200px">
                            [{activeFileDetail.referenceCode}]
                          </Text>
                        </Flex>
                      )}
                      {activeFileDetail.referenceName && (
                        <Box>
                          <Text color="gray.500">
                            {activeFileDetail.moduleName === "Requirements"
                              ? "Req Narative / Feature:"
                              : activeFileDetail.moduleName === "Projects"
                              ? "Nama Project:"
                              : "Judul Permintaan:"}
                          </Text>
                          <Text
                            fontWeight="medium"
                            fontSize="xs"
                            mt={0.5}
                            bg={treeBg}
                            p={2}
                            borderRadius="md"
                            wordBreak="break-word"
                          >
                            {activeFileDetail.referenceName}
                          </Text>
                        </Box>
                      )}
                      <Box mt={2} p={2} bg={treeBg} borderRadius="md">
                        <Text fontSize="xs" color="gray.500" mb={0.5}>
                          Virtual Folder Path:
                        </Text>
                        <Text fontSize="xs" fontFamily="monospace" fontWeight="semibold" wordBreak="break-all">
                          {activeFileDetail.virtualPath}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>

                  <Button
                    colorScheme="blue"
                    leftIcon={<FiLock />}
                    rounded="full"
                    mt={4}
                    isLoading={isDownloading}
                    onClick={() => {
                      setSelectedFileIds([activeFileDetail.id]);
                      handleBulkDownload();
                    }}
                  >
                    Download Secure ZIP (1 OTP)
                  </Button>
                </VStack>
              )}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </LayoutAdmin>
  );
}
