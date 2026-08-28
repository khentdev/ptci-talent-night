export type CreateUniformScoreParams = {
    cand_id: number,
    poise_and_bearings: number,
    personality_and_projection: number
    neatness: number
    overall_impact: number
}

export type CreateUniformScoreDTO = {
    status: number; message: string;
    score_id: number; total_score: string
}

export type UniformScoreErrorResponse = {
    status: number;
    message: string
}