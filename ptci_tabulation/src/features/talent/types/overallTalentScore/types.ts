
export type OverallTalentScore= {
    cand_id: string,
    cand_number: string,
    cand_name: string,
    cand_team: TeamOptions,
    cand_gender: string
    talent_final_score: string,
    created_at: string
    updated_at: string
}[]

export type TeamOptions = "black" | "white" | "purple" | "green" | "red"


export type OverallTalentScoreResponseDTO = {
    status: number
    message: string,
    data: OverallTalentScore
}

export type OverallTalentScoreErrorResponse = {
    status: number
    message: string
}