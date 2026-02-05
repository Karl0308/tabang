import axios from "axios";

// Note: This endpoint should be moved to environment configuration
const BASE_URLx = "https://localhost:42429/StockValuationReport";

const api = axios.create({
  baseURL: BASE_URLx,
  headers: {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
});

export default api;
