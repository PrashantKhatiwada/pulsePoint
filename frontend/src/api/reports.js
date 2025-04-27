import axios from "axios";

// API base URL - change this to your backend URL
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch all crisis reports
 */
export const fetchReports = async () => {
  try {
    const response = await api.get("/reports");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

/**
 * Create a new crisis report
 */
export const createReport = async (reportData) => {
  try {
    const response = await api.post("/report", reportData);
    return response.data.data;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

/**
 * Get a single report by ID
 */
export const getReportById = async (id) => {
  try {
    const response = await api.get(`/report/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    throw error;
  }
};

/**
 * Update a report's status
 */
export const updateReportStatus = async (id, status) => {
  try {
    const response = await api.put(`/report/${id}`, { status });
    return response.data.data;
  } catch (error) {
    console.error(`Error updating report ${id}:`, error);
    throw error;
  }
};
