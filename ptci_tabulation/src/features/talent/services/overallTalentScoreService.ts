import axiosInstance from "../../../core/API/axiosConfig";
import type { OverallTalentScoreResponseDTO } from "../types/overallTalentScore/types";
import { GetTypedResponse } from "../../shared/types/typedResponse";
export const overallTalentScoreService = {
    getOverallScoreMale: async () => {
        const res = await axiosInstance.get("/scores/talent/final?gender=male")
        return GetTypedResponse<OverallTalentScoreResponseDTO>(res)
    },
    getOverallScoreFemale: async () => {
        const res = await axiosInstance.get("/scores/talent/final?gender=female")
        return GetTypedResponse<OverallTalentScoreResponseDTO>(res)
    }
}