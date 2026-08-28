export type GetCandidatesDTO = {
    status: number,
    message: string,
    data: CandidatesData[]
}
export type CreateCandidateDTO = {
    status: string, message: string
}
export type CreateCandidateParams = {
    cand_number: string,
    cand_name: string,
    cand_team: CandidateTeamOptions,
    cand_gender: GenderOptions,
}

export type UpdateCandidateParams = {
    cand_id: string
} & CreateCandidateParams

export type UpdateCandidateDTO = CreateCandidateDTO

export type DeleteCandidateParams = { id: string }
export type DeleteCandidateDTO = {
    status: string,
    message: string
}


export type CandidatesData = {
    cand_id: string,
    cand_number: string
    cand_name: string,
    cand_team: CandidateTeamOptions,
    cand_gender: GenderOptions,
    created_at: string
}

export type CandidateErrorResponse = {
    status: number,
    message: string
}
export type CandidateFormErrors = {
    general: string
}

export type GenderOptions = "male" | "female" | "other";
export type CandidateTeamOptions = "red" | "yellow" | "green" | "purple" | "blue"
