import axiosInstance from '../../../core/API/axiosConfig';
import { GetTypedResponse } from '../../shared/types/typedResponse';

import type { AccountIdParams, AccountMutationDTO, AccountRole, CreateAccountParams, GetAccountsDTO, ResetPasswordParams, SetAccountActiveParams } from "../types/accounts";

export const accountsService = {
    getAccounts: async (role: AccountRole) => {
        const res = await axiosInstance.get("/users", { params: { role } })
        return GetTypedResponse<GetAccountsDTO>(res)
    },
    createAccount: async (data: CreateAccountParams) => {
        const res = await axiosInstance.post("/users", { ...data })
        return GetTypedResponse<AccountMutationDTO>(res)
    },
    resetPassword: async ({ id, password }: ResetPasswordParams) => {
        const res = await axiosInstance.put(`/users/${id}/password`, { password })
        return GetTypedResponse<AccountMutationDTO>(res)
    },
    resetSubmission: async ({ id }: AccountIdParams) => {
        const res = await axiosInstance.put(`/users/${id}/reset-submission`)
        return GetTypedResponse<AccountMutationDTO>(res)
    },
    setActive: async ({ id, is_active }: SetAccountActiveParams) => {
        const res = await axiosInstance.put(`/users/${id}/active`, { is_active })
        return GetTypedResponse<AccountMutationDTO>(res)
    },
    deleteAccount: async ({ id }: AccountIdParams) => {
        const res = await axiosInstance.delete(`/users/${id}`)
        return GetTypedResponse<AccountMutationDTO>(res)
    }
}
