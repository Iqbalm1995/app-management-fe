"use client";

import { useState } from "react";
import { ApiGenericResponse, PaggingListPayload } from "../types/masterTypes";
import { buildUrlPort } from "../helper/MasterHelper";
import {
  ENDPOINT_API_BASEURL,
  ENDPOINT_PORT_BASIC,
  RES_CODE_SERVER_ERROR,
} from "../constants/applicationConstants";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import handleAxiosError from "../utils/handleAxiosError";
import {
  TimelineSimulation,
  TimelineSimulationListItem,
  TimelineSimulationSavePayload,
} from "../(pages)/timeline-simulation/types";

/*
 * Timeline Simulation persistence service.
 *
 * NOTE: backend endpoints are not yet finalized. The paths below use the
 * repo's `/v1/{Resource}/...` convention as placeholders and are the only
 * thing that needs updating once the backend contract is confirmed. Method
 * signatures, payloads and error handling all follow the canonical service
 * hook pattern (see useOrganization.ts).
 */

interface useTimelineSimulationServices {
  Save: (
    payload: TimelineSimulationSavePayload,
    token: string
  ) => Promise<ApiGenericResponse<TimelineSimulation | null> | null>;
  GetById: (
    id: string,
    token: string
  ) => Promise<ApiGenericResponse<TimelineSimulation | null> | null>;
  List: (
    payload: PaggingListPayload,
    token: string
  ) => Promise<ApiGenericResponse<TimelineSimulationListItem[] | null> | null>;

  isLoading: boolean;
  error: string | null;
}

const useTimelineSimulation = (): useTimelineSimulationServices => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const Save = async (
    payload: TimelineSimulationSavePayload,
    token: string
  ): Promise<ApiGenericResponse<TimelineSimulation | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/TimelineSimulation/save";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<TimelineSimulation>
      >(`${UrlEndpoint}${PathEndpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred while saving the simulation."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to api",
          error: null,
        };
      }
    }
  };

  const GetById = async (
    id: string,
    token: string
  ): Promise<ApiGenericResponse<TimelineSimulation | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = `/v1/TimelineSimulation/${id}`;
    try {
      const response = await axiosInstance.get<
        ApiGenericResponse<TimelineSimulation>
      >(`${UrlEndpoint}${PathEndpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred while loading the simulation."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to api",
          error: null,
        };
      }
    }
  };

  const List = async (
    payload: PaggingListPayload,
    token: string
  ): Promise<ApiGenericResponse<TimelineSimulationListItem[] | null> | null> => {
    setIsLoading(true);
    setError(null);
    const UrlEndpoint: string = buildUrlPort(
      ENDPOINT_API_BASEURL,
      ENDPOINT_PORT_BASIC
    );
    const PathEndpoint: string = "/v1/TimelineSimulation/list";
    try {
      const response = await axiosInstance.post<
        ApiGenericResponse<TimelineSimulationListItem[]>
      >(`${UrlEndpoint}${PathEndpoint}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setIsLoading(false);
      return response.data;
    } catch (err) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorResponse = handleAxiosError(err);
        setError(
          err.response?.data?.message ||
            "An error occurred while listing simulations."
        );
        return errorResponse;
      } else {
        setError("An unknown error occurred. Please try again.");
        return {
          statusCode: RES_CODE_SERVER_ERROR,
          data: null,
          message: "Error connect to api",
          error: null,
        };
      }
    }
  };

  return {
    Save,
    GetById,
    List,
    isLoading,
    error,
  };
};

export default useTimelineSimulation;
