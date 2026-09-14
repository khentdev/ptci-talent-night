import type { RolesOption } from "../../auth/types/types"

export type AccountRole = RolesOption

export type AccountData = {
    id: string,
    username: string,
    role: AccountRole,
    has_submitted: boolean,
    is_active: boolean,
    created_at: string
}

export type GetAccountsDTO = {
    status: number,
    message: string,
    data: AccountData[]
}

export type AccountMutationDTO = {
    status: string,
    message: string,
    data?: AccountData
}

export type CreateAccountParams = {
    username: string,
    password: string,
    role: AccountRole
}

export type ResetPasswordParams = {
    id: string,
    password: string
}

export type AccountIdParams = { id: string }

export type SetAccountActiveParams = {
    id: string,
    is_active: boolean
}

export type AccountErrorResponse = {
    status: number,
    message: string
}
export type AccountFormErrors = {
    general: string
}
