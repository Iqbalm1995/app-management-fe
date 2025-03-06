export interface AppsDataInterface {
  id: string;
  appCode: string;
  appShortName: string;
  appName: string;
  appDesc: string | null;
  note: string | null;
  iconApps: string | null;
  appsStatus: "ACTIVE" | "INACTIVE";
  readyToLaunch: "0" | "1";
  environment: AppsEnvsInterface[];
}

export interface AppsEnvsInterface {
  id: string;
  envName: string;
  envDesc: string | null;
  isActive: "ACTIVE" | "INACTIVE";
  links: AppsEnvsLinksInterface[];
  accounts: AppsEnvsAccountsInterface[];
}

export interface AppsEnvsLinksInterface {
  id: string;
  linkSource: string;
}

export interface AppsEnvsAccountsInterface {
  id: string;
  accountName: string;
  accountDesc: string;
}

export const DATA_APPS: AppsDataInterface[] = [
  {
    id: "1",
    appCode: "IBC01",
    appShortName: "IBC",
    appName: "Internet Banking Corporate (IBC)",
    appDesc: "",
    note: "The only way to do great work is to love what you do. — Steve Jobs",
    iconApps: null,
    appsStatus: "ACTIVE",
    readyToLaunch: "1",
    environment: [
      {
        id: "1",
        envName: "DEV",
        envDesc: "Development Environment",
        isActive: "ACTIVE",
        links: [
          {
            id: "Nasabah",
            linkSource: "http://10.0.104.74/corporate/",
          },
          {
            id: "BankLine",
            linkSource: "http://10.0.104.74:81/gpcash/public/#!",
          },
        ],
        accounts: [
          {
            id: "1",
            accountName: "Admin Account",
            accountDesc: "Administrator account for managing the app.",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    appCode: "VAD02",
    appShortName: "VAD",
    appName: "Virtual Account Debit (VAD)",
    appDesc: "",
    note: "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
    iconApps: null,
    appsStatus: "ACTIVE",
    readyToLaunch: "1",
    environment: [
      {
        id: "1",
        envName: "DEV",
        envDesc: "Development Environment",
        isActive: "ACTIVE",
        links: [
          {
            id: "Nasabah",
            linkSource: "http://192.168.239.150/login",
          },
          {
            id: "BankLine",
            linkSource: "http://192.168.239.150:8788/login",
          },
        ],
        accounts: [
          {
            id: "1",
            accountName: "Admin Account",
            accountDesc: "Administrator account for managing the app.",
          },
        ],
      },
    ],
  },
  {
    id: "3",
    appCode: "PORTAL03",
    appShortName: "PORTAL",
    appName: "bjb Portal",
    appDesc: "",
    note: "You miss 100% of the shots you don't take. — Wayne Gretzky",
    iconApps: null,
    appsStatus: "ACTIVE",
    readyToLaunch: "1",
    environment: [
      {
        id: "1",
        envName: "DEV",
        envDesc: "Development Environment",
        isActive: "ACTIVE",
        links: [
          {
            id: "Nasabah",
            linkSource: "http://192.168.239.117:5000",
          },
          {
            id: "BankLine",
            linkSource: "http://192.168.239.117:8888/",
          },
        ],
        accounts: [
          {
            id: "1",
            accountName: "Admin Account",
            accountDesc: "Administrator account for managing the app.",
          },
        ],
      },
    ],
  },
  {
    id: "4",
    appCode: "SIBOS04",
    appShortName: "SIBOS",
    appName: "Penyaluran Dana Bantuan Operasional Sekolah (SiBOS)",
    appDesc: "",
    note: "Belive you can and you're halfway there. — Theodore Roosevelt",
    iconApps: null,
    appsStatus: "ACTIVE",
    readyToLaunch: "1",
    environment: [
      {
        id: "1",
        envName: "DEV",
        envDesc: "Development Environment",
        isActive: "ACTIVE",
        links: [
          {
            id: "Nasabah",
            linkSource: "http://192.168.239.230:443/login",
          },
          {
            id: "BankLine",
            linkSource: "http://192.168.239.230:3000/login",
          },
        ],
        accounts: [
          {
            id: "1",
            accountName: "Admin Account",
            accountDesc: "Administrator account for managing the app.",
          },
        ],
      },
    ],
  },
  {
    id: "5",
    appCode: "CMS05",
    appShortName: "CMS",
    appName: "Cash Management System (CMS)",
    appDesc: "Akan ditutup tanggal 16 Oktober 2024",
    note: "In the middle of every difficulty lies opportunity. — Albert Einstein",
    iconApps: null,
    appsStatus: "INACTIVE",
    readyToLaunch: "0",
    environment: [
      {
        id: "1",
        envName: "PROD",
        envDesc: "Production Environment",
        isActive: "INACTIVE",
        links: [
          {
            id: "Nasabah",
            linkSource: "https://192.168.202.85/login",
          },
          {
            id: "BankLine",
            linkSource: "https://192.168.202.85/login",
          },
        ],
        accounts: [
          {
            id: "1",
            accountName: "Admin Account",
            accountDesc: "Administrator account for managing the app.",
          },
        ],
      },
    ],
  },
];
