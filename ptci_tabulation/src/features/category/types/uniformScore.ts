export type UniformScores = {
    score_id: string
    cand_id: string,
    cand_number: string
    cand_name: string,
    cand_team: CandidateTeamOptions
    cand_gender: "male" | "female"
    poise_and_bearings: string,
    personality_and_projection: string,
    neatness: string,
    overall_impact: string,
    total_score: string
}[]
export type CandidateTeamOptions = "red" | "yellow" | "green" | "purple" | "blue"
export type UniformScoresResponseDTO = {
    stats: number
    message: string,
    data: UniformScores
}

export type UniformScoresErrorResponse = {
    status: number
    message: string
}