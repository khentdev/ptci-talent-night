import axiosInstance from "../../../core/API/axiosConfig";
import { GetTypedResponse } from "../../shared/types/typedResponse";
import type { LoginResponseDTO, LoginParams, CheckSessionResponseDTO, MarkUserAsSubmittedResponseDTO } from "../types/types";


export const authService = {
    loginUser: async ({ username, password }: LoginParams): Promise<LoginResponseDTO> => {
        const res = await axiosInstance.post("/auth/login", { username, password })
        return GetTypedResponse<LoginResponseDTO>(res)
    },
    checkSession: async () => {
        const res = await axiosInstance.post("/auth/check-session", undefined, { timeout: 20000 })
        return GetTypedResponse<CheckSessionResponseDTO>(res)
    },
    logoutUser: async () => {
        const res = await axiosInstance.post("/auth/logout")
        return GetTypedResponse<{ status: number, loggedIn: boolean, message: string }>(res)
    },
    markUserAsSubmitted: async () => {
        const res = await axiosInstance.put("/auth/has-submitted")
        return GetTypedResponse<MarkUserAsSubmittedResponseDTO>(res)
    }
}

