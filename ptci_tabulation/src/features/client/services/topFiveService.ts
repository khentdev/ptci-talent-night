import axiosInstance from "../../../core/API/axiosConfig";
import { GetTypedResponse } from "../../shared/types/typedResponse";
import type { CreateTopFiveScoreDTO, CreateTopFiveScoreParams, GetTopFiveScoreDTO } from "../types/top-five/types";

export const topFiveService = {
    getTopFiveCandidates: async () => {
        const res = await axiosInstance.get("/scores/top-five/candidates")
        return GetTypedResponse<GetTopFiveScoreDTO>(res)
    },
    createTopFiveScore: async (data: CreateTopFiveScoreParams) => {
        const res = await axiosInstance.post("/scores/top-five", data)
        return GetTypedResponse<CreateTopFiveScoreDTO>(res)
    }
}
