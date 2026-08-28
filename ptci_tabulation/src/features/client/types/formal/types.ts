export type CreateFormalScoreParams = {
    cand_id: number,
    poise_and_bearing: number
    "personality/projection": number,
    "appropriateness/ellegance": number,
    overall_impact: number

}

export type CreateFormalScoreDTO = {
    status: number; message: string;

}

export type FormalScoreErrorResponse = {
    status: number;
    message: string
}