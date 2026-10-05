export type ProblemCategory =
  | "Error App"
  | "Error Surrounding"
  | "Human Error"
  | "Other";

export type SolutionType = "Temporary" | "Permanent";

export type IncidentStatus =
  | "Open"
  | "In Progress"
  | "Pending"
  | "Solved"
  | "Temporary Solved";

export type IncidentPriority = "HIGH" | "MEDIUM" | "LOW";

export interface PicPelapor {
  namaLengkap: string;
  noTelp: string;
  email: string;
  divisi: string;
}

export interface PicEos {
  namaLengkap: string;
  noTelp: string;
  email: string;
  grup: string;
}

export interface ProblemDetail {
  reportDate: string; // ISO date string / datetime-local
  errorDateStart: string;
  errorDateEnd?: string;
  runtimeHours: number;
  runtimeMinutes: number;
  errorCode: string;
  errorCodeOther?: string;
  errorDescription: string;
  jenisSurrounding: string;
  jenisSurroundingOther?: string;
  problemCategory: ProblemCategory;
  problemCategoryOther?: string;
  problemDescription: string;
  problemCaptureName?: string;
  problemCaptureUrl?: string;
  logsText?: string;
  logsFileName?: string;
}

export interface SolutionDetail {
  jenisSolution?: SolutionType;
  tindakLanjut?: string; // Wajib jika Temporary
  solvedDateStart?: string;
  solvedDateEnd?: string;
  runtimeHours?: number;
  runtimeMinutes?: number;
  solvedBy?: string;
  grup?: string;
  solutionDescription?: string;
  solutionCaptureName?: string;
  solutionCaptureUrl?: string;
  logsText?: string;
  logsFileName?: string;
}

