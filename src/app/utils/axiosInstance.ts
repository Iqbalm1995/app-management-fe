import axios from "axios";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  BASE_PORT_MAIN,
  BASE_URL_MAIN,
} from "../constants/applicationConstants";

const UrlEndpoint: string = buildUrlPort(BASE_URL_MAIN, BASE_PORT_MAIN);

const axiosInstance = axios.create({
  // baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // Base URL from environment variables
  timeout: 120000, // 2 minutes timeout
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": `${UrlEndpoint}`,
  },
});

export default axiosInstance;
