export type CreateProductionScoreParams = {
    cand_id: number,
    choreography: number,
    projection: number
    audience_impact: number
}

export type CreateProductionScoreDTO = {
    status: number; message: string;
    score_id: number; total_score: string
}

export type ProductionScoreErrorResponse = {
    status: number;
    message: string
}