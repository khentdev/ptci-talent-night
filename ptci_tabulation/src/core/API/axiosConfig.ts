import axios from "axios";
import { VITE_API_URL } from "../config/load.env";
import { IS_MOCK_API, installMockApi } from "./mockApi";
const axiosInstance = axios.create({
    baseURL: VITE_API_URL,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true,
})
// Answer every request locally when VITE_MOCK_API=true (no PHP backend needed).
if (IS_MOCK_API) installMockApi(axiosInstance)

export default axiosInstance

