export type GetCandidatesTalentFeatDTO = {
    status: number,
    message: string,
    data: CandidatesDataTalentFeat[]
}

export type CandidatesDataTalentFeat = {
    cand_id: string,
    cand_number: string
    cand_name: string,
    cand_team: CandidateTeamOptions,
    cand_gender: GenderOptions,
    created_at: string
}
export type GenderOptions = "male" | "female" | "other";
export type CandidateTeamOptions = "red" | "yellow" | "green" | "purple" | "blue"


export type TalentFeatErrorResponse = {
    status: number
    message: string

}

export type CreateTalentScoreResponse = TalentFeatErrorResponse & { has_submitted: boolean }
export type CreateTalentScoreParams = {
    cand_id: number,
    mastery: number,
    performance_choreography: number,
    overall_impression: number,
    audience_impact: number
}
