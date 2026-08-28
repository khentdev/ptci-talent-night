import axiosInstance from "../../../core/API/axiosConfig";
import type { GetCandidatesDTO } from "../../settings/types/candidates";
import { GetTypedResponse } from "../../shared/types/typedResponse";
import type { CreateUniformScoreDTO, CreateUniformScoreParams } from "../types/uniform/types";

export const uniformService = {
    getCandidates: async () => {
        const res = await axiosInstance.get("/contestants")
        return GetTypedResponse<GetCandidatesDTO>(res)
    },
    createUniformScore: async (data: CreateUniformScoreParams) => {
        const res = await axiosInstance.post("/scores/uniform", data)
        return GetTypedResponse<CreateUniformScoreDTO>(res)
    }
}
