"use client";

import { useEffect, useState } from "react";
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
  Heading,
  HStack,
  Icon,
  Text,
  useColorMode,
  VStack,
  Wrap,
  Badge,
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FiArrowLeft, FiArrowRight, FiSave, FiSend } from "react-icons/fi";

import { HeaderContent } from "@/app/components/headerContent";
import LayoutAdmin from "@/app/components/layoutAdmin";
import { radiusStyle } from "@/app/constants/applicationConstants";
import { useDocumentTitle } from "@/app/hooks/useDocumentTitle";
import { AuthDataModelInterface } from "@/app/context/AuthContext";
import { AuthDataResponse } from "@/app/services/useAuthentications";
import { CabCategory } from "@/app/types/cabTypes";

import useCabCreateForm, { SOFTWARE_STEPS, HARDWARE_STEPS } from "./hooks/useCabCreateForm";
import StepperBar from "./components/StepperBar";
import SoftwareStep1 from "./components/software/SoftwareStep1";
import SoftwareStep2 from "./components/software/SoftwareStep2";
import SoftwareStep3 from "./components/software/SoftwareStep3";
import SoftwareStep5 from "./components/software/SoftwareStep5";
import SoftwareReview from "./components/software/SoftwareReview";
import HardwareStep1 from "./components/hardware/HardwareStep1";
import HardwareStep2 from "./components/hardware/HardwareStep2";
import HardwareStep3 from "./components/hardware/HardwareStep3";
import HardwareStep4 from "./components/hardware/HardwareStep4";
import HardwareReview from "./components/hardware/HardwareReview";

