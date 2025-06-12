import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Badge,
  Box,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import React, { ReactNode, useEffect, useState } from "react";
import { format } from "date-fns";
import { radiusStyle } from "../constants/applicationConstants";
import { AiFillFileExcel, AiFillFilePdf, AiFillFileWord } from "react-icons/ai";
import { FaFileAlt } from "react-icons/fa";
import { AttachmentProps } from "../types/masterTypes";

// capitalize each word string
export function capitalizeWords(str: string) {
  let result = "";
  if (str !== undefined && str !== null) {
    result = str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  return result;
}

export const convertToCustomDateFormat = (dateString: string): string => {
  // Parse the date string into a Date object
  const date = new Date(dateString);

  // Extract day, month, year, hours, and minutes
  const day = date.getDate().toString().padStart(2, "0"); // Pad with '0' if necessary
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-indexed, so add 1
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0"); // Pad with '0' if necessary
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Pad with '0' if necessary

  // Format the date and time into the desired format
  const formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;

  return formattedDate;
};

export function formatDateToYYYYMMDD(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1 and pad with '0'
  const day = String(date.getDate()).padStart(2, "0"); // Pad with '0' if single-digit day

  return `${year}-${month}-${day}`;
}

export function formatDateToDDMMYYYY(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1 and pad with '0'
  const day = String(date.getDate()).padStart(2, "0"); // Pad with '0' if single-digit day

  return `${day}-${month}-${year}`;
}

export function formatDateInput(inputDate: string): string {
  const parts = inputDate.split("-");

  if (parts.length !== 3) {
    throw new Error("Invalid date format. Expected 'yyyy-mm-dd'.");
  }

  const year = parts[0];
  const month = parts[1].padStart(2, "0");
  const day = parts[2].padStart(2, "0");

  return `${day}-${month}-${year}`;
}

export function formatDateReverse(inputDate: string): string {
  try {
    const parts = inputDate.split("-");

    if (parts.length !== 3) {
      throw new Error("Invalid date format. Expected 'dd-mm-yyyy'.");
    }

    const day = parts[0].padStart(2, "0");
    const month = parts[1].padStart(2, "0");
    const year = parts[2];

    return `${year}-${month}-${day}`;
  } catch (error) {
    console.log(error);
    return formatDateToDDMMYYYY(new Date());
  }
}

export function convertStringToDate(dateString: any) {
  try {
    // Split the string into day, month, and year parts
    const [year, month, day] = dateString.split("-");

    // Create a new Date object by passing the year, month (subtract 1 as months are zero-based), and day
    return new Date(year, month - 1, day);
  } catch (error) {
    console.log(error);
    return new Date();
  }
}

export function formatToRupiah(number: number): string {
  const formatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  });

  return formatter.format(number);
}

// date to time string converter (dd-mm-yyyy)
export function dateToString(e: any) {
  const date = zeroFill(e.getDate());
  const month = zeroFill(e.getMonth() + 1);
  const year = e.getFullYear();

  return `${date}-${month}-${year}`;
  // return `${year}-${month}-${date}`;
}

export function formatDateCA(dateString: string): string {
  const [day, month, year] = dateString.split("-");
  return `${year}-${month}-${day}`;
}
// zero fill < 10 number
export function zeroFill(d: number) {
  return (d < 10 ? "0" : "") + d;
}

// string to date converter
export function stringToDate(str: string) {
  const date = new Date(str);
  return date;
}

export function stringToDateFormated(str: string) {
  const dt = new Date(str);

  const date = zeroFill(dt.getDate());
  const month = zeroFill(dt.getMonth() + 1);
  const year = dt.getFullYear();

  return `${date}-${month}-${year}`;
}

export function stringToDateFormatedReverse(str: string) {
  const dt = new Date(str);

  const date = zeroFill(dt.getDate());
  const month = zeroFill(dt.getMonth() + 1);
  const year = dt.getFullYear();

  return `${year}-${month}-${date}`;
}

