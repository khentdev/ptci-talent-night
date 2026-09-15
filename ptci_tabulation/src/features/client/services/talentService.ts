import axiosInstance from "../../../core/API/axiosConfig";
import type { GetCandidatesDTO } from "../../settings/types/candidates";
import { GetTypedResponse } from "../../shared/types/typedResponse";
import type { CreateTalentScoreBatchResponse, CreateTalentScoreParams, CreateTalentScoreResponse, GetMyTalentScoresResponse } from "../types/talent/types";

export const talentService = {
    getCandidates: async () => {
        const res = await axiosInstance.get("/contestants")
        return GetTypedResponse<GetCandidatesDTO>(res)
    },

    createTalentScore: async (data: CreateTalentScoreParams) => {
        const res = await axiosInstance.post("/scores/talent", data)
        return GetTypedResponse<CreateTalentScoreResponse>(res)
    },

    createTalentScoreBatch: async (data: CreateTalentScoreParams[]) => {
        const res = await axiosInstance.post("/scores/talent/batch", data)
        return GetTypedResponse<CreateTalentScoreBatchResponse>(res)
    },

    getMyTalentScores: async (gender: "male" | "female") => {
        const res = await axiosInstance.get(`/scores/talent/mine?gender=${gender}`)
        return GetTypedResponse<GetMyTalentScoresResponse>(res)
    },

}