export interface EosIncidentItem {
  id: string;
  incidentNumber: string;
  appId: string;
  appName: string;
  appCode: string;
  appTier: string;
  priorityIncident: IncidentPriority;
  picPelapor: PicPelapor;
  picEos: PicEos;
  problem: ProblemDetail;
  solution: SolutionDetail;
  statusIncident: IncidentStatus;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationOption {
  id: string;
  name: string;
  code: string;
  tier: string;
  division: string;
  owner: string;
  openIncidentsCount: number;
  totalIncidentsCount: number;
}

export interface IbcErrorCodeOption {
  code: string;
  description: string;
  defaultSurrounding: string;
  defaultCategory: ProblemCategory;
}

export const IBC_ERROR_CODES: IbcErrorCodeOption[] = [
  {
    code: "IBC-ERR-1001",
    description: "Timeout Connection to Core Banking Host (ISO-8583 socket timeout > 30s)",
    defaultSurrounding: "Core Banking Host (ISO 8583)",
    defaultCategory: "Error Surrounding",
  },
  {
    code: "IBC-ERR-1002",
    description: "Database HikariCP Connection Pool Exhausted (Max Active pool reached)",
    defaultSurrounding: "Oracle DB Cluster (RAC Node 2)",
    defaultCategory: "Error App",
  },
  {
    code: "IBC-ERR-2001",
    description: "SSO OAuth2 Token Signature Verification Failed / Certificate Expired",
    defaultSurrounding: "Active Directory / Keycloak IAM Server",
    defaultCategory: "Error Surrounding",
  },
  {
    code: "IBC-ERR-2002",
    description: "Invalid Credential Lockout (User attempts exceed policy threshold)",
    defaultSurrounding: "LDAP / User Repository",
    defaultCategory: "Human Error",
  },
  {
    code: "IBC-ERR-3001",
    description: "API Gateway 504 Gateway Timeout during QRIS Inbound Payment Request",
    defaultSurrounding: "Kong API Gateway & ASPI Switch",
    defaultCategory: "Error Surrounding",
  },
  {
    code: "IBC-ERR-3002",
    description: "Null Pointer Exception during batch payroll parsing (Payload format mismatch)",
    defaultSurrounding: "Payroll Service Worker",
    defaultCategory: "Error App",
  },
  {
    code: "IBC-ERR-4001",
    description: "IBM MQ Channel Inactive / Queue Full (AMQ9519 channel not running)",
    defaultSurrounding: "IBM MQ Queue Manager (QM_CORP_01)",
    defaultCategory: "Error Surrounding",
  },
  {
    code: "IBC-ERR-5001",
    description: "Third-Party Biller Partner HTTP 500 Unreachable (PLN / Telkom Biller)",
    defaultSurrounding: "Third-Party Aggregator Switch",
    defaultCategory: "Error Surrounding",
  },
  {
    code: "IBC-ERR-9999",
    description: "Uncaught System Runtime Exception / Memory OutOfMemoryError",
    defaultSurrounding: "Application JVM Container",
    defaultCategory: "Error App",
  },
  {
    code: "OTHER",
    description: "Error Code Lainnya (Input Manual)",
    defaultSurrounding: "Lainnya",
    defaultCategory: "Other",
  },
];

export const DIVISION_OPTIONS = [
  "Divisi TI Operations & Support",
  "Divisi Pengembangan Aplikasi (IT Application Development)",
  "Divisi Digital Banking",
  "Divisi Infrastruktur & Jaringan TI",
  "Divisi Keamanan Informasi & Cyber Security",
  "Divisi Operasional Cabang & Layanan",
  "Divisi Manajemen Risiko & Kepatuhan",
  "Divisi Enterprise Data Management & BI",
  "Divisi Akuntansi & Keuangan",
];

export const IT_GROUP_OPTIONS = [
  "Group EoS Core Banking",
  "Group EoS Digital Channel & Mobile",
  "Group EoS Database & Storage Administrator",
  "Group EoS System Administrator & OS",
  "Group EoS Network & Telecommunication",
  "Group EoS Middleware & API Integration",
  "Group EoS Security Operations Center (SOC)",
  "Group EoS Payment Switch & ATM/EDC",
];

export const STATUS_INCIDENT_CONFIG: Record<
  IncidentStatus,
  { label: string; colorScheme: string; badgeBg: string; textColor: string }
> = {
  Open: {
    label: "Open",
    colorScheme: "red",
    badgeBg: "red.500",
    textColor: "red.600",
  },
  "In Progress": {
    label: "In Progress",
    colorScheme: "blue",
    badgeBg: "blue.500",
    textColor: "blue.600",
  },
  Pending: {
    label: "Pending",
    colorScheme: "yellow",
    badgeBg: "yellow.500",
    textColor: "yellow.700",
  },
  "Temporary Solved": {
    label: "Temporary Solved",
    colorScheme: "purple",
    badgeBg: "purple.500",
    textColor: "purple.600",
  },
  Solved: {
    label: "Solved",
    colorScheme: "green",
    badgeBg: "green.500",
    textColor: "green.600",
  },
};

export const INITIAL_APPLICATIONS: ApplicationOption[] = [
  {
    id: "app-cbe",
    name: "Core Banking Engine (IBC)",
    code: "CBE",
    tier: "Critical",
    division: "Divisi TI Operations & Support",
    owner: "Bambang Sudirgo",
    openIncidentsCount: 3,
    totalIncidentsCount: 14,
  },
  {
    id: "app-mb",
    name: "Mobile Banking Customer App (b-mobile)",
    code: "MB-BFF",
    tier: "Critical",
    division: "Divisi Digital Banking",
    owner: "Rizky Pratama",
    openIncidentsCount: 2,
    totalIncidentsCount: 9,
  },
  {
    id: "app-qris",
    name: "Merchant QRIS & Inbound Payment Hub",
    code: "QRIS-HUB",
    tier: "Critical",
    division: "Divisi Digital Banking",
    owner: "Hendro Wibowo",
    openIncidentsCount: 1,
    totalIncidentsCount: 6,
  },
  {
    id: "app-dms",
    name: "Enterprise Document Management System",
    code: "DMS",
    tier: "Not Critical",
    division: "Divisi Pengembangan Aplikasi",
    owner: "Fajar Nugraha",
    openIncidentsCount: 0,
    totalIncidentsCount: 4,
  },
  {
    id: "app-llo",
    name: "Loan Origination & Credit Approval",
    code: "LLO",
    tier: "Critical",
    division: "Divisi Manajemen Risiko & Kepatuhan",
    owner: "Siti Rahma",
    openIncidentsCount: 1,
    totalIncidentsCount: 5,
  },
];

export const INITIAL_INCIDENTS_DATA: EosIncidentItem[] = [
  {
    id: "eos-inc-001",
    incidentNumber: "EOS/INC/2026/10/0042",
    appId: "app-cbe",
    appName: "Core Banking Engine (IBC)",
    appCode: "CBE",
    appTier: "Critical",
    priorityIncident: "HIGH",
    picPelapor: {
      namaLengkap: "Arya Wiguna",
      noTelp: "0812-9847-1120",
      email: "arya.wiguna@bankbjb.co.id",
      divisi: "Divisi Operasional Cabang & Layanan",
    },
    picEos: {
      namaLengkap: "Dedi Supriyadi",
      noTelp: "0813-8822-4411",
      email: "dedi.supriyadi@bankbjb.co.id",
      grup: "Group EoS Core Banking",
    },
    problem: {
      reportDate: "2026-10-04T08:15",
      errorDateStart: "2026-10-04T08:10",
      errorDateEnd: "2026-10-04T09:45",
      runtimeHours: 1,
      runtimeMinutes: 35,
      errorCode: "IBC-ERR-1001",
      errorDescription: "Timeout Connection to Core Banking Host (ISO-8583 socket timeout > 30s)",
      jenisSurrounding: "Core Banking Host (ISO 8583)",
      problemCategory: "Error Surrounding",
      problemDescription: "Nasabah di 14 kantor cabang mengalami timeout transaksi setoran tunai via teller. Muncul pop-up error socket timeout 30s.",
      problemCaptureName: "error_socket_timeout_cabang.png",
      logsText: "[2026-10-04 08:12:44] WARN c.b.c.iso.SocketChannel: Connection pool dropped socket #402 due to timeout (30000ms). Host response not received.",
    },
    solution: {
      jenisSolution: "Temporary",
      tindakLanjut: "Restart socket pooling daemon dan koordinasi dengan tim Network untuk failover ke link WAN backup. Rencana migrasi socket driver pada sprint maintenance akhir bulan.",
      solvedDateStart: "2026-10-04T09:45",
      solvedDateEnd: "2026-10-04T10:00",
      runtimeHours: 0,
      runtimeMinutes: 15,
      solvedBy: "Dedi Supriyadi",
      grup: "Group EoS Core Banking",
      solutionDescription: "Melakukan restart daemon socket adapter host pada cluster node 02 dan switch routing port ke secondary gateway. Layanan teller kembali normal.",
      solutionCaptureName: "socket_service_restarted.png",
      logsText: "[2026-10-04 09:48:12] INFO c.b.c.iso.SocketChannel: Channel connected to secondary host 10.20.10.15:8000 successfully.",
    },
    statusIncident: "Temporary Solved",
    remark: "Perlu pengecekan kabel FO telkom oleh tim Network pada maintenance window malam hari.",
    createdAt: "2026-10-04T08:15:00Z",
    updatedAt: "2026-10-04T10:15:00Z",
  },
  {
    id: "eos-inc-002",
    incidentNumber: "EOS/INC/2026/10/0043",
    appId: "app-cbe",
    appName: "Core Banking Engine (IBC)",
    appCode: "CBE",
    appTier: "Critical",
    priorityIncident: "MEDIUM",
    picPelapor: {
      namaLengkap: "Rani Kartika",
      noTelp: "0811-2233-4455",
      email: "rani.kartika@bankbjb.co.id",
      divisi: "Divisi Akuntansi & Keuangan",
    },
    picEos: {
      namaLengkap: "Budi Santoso",
      noTelp: "0812-7766-5544",
      email: "budi.santoso@bankbjb.co.id",
      grup: "Group EoS Database & Storage Administrator",
    },
    problem: {
      reportDate: "2026-10-04T14:30",
      errorDateStart: "2026-10-04T14:20",
      runtimeHours: 0,
      runtimeMinutes: 45,
      errorCode: "IBC-ERR-1002",
      errorDescription: "Database HikariCP Connection Pool Exhausted (Max Active pool reached)",
      jenisSurrounding: "Oracle DB Cluster (RAC Node 2)",
      problemCategory: "Error App",
      problemDescription: "Proses rekon harian akuntansi terhenti karena aplikasi tidak mendapat koneksi database. CPU usage DB RAC Node 2 mencapai 98%.",
      problemCaptureName: "hikaricp_exhausted.png",
      logsText: "java.sql.SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30001ms.",
    },
    solution: {},
    statusIncident: "In Progress",
    remark: "Sedang dilakukan kill session zombie query rekon oleh DBA on-duty.",
    createdAt: "2026-10-04T14:30:00Z",
    updatedAt: "2026-10-04T14:45:00Z",
  },
  {
    id: "eos-inc-003",
    incidentNumber: "EOS/INC/2026/10/0044",
    appId: "app-mb",
    appName: "Mobile Banking Customer App (b-mobile)",
    appCode: "MB-BFF",
    appTier: "Critical",
    priorityIncident: "LOW",
    picPelapor: {
      namaLengkap: "Taufik Hidayat",
      noTelp: "0819-0102-0304",
      email: "taufik.hidayat@bankbjb.co.id",
      divisi: "Divisi Digital Banking",
    },
    picEos: {
      namaLengkap: "Gilang Maulana",
      noTelp: "0856-7890-1234",
      email: "gilang.maulana@bankbjb.co.id",
      grup: "Group EoS Digital Channel & Mobile",
    },
    problem: {
      reportDate: "2026-10-03T20:10",
      errorDateStart: "2026-10-03T20:00",
      errorDateEnd: "2026-10-03T21:30",
      runtimeHours: 1,
      runtimeMinutes: 30,
      errorCode: "IBC-ERR-3001",
      errorDescription: "API Gateway 504 Gateway Timeout during QRIS Inbound Payment Request",
      jenisSurrounding: "Kong API Gateway & ASPI Switch",
      problemCategory: "Error Surrounding",
      problemDescription: "User nasabah b-mobile mengeluhkan transaksi bayar QRIS merchant gagal dengan pesan 'Layanan Sedang Sibuk'.",
      problemCaptureName: "qris_timeout_error.png",
      logsText: "HTTP/1.1 504 Gateway Time-out - Upstream ASPI National Switch latency > 15000ms",
    },
    solution: {
      jenisSolution: "Permanent",
      solvedDateStart: "2026-10-03T21:30",
      solvedDateEnd: "2026-10-03T21:40",
      runtimeHours: 0,
      runtimeMinutes: 10,
      solvedBy: "Gilang Maulana",
      grup: "Group EoS Digital Channel & Mobile",
      solutionDescription: "Switching route traffic QRIS ke secondary switching provider (Artajasa / Alto) sesuai failover SOP.",
      solutionCaptureName: "route_failover_success.png",
      logsText: "200 OK - QRIS Payment processed via secondary switch in 1.4s.",
    },
    statusIncident: "Solved",
    remark: "Case closed. Post-mortem meeting dengan tim vendor switching dijadwalkan besok.",
    createdAt: "2026-10-03T20:10:00Z",
    updatedAt: "2026-10-03T21:45:00Z",
  },
  {
    id: "eos-inc-004",
    incidentNumber: "EOS/INC/2026/10/0045",
    appId: "app-qris",
    appName: "Merchant QRIS & Inbound Payment Hub",
    appCode: "QRIS-HUB",
    appTier: "Critical",
    priorityIncident: "HIGH",
    picPelapor: {
      namaLengkap: "Dewi Lestari",
      noTelp: "0812-4455-6677",
      email: "dewi.lestari@bankbjb.co.id",
      divisi: "Divisi Digital Banking",
    },
    picEos: {
      namaLengkap: "Wahyu Setiawan",
      noTelp: "0813-5566-7788",
      email: "wahyu.setiawan@bankbjb.co.id",
      grup: "Group EoS Payment Switch & ATM/EDC",
    },
    problem: {
      reportDate: "2026-10-05T07:30",
      errorDateStart: "2026-10-05T07:15",
      runtimeHours: 0,
      runtimeMinutes: 30,
      errorCode: "IBC-ERR-2001",
      errorDescription: "SSO OAuth2 Token Signature Verification Failed / Certificate Expired",
      jenisSurrounding: "Active Directory / Keycloak IAM Server",
      problemCategory: "Error Surrounding",
      problemDescription: "Merchant portal gagal login karena token verifikasi ditolak dengan error invalid signature.",
      logsText: "JWT validation error: Certificate thumbprint mismatch. Token public key expired on 04-Oct-2026 23:59:59.",
    },
    solution: {},
    statusIncident: "Open",
    remark: "Menunggu update SSL certificate baru dari tim Security Operations Center.",
    createdAt: "2026-10-05T07:30:00Z",
    updatedAt: "2026-10-05T07:30:00Z",
  },
];