export const BadgeComponentStatus = ({ status }: { status: string }) => {
  const [statusLabel, setStatusLabel] = React.useState("");
  const [statusColor, setStatusColor] = React.useState("gray");
  // const statusColor = React.useMemo(() => (status ? "green" : "red"), [status]);
  // const statusLabel = React.useMemo(
  //   () => (status ? "Active" : "Inactive"),
  //   [status]
  // );

  useEffect(() => {
    if (status == "0") {
      setStatusLabel("Baru");
      setStatusColor("blue");
    } else if (status == "1") {
      setStatusLabel("Disetujui");
      setStatusColor("green");
    } else if (status == "2") {
      setStatusLabel("Ditolak");
      setStatusColor("red");
    } else {
      setStatusLabel("-");
      setStatusColor("gray");
    }
  }, [status]);

  return (
    <>
      <Badge variant="solid" colorScheme={statusColor}>
        {statusLabel}
      </Badge>
    </>
  );
};

export function CurrentYear() {
  const currentYear = new Date().getFullYear();

  return currentYear;
}

export function bytesToMB(bytes: number): number {
  const megabyte = 1024 * 1024;
  return Math.ceil(bytes / megabyte);
}

export function bytesToKB(bytes: number): number {
  const kilobyte = 1024;
  return Math.ceil(bytes / kilobyte);
}

export function nominalValidation({
  nom1,
  nom2,
}: {
  nom1: number;
  nom2: number;
}) {
  let result = "black";

  if (nom1 == nom2) {
    result = "green";
  }
  if (nom1 > nom2) {
    result = "orange";
  }
  if (nom1 < nom2) {
    result = "red";
  }

  return result;
}

export function convertFileToBase64(selectedFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result.split(",")[1] || ""); // Remove the data URL prefix
      } else {
        reject(new Error("Failed to convert file to base64."));
      }
    };
    reader.onerror = () => {
      reject(new Error("Error reading the file."));
    };
    reader.readAsDataURL(selectedFile);
  });
}

export function formatDateTimeBE(datetimeString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate: string = new Date(datetimeString)
    .toLocaleDateString(undefined, options)
    .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+)/, "$3/$2/$1 $4:$5");

  return formattedDate;
}

export function formatDateTimeBEPeriodFormat(datetimeString: string): string {
  const inputDate = new Date(datetimeString);

  const yearMonthString = format(inputDate, "yyyy/MM");

  return yearMonthString;
}

export function formatDateTimeBEPeriodMonth(datetimeString: string): string {
  const inputDate = new Date(datetimeString);

  const yearMonthString = format(inputDate, "MM");

  return yearMonthString;
}

export function formatDateTimeBEPeriodYear(datetimeString: string): string {
  const inputDate = new Date(datetimeString);

  const yearMonthString = format(inputDate, "yyyy");

  return yearMonthString;
}

export function excelSerialToJSDate(serial: number): string {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const date = new Date(
    (serial - 1) * millisecondsPerDay + Date.UTC(1900, 0, 1)
  );

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}/${day}`;
}

export function excelSerialToJSDatePeriod(serial: number): string {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const date = new Date(
    (serial - 1) * millisecondsPerDay + Date.UTC(1900, 0, 1)
  );

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}/${month}`;
}

export function formatDateTimeBEString(datetimeString: string): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  const formattedDate: string = new Date(datetimeString)
    .toLocaleDateString(undefined, options)
    .replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$2-$1");

  return formattedDate;
}

export function statusRecapDefinition(status: string | undefined) {
  let result = null;

  if (status == "") {
    result = <Badge colorScheme="gray">99. Undefined</Badge>;
  }

  if (status == "U") {
    result = <Badge colorScheme="gray">1. Uploaded</Badge>;
  }

  if (status == "S") {
    result = <Badge colorScheme="teal">2. Submited</Badge>;
  }

  if (status == "P") {
    result = <Badge colorScheme="blue">3. Progress</Badge>;
  }

  if (status == "V") {
    result = <Badge colorScheme="teal">4. Verified</Badge>;
  }

  if (status == "A") {
    result = <Badge colorScheme="teal">5. Approved</Badge>;
  }

  if (status == "NV") {
    result = (
      <Badge colorScheme="red" variant="solid">
        4. Not Verified
      </Badge>
    );
  }

  if (status == "N") {
    result = (
      <Badge colorScheme="yellow" variant="solid">
        1. New
      </Badge>
    );
  }

  if (status == "F") {
    result = (
      <Badge colorScheme="red" variant="solid">
        5. Failed
      </Badge>
    );
  }

  if (status == "E") {
    result = (
      <Badge variant="solid" colorScheme="blue">
        6. Executing
      </Badge>
    );
  }

  if (status == "EP") {
    result = (
      <Badge variant="solid" colorScheme="blue">
        6. Executing 2
      </Badge>
    );
  }

  if (status == "D") {
    result = (
      <Badge variant="solid" colorScheme="green">
        7. Done
      </Badge>
    );
  }

  return result;
}

