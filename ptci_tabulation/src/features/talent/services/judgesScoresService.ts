import axiosInstance from "../../../core/API/axiosConfig";
import { GetTypedResponse } from "../../shared/types/typedResponse";
import type { JudgeScoresMalesResponse, JudgeScoresFemalesResponse } from "../types/judgesScores/types";


export const judgesScoresService = {
    getJudgesScoresMale: async () => {
        const res = await axiosInstance.get("/scores/talent/judges?gender=male")
        return GetTypedResponse<JudgeScoresMalesResponse>(res)
    },
    getJudgesScoresFemale: async () => {
        const res = await axiosInstance.get("/scores/talent/judges?gender=female")
        return GetTypedResponse<JudgeScoresFemalesResponse>(res)
    },
}