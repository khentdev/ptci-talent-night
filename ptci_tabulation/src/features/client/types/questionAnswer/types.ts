export type CreateQuestionAnswerScoreParams = {
    cand_id: number,
    total_score: number

}

export type CreateQuestionAnswerScoreDTO = {
    status: number; message: string;
}

export type QuestionAnswerScoreErrorResponse = {
    status: number;
    message: string
}