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
export type CandidateTeamOptions = "black" | "white" | "purple" | "green" | "red"


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

export type CreateTalentScoreBatchResponse = TalentFeatErrorResponse & {
    results: { cand_id: number, score_id: number, total_score: string }[],
    has_submitted: boolean
}

export type MyTalentScoreDTO = {
    score_id: string,
    cand_id: string,
    cand_number: string,
    cand_name: string,
    cand_team: CandidateTeamOptions,
    cand_gender: GenderOptions,
    judge_id: string,
    mastery: string,
    performance_choreography: string,
    overall_impression: string,
    audience_impact: string,
    total_score: string
}

export type GetMyTalentScoresResponse = {
    status: number,
    message: string,
    data: MyTalentScoreDTO[]
}
