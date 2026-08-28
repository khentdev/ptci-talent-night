import axiosInstance from "../../../core/API/axiosConfig";
import type { GetCandidatesDTO } from "../../settings/types/candidates";
import { GetTypedResponse } from "../../shared/types/typedResponse";
import type { CreateQuestionAnswerScoreDTO, CreateQuestionAnswerScoreParams } from "../types/questionAnswer/types";

export const questionAnswerService = {
    getCandidates: async () => {
        const res = await axiosInstance.get("/contestants")
        return GetTypedResponse<GetCandidatesDTO>(res)
    },
    createQuestionAnswerScore: async (data: CreateQuestionAnswerScoreParams) => {
        const res = await axiosInstance.post("/scores/qna", data)
        return GetTypedResponse<CreateQuestionAnswerScoreDTO>(res)
    }
}
