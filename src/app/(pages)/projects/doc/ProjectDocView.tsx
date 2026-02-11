"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box,
  Button,
  Card,
  CardBody,
  HStack,
  useColorMode,
  VStack,
  Text,
} from "@chakra-ui/react";
import { FiPrinter, FiDownload, FiArrowLeft } from "react-icons/fi";
import LayoutAdmin from "@/app/components/layoutAdmin";
import LoadingMiniSquare from "@/app/components/loadingMiniSquare";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import useProjects, { ProjectDataResponse } from "@/app/services/useProjects";
import { useToastHelper } from "@/app/helper/ToastMessagesHelper";
import { RES_CODE_OK, radiusStyle } from "@/app/constants/applicationConstants";
import ProjectDocContent from "./components/ProjectDocContent";

export default function ProjectDocView() {
  const showToast = useToastHelper();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { colorMode } = useColorMode();

  const [DataAuth, setDataAuth] = useState<AuthDataResponse | null>(null);
  const [tokenData, setTokenData] = useState<string>("");
  const [projectId, setProjectId] = useState<string>("");
  const [DataProject, setDataProject] = useState<ProjectDataResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const { GetDetailById } = useProjects();

  // Auth setup
  useEffect(() => {
    const storedData = localStorage.getItem("authData");
    const token = localStorage.getItem("tokenData") as string;

    if (storedData) {
      const StorageAuth: AuthDataModelInterface = JSON.parse(storedData);
      const UserData: AuthDataResponse = StorageAuth.dataLogin as AuthDataResponse;
      setDataAuth(UserData);
    }

    if (token) {
      setTokenData(token);
    }

    const id = searchParams.get("projectId");
    if (id) {
      setProjectId(id);
    }
  }, [searchParams]);

  // Load project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || !tokenData) return;

      setIsLoading(true);
      try {
        const response = await GetDetailById(projectId, tokenData);
        if (response?.statusCode === RES_CODE_OK && response.data) {
          setDataProject(response.data);
        } else {
          showToast({
            description: "Failed to load project data",
            statusToast: "error",
          });
        }
      } catch (error) {
        console.error("Error loading project:", error);
        showToast({
          description: "Error loading project data",
          statusToast: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, tokenData]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!DataProject) return;

    setIsExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF("p", "mm", "a4");

      // Document Header - Centered
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.text("LAMPIRAN I", pageWidth / 2, 15, { align: "center" });
      doc.text("FORMULIR REGISTRASI IT PROJECT", pageWidth / 2, 22, { align: "center" });
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 28, { align: "center" });

      let yPos = 35;

      // Main Information Table
      autoTable(doc, {
        startY: yPos,
        body: [
          [{ content: "Pengajuan Nama Project", styles: { fontStyle: "bold" } }, DataProject.projectName || "-"],
          [{ content: "Project Number", styles: { fontStyle: "bold" } }, DataProject.projectNo || "-"],
          [{ content: "Project Code", styles: { fontStyle: "bold" } }, DataProject.projectCode || "-"],
          [{ content: "Divisi Yang Menginisiasikan", styles: { fontStyle: "bold" } }, DataProject.proOwnerDivisionName || "-"],
          [{ content: "Tipe Project", styles: { fontStyle: "bold" } }, DataProject.projectType || "-"],
          [{ content: "Category", styles: { fontStyle: "bold" } }, DataProject.projectCategory || "-"],
          [{ content: "Status", styles: { fontStyle: "bold" } }, DataProject.projectStatus || "-"],
          [{ content: "Approval Status", styles: { fontStyle: "bold" } }, DataProject.approvalStatus || "-"],
          [{ content: "Progress", styles: { fontStyle: "bold" } }, `${DataProject.projectStatusPercentage || 0}%`],
          [{ content: "Duration", styles: { fontStyle: "bold" } }, `${DataProject.projectDurationDays || 0} days`],
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 112 },
        },
        theme: "grid",
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // Timeline Section
      autoTable(doc, {
        startY: yPos,
        body: [
          [
            { content: "Register Date", styles: { fontStyle: "bold" } },
            DataProject.projectRegisterDate
              ? new Date(DataProject.projectRegisterDate).toLocaleDateString()
              : "-",
          ],
          [
            { content: "Closed Date", styles: { fontStyle: "bold" } },
            DataProject.projectClosedDate
              ? new Date(DataProject.projectClosedDate).toLocaleDateString()
              : "-",
          ],
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 112 },
        },
        theme: "grid",
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // Organization Section
      autoTable(doc, {
        startY: yPos,
        body: [
          [{ content: "Owner Directorate", styles: { fontStyle: "bold" } }, DataProject.proOwnerDirectorateName || "-"],
          [{ content: "Owner Division", styles: { fontStyle: "bold" } }, DataProject.proOwnerDivisionName || "-"],
          [{ content: "Owner Group", styles: { fontStyle: "bold" } }, DataProject.proOwnerGroupName || "-"],
          [{ content: "Managed By Directorate", styles: { fontStyle: "bold" } }, DataProject.proManageByDirectorateName || "-"],
          [{ content: "Managed By Division", styles: { fontStyle: "bold" } }, DataProject.proManageByDivisionName || "-"],
          [{ content: "Managed By Group", styles: { fontStyle: "bold" } }, DataProject.proManageByGroupName || "-"],
          [{ content: "Managed By Team", styles: { fontStyle: "bold" } }, DataProject.proManageByTeamName || "-"],
        ],
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 112 },
        },
        theme: "grid",
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 5;

      // Characteristics Section
      if (
        DataProject.projectCharasteristicName ||
        DataProject.projectSubCharasteristicName ||
        DataProject.projectAcquisitionName
      ) {
        autoTable(doc, {
          startY: yPos,
          body: [
            [{ content: "Acquisition", styles: { fontStyle: "bold" } }, DataProject.projectAcquisitionName || "-"],
            [{ content: "Karakteristik Proyek", styles: { fontStyle: "bold" } }, DataProject.projectCharasteristicName || "-"],
            [{ content: "Sub-Characteristic", styles: { fontStyle: "bold" } }, DataProject.projectSubCharasteristicName || "-"],
          ],
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 112 },
          },
          theme: "grid",
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 5;
      }

      // SDLC Section
      if (DataProject.sdlcName || DataProject.sdlcStageName) {
        autoTable(doc, {
          startY: yPos,
          body: [
            [{ content: "SDLC", styles: { fontStyle: "bold" } }, DataProject.sdlcName || "-"],
            [{ content: "Current Stage", styles: { fontStyle: "bold" } }, DataProject.sdlcStageName || "-"],
          ],
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 112 },
          },
          theme: "grid",
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 5;
      }

      // Team Members Section
      if (DataProject.userAssignment && DataProject.userAssignment.length > 0) {
        const teamData = DataProject.userAssignment.map((member, idx) => [
          idx + 1,
          member.userData?.nama || member.userId,
          member.userId,
          member.userAssignStatus || "-",
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [[
            { content: "No", styles: { fontStyle: "bold", halign: "center" } },
            { content: "Name", styles: { fontStyle: "bold" } },
            { content: "User ID", styles: { fontStyle: "bold" } },
            { content: "Status", styles: { fontStyle: "bold" } },
          ]],
          body: teamData,
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontStyle: "bold",
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 12, halign: "center" },
            1: { cellWidth: 60 },
            2: { cellWidth: 50 },
            3: { cellWidth: 60 },
          },
          theme: "grid",
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 5;
      }

      // Requirement Information Section
      if (DataProject.requirementData) {
        autoTable(doc, {
          startY: yPos,
          body: [
            [{ content: "Requirement Number", styles: { fontStyle: "bold" } }, DataProject.requirementData.reqNumber || "-"],
            [{ content: "Requirement Type", styles: { fontStyle: "bold" } }, DataProject.requirementData.requirementType || "-"],
            [{ content: "Requirement Status", styles: { fontStyle: "bold" } }, DataProject.requirementData.reqStatus || "-"],
          ],
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 112 },
          },
          theme: "grid",
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 5;
      }

      // Work Programs Section
      if (DataProject.workPrograms && DataProject.workPrograms.length > 0) {
        const externalCount = DataProject.workPrograms.filter((wp) => wp.workProgramSource === "EXTERNAL").length;
        const internalCount = DataProject.workPrograms.filter((wp) => wp.workProgramSource === "INTERNAL").length;

        autoTable(doc, {
          startY: yPos,
          body: [
            [{ content: "External Work Programs", styles: { fontStyle: "bold" } }, externalCount.toString()],
            [{ content: "Internal Work Programs", styles: { fontStyle: "bold" } }, internalCount.toString()],
            [{ content: "Total Work Programs", styles: { fontStyle: "bold" } }, DataProject.workPrograms.length.toString()],
          ],
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 112 },
          },
          theme: "grid",
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 5;
      }

      // Description Section (if long text)
      if (DataProject.projectDesc && DataProject.projectDesc.length > 50) {
        autoTable(doc, {
          startY: yPos,
          body: [
            [{ content: "Project Description", styles: { fontStyle: "bold" } }],
            [DataProject.projectDesc],
          ],
          styles: { 
            fontSize: 9,
            cellPadding: 3,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          theme: "grid",
          margin: { left: 14, right: 14 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 5;
      }

      // Footer Section
      const currentDate = new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      autoTable(doc, {
        startY: yPos,
        body: [
          [{ content: `Bandung, ${currentDate}`, styles: { halign: "left" } }],
          [{ content: "Generated by Project Management System", styles: { halign: "center", fontStyle: "italic" } }],
        ],
        styles: { 
          fontSize: 8,
          cellPadding: 3,
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        theme: "grid",
        margin: { left: 14, right: 14 },
      });

      // Save PDF
      doc.save(`Project_${DataProject.projectNo}_${Date.now()}.pdf`);

      showToast({
        description: "PDF exported successfully",
        statusToast: "success",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      showToast({
        description: "Failed to export PDF",
        statusToast: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <LayoutAdmin>
        <Box p={8} textAlign="center">
          <LoadingMiniSquare />
          <Text mt={4}>Loading project data...</Text>
        </Box>
      </LayoutAdmin>
    );
  }

  if (!DataProject) {
    return (
      <LayoutAdmin>
        <Box p={8} textAlign="center">
          <Text>Project not found</Text>
          <Button mt={4} onClick={() => router.back()}>
            Go Back
          </Button>
        </Box>
      </LayoutAdmin>
    );
  }

  return (
    <LayoutAdmin>
      <Box p={4}>
        {/* Action Buttons - Hidden on print */}
        <Card mb={4} className="no-print" borderRadius={radiusStyle}>
          <CardBody>
            <HStack spacing={4} justify="space-between">
              <Button
                leftIcon={<FiArrowLeft />}
                onClick={() => router.back()}
                variant="ghost"
              >
                Back
              </Button>
              <HStack spacing={2}>
                <Button
                  leftIcon={<FiPrinter />}
                  onClick={handlePrint}
                  colorScheme="blue"
                  variant="outline"
                >
                  Print
                </Button>
                <Button
                  leftIcon={<FiDownload />}
                  onClick={handleExportPDF}
                  colorScheme="blue"
                  isLoading={isExporting}
                  loadingText="Exporting..."
                >
                  Export PDF
                </Button>
              </HStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Document Content */}
        <ProjectDocContent project={DataProject} />
      </Box>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 20mm;
          }

          .no-print {
            display: none !important;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .doc-container {
            width: 100%;
            max-width: none;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </LayoutAdmin>
  );
}
