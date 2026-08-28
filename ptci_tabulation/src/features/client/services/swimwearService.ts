import axiosInstance from "../../../core/API/axiosConfig";
import type { GetCandidatesDTO } from "../../settings/types/candidates";
import { GetTypedResponse } from "../../shared/types/typedResponse";
import type { CreateSwimwearScoreDTO, CreateSwimwearScoreParams } from "../types/swimwear/types";

export const swimwearService = {
    getCandidates: async () => {
        const res = await axiosInstance.get("/contestants")
        return GetTypedResponse<GetCandidatesDTO>(res)
    },
    createSwimwearcore: async (data: CreateSwimwearScoreParams) => {
        const res = await axiosInstance.post("/scores/swimwear", data)
        return GetTypedResponse<CreateSwimwearScoreDTO>(res)
    }
}