const CreateView = () => {
  useDocumentTitle("Buat CAB Request");
  const { colorMode } = useColorMode();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tokenData, setTokenData] = useState<string>("");

  useEffect(() => {
    const token = localStorage.getItem("tokenData") as string;
    if (token) setTokenData(token);
  }, []);

  const form = useCabCreateForm();

  // Read category from URL and set it
  useEffect(() => {
    const cat = searchParams.get("category") as CabCategory | null;
    if (cat && (cat === "SOFTWARE" || cat === "HARDWARE") && !form.category) {
      form.handleSelectCategory(cat);
    }
  }, [searchParams]);

  const bgCard = colorMode === "light" ? "white" : "gray.800";
  const borderCol = colorMode === "light" ? "gray.200" : "gray.700";

  // If no category yet (fallback — shouldn't happen if modal is used), redirect back
  if (!form.category) {
    return (
      <LayoutAdmin>
        <HeaderContent titleName="Buat CAB Request" breadCrumb={["CAB", "CAB Request", "Buat Request"]} />
        <Box px={{ base: 4, sm: 5, md: 6 }} mt={4} textAlign="center" py={20}>
          <Text color="gray.500" mb={4}>Kategori belum dipilih</Text>
          <Link href="/cab/cab-request">
            <Button leftIcon={<FiArrowLeft />}>Kembali</Button>
          </Link>
        </Box>
      </LayoutAdmin>
    );
  }

  // ─── Form with Stepper ──────────────────────────────────────────────────
  const isSoftware = form.category === "SOFTWARE";

  return (
    <LayoutAdmin>
      <HeaderContent titleName="Buat CAB Request" breadCrumb={["CAB", "CAB Request", "Buat Request"]} />

      <Grid templateColumns="repeat(12, 1fr)" gap={5} w="full" px={{ base: 4, sm: 5, md: 6 }} mt={4}>
        {/* Top Row */}
        <GridItem colSpan={{ base: 12, sm: 12, md: 8, lg: 8 }} w="full">
          <Flex w="full" as={Wrap} spacing={2} overflowX="auto" justifyContent="start">
            <Link href="/cab/cab-request">
              <Button size="lg" leftIcon={<FiArrowLeft />}>Back</Button>
            </Link>
          </Flex>
        </GridItem>
        <GridItem colSpan={{ base: 12, sm: 12, md: 4, lg: 4 }} w="full">
          <Flex as={Wrap} w="full" justifyContent="end" alignItems="center" gap={3}>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={() => form.handleSubmit(true)}
              isLoading={form.loading}
              px={8}
              size="lg"
            >
              Save Draft
            </Button>
            <Button
              colorScheme="green"
              leftIcon={<FiSend />}
              onClick={() => form.handleSubmit(false)}
              isLoading={form.loading}
              isDisabled={!form.isLastStep}
              px={8}
              size="lg"
            >
              Submit
            </Button>
          </Flex>
        </GridItem>

        {/* Form Card */}
        <GridItem colSpan={12}>
          <Card w="full" rounded={radiusStyle} bg={bgCard} border="1px" borderColor={borderCol}>
            <CardHeader pb={0}>
              <Heading as="h5" size="md">
                Form CAB Request — {form.category}
              </Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={6} w="full">
                {/* Stepper */}
                <StepperBar steps={form.stepLabels} currentStep={form.currentStep} />
                <Divider />

                {/* Step Content */}
                <Box w="full" minH="300px">
                  {isSoftware ? (
                    <>
                      {form.currentStep === 0 && (
                        <SoftwareStep1
                          data={form.swStep1}
                          onChange={form.setSwStep1}
                          fetchApplications={form.fetchApplications}
                          fetchRequirements={form.fetchRequirements}
                          fetchProjects={form.fetchProjects}
                          tokenData={tokenData}
                        />
                      )}
                      {form.currentStep === 1 && (
                        <SoftwareStep2 data={form.swStep2} onChange={form.setSwStep2} />
                      )}
                      {form.currentStep === 2 && (
                        <SoftwareStep3
                          dataStep3={form.swStep3}
                          dataStep4={form.swStep4}
                          onChangeStep3={form.setSwStep3}
                          onChangeStep4={form.setSwStep4}
                          mainProjectId={
                            form.swStep1.applications?.[0]?.projectId ||
                            form.swStep1.projectId ||
                            form.swStep1.applications?.[0]?.rfcKodeProject ||
                            form.swStep1.rfcKodeProject ||
                            ""
                          }
                          mainProjectCode={
                            form.swStep1.applications?.[0]?.rfcKodeProject ||
                            form.swStep1.rfcKodeProject ||
                            ""
                          }
                          mainProjectName={
                            form.swStep1.applications?.[0]?.applicationName ||
                            form.swStep1.applicationName ||
                            form.swStep1.applications?.[0]?.rfcKodeProject ||
                            form.swStep1.rfcKodeProject ||
                            ""
                          }
                        />
                      )}
                      {form.currentStep === 3 && (
                        <SoftwareStep5
                          data={form.swStep5}
                          onChange={form.setSwStep5}
                          fetchUsers={form.fetchUsers}
                          tokenData={tokenData}
                        />
                      )}
                      {form.currentStep === 4 && (
                        <SoftwareReview
                          step1={form.swStep1}
                          step2={form.swStep2}
                          step3={form.swStep3}
                          step4={form.swStep4}
                          step5={form.swStep5}
                        />
                      )}
                    </>
                  ) : (
                    <>
                      {form.currentStep === 0 && (
                        <HardwareStep1
                          data={form.hwStep1}
                          onChange={form.setHwStep1}
                          fetchRequirements={form.fetchRequirements}
                          fetchProjects={form.fetchProjects}
                          tokenData={tokenData}
                        />
                      )}
                      {form.currentStep === 1 && (
                        <HardwareStep2 data={form.hwStep2} onChange={form.setHwStep2} />
                      )}
                      {form.currentStep === 2 && (
                        <HardwareStep3
                          data={form.hwStep3}
                          onChange={form.setHwStep3}
                          mainProjectId={
                            form.hwStep1.projectId ||
                            form.hwStep1.kodeProject ||
                            ""
                          }
                          mainProjectCode={form.hwStep1.kodeProject || ""}
                          mainProjectName={
                            form.hwStep1.namaHardware || form.hwStep1.kodeProject || ""
                          }
                        />
                      )}
                      {form.currentStep === 3 && (
                        <HardwareStep4
                          data={form.hwStep4}
                          onChange={form.setHwStep4}
                          fetchUsers={form.fetchUsers}
                          tokenData={tokenData}
                        />
                      )}
                      {form.currentStep === 4 && (
                        <HardwareReview
                          step1={form.hwStep1}
                          step2={form.hwStep2}
                          step3={form.hwStep3}
                          step4={form.hwStep4}
                        />
                      )}
                    </>
                  )}
                </Box>

                {/* Navigation */}
                <Flex mt={6} w="full" justify="space-between">
                  <Button
                    onClick={form.handleBack}
                    isDisabled={form.currentStep === 0}
                    variant="outline"
                    leftIcon={<FiArrowLeft />}
                    size="lg"
                  >
                    Previous
                  </Button>
                  {!form.isLastStep && (
                    <Button
                      onClick={form.handleNext}
                      colorScheme="blue"
                      rightIcon={<FiArrowRight />}
                      size="lg"
                    >
                      Next
                    </Button>
                  )}
                </Flex>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </LayoutAdmin>
  );
};

export default CreateView;
