import axios, { GenericAbortSignal, ResponseType } from "axios";
const TIMEOUT = 600000;

const BASE_URL = 'https://api.exei.ai/';
const headers = {
  // 'Content-Type': 'application/json',
  "Access-Control-Allow-Origin": "*",
};

export const getRequest = async (endpoint: string, params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        ...params,
        ...headers,
      },
      withCredentials: true,
      timeout: TIMEOUT,
    });
    return response.data;
  } catch (error) {
    console.error("GET request failed:", error);
    throw error;
  }
};

export const getRequestAdmin = async (endpoint: string, params: any) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      params: {
        limit: params?.limit ? params?.limit?.toString() : "10",
        page: params?.page ? params?.page?.toString() : "0",
      },
      headers: {
        ...params,
        ...headers,
      },
      withCredentials: true,
      timeout: TIMEOUT,
    });
    return response.data;
  } catch (error) {
    console.error("GET request failed:", error);
    throw error;
  }
};

export const postRequest = async (
  endpoint: any,
  data: any,
  headerss = {},
  Signal?: GenericAbortSignal | undefined,
  responseType?: ResponseType | undefined,
) => {
  try {
    const response = await axios.post(`${BASE_URL}${endpoint}`, data, {
      headers: { ...headers, ...headerss },
      signal: Signal,
      withCredentials: true,
      timeout: TIMEOUT,
      responseType: responseType,
    });
    return response.data;
  } catch (error) {
    console.error("POST request failed:", error);
    throw error;
  }
};

export const putRequest = async (
  endpoint: string,
  data: object,
  params = {},
) => {
  try {
    const response = await axios.put(`${BASE_URL}${endpoint}`, data, {
      withCredentials: true,
      timeout: TIMEOUT,
      headers: { ...headers, ...params },
    });

    return response.data;
  } catch (error) {
    console.error("PUT request failed:", error);
    throw error;
  }
};

export const patchRequest = async (
  endpoint: any,
  data: any,
  headerss = {},
  Signal?: any,
) => {
  try {
    const response = await axios.patch(`${BASE_URL}${endpoint}`, data, {
      headers: { ...headers, ...headerss },
      signal: Signal,
      withCredentials: true,
      timeout: TIMEOUT,
    });
    return response.data;
  } catch (error) {
    console.error("PATCH request failed:", error);
    throw error;
  }
};

export const deleteRequest = async (endpoint: string) => {
  try {
    const response = await axios.delete(`${BASE_URL}${endpoint}`, {
      headers: headers,
      withCredentials: true,
      timeout: TIMEOUT,
    });
    return response.data;
  } catch (error) {
    console.error("DELETE request failed:", error);
    throw error;
  }
};
