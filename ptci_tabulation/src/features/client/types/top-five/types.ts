import type { CandidateTeamOptions } from "../talent/types"

export type CreateTopFiveScoreParams = {
    cand_id: number,
    qna: number,
    beauty: number
}
export type GetTopFiveScore = {
    cand_id: string,
    cand_number: string,
    cand_name: string,
    cand_team: CandidateTeamOptions,
    cand_gender: string,
    total_score: string
}[]

export type GetTopFiveScoreDTO = {
    status: number;
    message: string
    data: GetTopFiveScore
}

export type CreateTopFiveScoreDTO = {
    status: number; message: string; has_submitted: boolean

}

export type TopFiveScoreErrorResponse = {
    status: number;
    message: string
}