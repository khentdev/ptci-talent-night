export type CreateSwimwearScoreParams = {
    cand_id: number,
    stage_presence: number,
    figure_and_fitness: number
    poise_and_bearing: number
    overall_impact: number
}

export type CreateSwimwearScoreDTO = {
    status: number; message: string;

}

export type SwimwearScoreErrorResponse = {
    status: number;
    message: string
}