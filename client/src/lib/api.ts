import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add source=web to all requests
api.interceptors.request.use((config) => {
  if (!config.params) {
    config.params = {};
  }
  config.params.source = "web";
  return config;
});

// Unwrap ApiResponse envelopes so consumers get raw data
api.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (
      payload &&
      typeof payload === "object" &&
      "data" in payload &&
      ("statusCode" in payload || "success" in payload)
    ) {
      const { data, statusCode, message, success } = payload as {
        data: unknown;
        statusCode?: number;
        message?: string;
        success?: boolean;
      };

      response.data = data;
      const enrichedResponse = response as typeof response & {
        meta?: { statusCode?: number; message?: string; success?: boolean };
      };
      enrichedResponse.meta = { statusCode, message, success };
    }
    return response;
  },
  (error) => Promise.reject(error)
);

// Helper for multipart/form-data requests
type FormValue = string | number | boolean | File | Blob | Date | null | undefined;

export const createFormData = (data: Record<string, FormValue>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (value instanceof File) {
        formData.append("file", value);
      } else {
        formData.append(key, value.toString());
      }
    }
  });
  return formData;
};