export function statusRecapDefinitionRaw(status: string | undefined) {
  let result = "-";

  if (status == "") {
    result = "Undefined";
  }

  if (status == "U") {
    result = "Uploaded";
  }

  if (status == "S") {
    result = "Submited";
  }

  if (status == "P") {
    result = "Progress";
  }

  if (status == "V") {
    result = "Verified";
  }

  if (status == "A") {
    result = "Approved";
  }

  if (status == "NV") {
    result = "Not Verified";
  }

  if (status == "N") {
    result = "New";
  }

  if (status == "E") {
    result = "Executing";
  }

  if (status == "F") {
    result = "Failed Executing";
  }

  if (status == "EP") {
    result = "Executing 2";
  }

  if (status == "D") {
    result = "Done";
  }

  return result;
}

export function formatDateToISOString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  const offset = -date.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60)
    .toString()
    .padStart(2, "0");
  const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
  const offsetSign = offset < 0 ? "+" : "-";

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}${offsetSign}${offsetHours}${offsetMinutes}`;
}

export const AlertVerificationSatker = ({
  status,
  msgCustom,
}: {
  status: string | undefined;
  msgCustom: string | null;
}) => {
  let result = null;

  if (status == "NV") {
    result = (
      <Alert status="error">
        <AlertIcon />
        <Box>
          <AlertTitle>Data Gagal Diverifikasi</AlertTitle>
          <AlertDescription>
            <Box mx={5}>
              <p>
                {msgCustom != null
                  ? msgCustom
                  : "Terdapat kesalahan setelah proses verifikasi, cek kembali data yang gagal verifikasi"}
              </p>
            </Box>
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  if (status == "V") {
    result = (
      <Alert status="success">
        <AlertIcon />
        <Box>
          <AlertTitle>Data Berhasil Diverifikasi</AlertTitle>
          <AlertDescription>
            <Box mx={5}>
              <p>{msgCustom}</p>
            </Box>
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return result;
};

export const AlertResponse = ({
  msgHeader,
  msgCustom,
}: {
  msgHeader: string | undefined;
  msgCustom: string | null;
}) => {
  return (
    <Alert status="error">
      <AlertIcon />
      <Box>
        <AlertTitle>{msgHeader}</AlertTitle>
        <AlertDescription>
          <Box>{msgCustom}</Box>
        </AlertDescription>
      </Box>
    </Alert>
  );
};

export const AlertResponseCustom = ({
  msgHeader,
  msgCustom,
  statusAlert,
}: {
  msgHeader: string | undefined;
  msgCustom: ReactNode;
  statusAlert: "error" | "info" | "loading" | "warning" | "success" | undefined;
}) => {
  return (
    <Alert status={statusAlert} rounded={"lg"}>
      <AlertIcon />
      <Box>
        <AlertTitle>{msgHeader}</AlertTitle>
        <AlertDescription>
          <Box p={2}>{msgCustom}</Box>
        </AlertDescription>
      </Box>
    </Alert>
  );
};

export function MonthNameID(MonthNumber: string): string {
  let result = "";

  result = "INVALID MONTH NUMBER";

  if (MonthNumber == "01") {
    result = "JANUARI";
  }

  if (MonthNumber == "02") {
    result = "FEBRUARI";
  }

  if (MonthNumber == "03") {
    result = "MARET";
  }

  if (MonthNumber == "04") {
    result = "APRIL";
  }

  if (MonthNumber == "05") {
    result = "MEI";
  }

  if (MonthNumber == "06") {
    result = "JUNI";
  }

  if (MonthNumber == "07") {
    result = "JULI";
  }

  if (MonthNumber == "08") {
    result = "AGUSTUS";
  }

  if (MonthNumber == "09") {
    result = "SEPTEMBER";
  }

  if (MonthNumber == "10") {
    result = "OKTOBER";
  }

  if (MonthNumber == "11") {
    result = "NOVEMBER";
  }

  if (MonthNumber == "12") {
    result = "DESEMBER";
  }

  return result;
}

// Convert base64 string to Blob
export const base64ToBlobExcell = (base64String: string): Blob => {
  const byteCharacters = atob(base64String);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export function convertToSlug(text: string) {
  let lowerCaseText = text.toLowerCase();
  let slug = lowerCaseText.replace(/\s+/g, "-");
  return slug;
}

export function truncateText(
  text: string | null | undefined,
  maxLength: number
) {
  // Check if the text length exceeds the maxLength
  if (text != null || text != undefined) {
    if (text.length <= maxLength) {
      return text;
    }

    // Truncate the text and append "..."
    return text.substring(0, maxLength - 3) + "...";
  } else {
    return text;
  }
}

export function buildUrlPort(baseUrl: string, port: string): string {
  return `${baseUrl}:${port}`;
}

export function msToMinutes(ms: number): number {
  return ms / 60000;
}

export const validateEmail = (value: string): Promise<boolean> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Return a promise that resolves to true if the email is valid, otherwise false
  return new Promise((resolve) => {
    if (!value || !emailRegex.test(value)) {
      resolve(false); // Invalid email
    } else {
      resolve(true); // Valid email
    }
  });
};

export function arraysAreEqual(arr1: string[], arr2: string[]): boolean {
  // Check if both arrays have the same length
  if (arr1.length !== arr2.length) {
    return false;
  }

  // Sort the arrays to ensure order doesn't matter
  const sortedArr1 = [...arr1].sort();
  const sortedArr2 = [...arr2].sort();

  // Compare each element
  return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

export function generateUUIDV1(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface RtRwConversion {
  rt: string;
  rw: string;
}

export function separateRtRw(input: string): RtRwConversion {
  const parts = input.split(" / ").map((item) => item.trim());

  if (parts.length !== 2 || parts.some((part) => part === "")) {
    return { rt: "", rw: "" }; // Return empty strings if the input is invalid
  }

  const [rt, rw] = parts;
  return { rt, rw };
}

export function truncateToTwoWords(text: string): string {
  return text;
  // return text.split(" ").slice(0, 2).join(" ");
}

export const TextStatusProps = ({
  statusData,
  ...rest
}: {
  statusData: string;
}) => {
  if (statusData == "NEW") {
    return (
      <Text fontSize={"medium"} fontWeight={600} color={"white"} {...rest}>
        NEW
      </Text>
    );
  }

  if (statusData == "ACTIVE") {
    return (
      <Text fontSize={"medium"} fontWeight={600} color={"green.200"} {...rest}>
        ACTIVE
      </Text>
    );
  }

  if (statusData == "ONHOLD") {
    return (
      <Text fontSize={"medium"} fontWeight={600} color={"yellow.300"} {...rest}>
        ON HOLD
      </Text>
    );
  }

  if (statusData == "INACTIVE") {
    return (
      <Text fontSize={"medium"} fontWeight={600} color={"red.400"} {...rest}>
        IN ACTIVE
      </Text>
    );
  }

  return (
    <Text fontSize={"medium"} fontWeight={600} {...rest}>
      {statusData}
    </Text>
  );
};

export const TextLabelProps = ({
  statusData,
  ...rest
}: {
  statusData: string;
}) => {
  if (statusData == "INFO") {
    return (
      <Badge colorScheme={"secondary"} rounded={radiusStyle} px={2} {...rest}>
        INFO
      </Badge>
    );
  }
  if (statusData == "WARNING") {
    return (
      <Badge colorScheme={"yellow"} rounded={radiusStyle} px={2} {...rest}>
        WARNING
      </Badge>
    );
  }
  if (statusData == "CRITICAL") {
    return (
      <Badge colorScheme={"red"} rounded={radiusStyle} px={2} {...rest}>
        CRITICAL / ERROR
      </Badge>
    );
  }
  if (statusData == "ERROR") {
    return (
      <Badge colorScheme={"red"} rounded={radiusStyle} px={2} {...rest}>
        ERROR
      </Badge>
    );
  }
  if (statusData == "FIXED") {
    return (
      <Badge colorScheme={"green"} rounded={radiusStyle} px={2} {...rest}>
        FIXED
      </Badge>
    );
  }

  return (
    <Badge colorScheme={"gray"} rounded={radiusStyle} px={2} {...rest}>
      {statusData}
    </Badge>
  );
};

export function generateTimestamp(): string {
  const currentDate = new Date();
  return currentDate.toISOString();
}

export function generateUniqueCode(parameter: string): string {
  const timestamp = Date.now(); // Get current time in milliseconds
  return `${parameter}-${timestamp}`;
}

export const getCurrentQuarter = () => {
  const currentMonth = new Date().getMonth();
  return Math.floor(currentMonth / 3) + 1; // Q1-Q4
};

export const getQuarterDateRange = (year: number, quarter: number | "all") => {
  if (quarter === "all") {
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));
    return { startDate, endDate };
  }

  const startMonth = (quarter - 1) * 3;
  const startDate = new Date(Date.UTC(year, startMonth, 1));
  const endDate = new Date(Date.UTC(year, startMonth + 3, 0, 23, 59, 59, 999));
  return { startDate, endDate };
};

export function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min;
}

export function getRandomNumberInclusive(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function colorProgression(num: number): string {
  if (num <= 10) {
    return "red";
  }

  if (num >= 11 && num <= 50) {
    return "yellow";
  }

  if (num >= 51 && num <= 100) {
    return "secondary";
  }

  return "red";
}

export function nomCompColor(num1: number): string {
  const { colorMode } = useColorMode();
  if (num1 < 0) {
    return "red.500";
  }

  if (num1 > 0) {
    return "green.500";
  }

  return colorMode == "light" ? "black" : "white";
}

export function getPriorityFromMatrix(impact: string, urgency: string): string {
  if (impact === "HIGH" && urgency === "HIGH") return "CRITICAL";

  if (
    (impact === "HIGH" && urgency === "MEDIUM") ||
    (impact === "MEDIUM" && urgency === "HIGH")
  )
    return "HIGH";

  if (
    (impact === "LOW" && urgency === "HIGH") ||
    (impact === "MEDIUM" && urgency === "MEDIUM") ||
    (impact === "HIGH" && urgency === "LOW")
  )
    return "MEDIUM";

  // Remaining combinations fall to LOW
  return "LOW";
}

export function getQuarterText(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;

  if (isNaN(date.getTime())) return "Invalid Date";

  const month = date.getMonth(); // 0 = January
  const year = date.getFullYear();

  const quarter = Math.floor(month / 3) + 1;

  return `Triwulan ${quarter} - Tahun ${year}`;
}

export const monthSetMaster = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function calculateDurationInDays(
  startDateStr: string,
  endDateStr: string
): number {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  const diffTime = endDate.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export const renderFileIcon = (file: File) => {
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

export const ImagePreviewSM = ({ data }: { data: AttachmentProps }) => {
  const ImageModalDisc = useDisclosure();

  return (
    <Box
      rounded={radiusStyle}
      position="relative"
      // boxSize="130px"
      w={{ base: "40px", sm: "40px", md: "60px", lg: "60px" }}
      h={{ base: "40px", sm: "40px", md: "60px", lg: "60px" }}
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
        src={data.src}
        // boxSize="120px"
        w={{ base: "30px", sm: "30px", md: "50px", lg: "50px" }}
        h={{ base: "30px", sm: "30px", md: "50px", lg: "50px" }}
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
        <Text fontSize="xs" fontWeight="light" color="white">
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
              backgroundImage={`url(${data.src})`}
              rounded={radiusStyle}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export const renderFileIconSTR = (extFile: string) => {
  const ext = extFile.replace(".", "");
  switch (ext) {
    case "pdf":
      return <Icon as={AiFillFilePdf} w={8} h={8} color="red.500" />;
    case "xlsx":
      return <Icon as={AiFillFileExcel} w={8} h={8} color="green.500" />;
    case "docx":
      return <Icon as={AiFillFileWord} w={8} h={8} color="blue.500" />;
    default:
      return <Icon as={FaFileAlt} w={8} h={8} color="gray.500" />;
  }
};
