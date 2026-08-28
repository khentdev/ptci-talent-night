import axiosInstance from "../../../core/API/axiosConfig";
import type { GetCandidatesDTO } from "../../settings/types/candidates";
import { GetTypedResponse } from "../../shared/types/typedResponse";
import type { CreateFormalScoreDTO, CreateFormalScoreParams } from "../types/formal/types";

export const formalService = {
    getCandidates: async () => {
        const res = await axiosInstance.get("/contestants")
        return GetTypedResponse<GetCandidatesDTO>(res)
    },
    createFormalScore: async (data: CreateFormalScoreParams) => {
        const res = await axiosInstance.post("/scores/formalwear", data)
        return GetTypedResponse<CreateFormalScoreDTO>(res)
    }
}
