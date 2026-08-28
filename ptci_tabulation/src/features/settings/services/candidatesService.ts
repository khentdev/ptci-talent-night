import axiosInstance from '../../../core/API/axiosConfig';
import { GetTypedResponse } from '../../shared/types/typedResponse';

import type { UpdateCandidateDTO, CreateCandidateDTO, CreateCandidateParams, GetCandidatesDTO, UpdateCandidateParams, DeleteCandidateDTO } from "../types/candidates";

export const candidatesService = {
    getCandidates: async () => {
        const res = await axiosInstance.get("/contestants")
        return GetTypedResponse<GetCandidatesDTO>(res)
    },
    createCandidate: async (data: CreateCandidateParams) => {
        const res = await axiosInstance.post("/contestants", { ...data })
        return GetTypedResponse<CreateCandidateDTO>(res)
    },
    updateCandidate: async (data: UpdateCandidateParams) => {
        const res = await axiosInstance.put(`/contestants/${data.cand_id}`, { ...data })
        return GetTypedResponse<UpdateCandidateDTO>(res)
    },
    deleteCandidate: async ({ id }: { id: string }) => {
        const res = await axiosInstance.delete(`/contestants/${id}`);
        return GetTypedResponse<DeleteCandidateDTO>(res);
    }
}