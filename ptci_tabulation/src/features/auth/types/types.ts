

// Backend: api-backend (Fastify) - POST /api/auth/login

export type MarkUserAsSubmittedResponseDTO = {
    status: string,
    message: string,
    has_submitted: boolean
}
export type LoginResponseDTO = {
    status: number,
    loggedIn: boolean,
    user: UserData
    redirect: string,
}
export type LoginErrorResponse = {
    status: number,
    message: string
}
export type RolesOption = "admin" | "judge"

export type LoginParams = {
    username: string,
    password: string
}

export type UserData = {
    id: string,
    username: string,
    role: RolesOption,
    has_submitted: boolean
}


export type CheckSessionResponseDTO = Omit<LoginResponseDTO, "redirect">
