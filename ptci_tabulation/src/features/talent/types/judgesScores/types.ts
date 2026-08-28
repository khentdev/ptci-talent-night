
export type JudgesScores = {
    score_id: string;
    cand_id: string;
    cand_number: string;
    cand_name: string;
    cand_team: CandidateTeamOptions;
    cand_gender: "male" | "female";
    judge_id: string;
    mastery: string;
    performance_choreography: string;
    overall_impression: string;
    audience_impact: string;
    total_score: string;
}

export type CandidateTeamOptions = "red" | "yellow" | "green" | "purple" | "blue"

export type JudgesScoresData = {
    [judgeId: string]: JudgesScores[]
}
export type JudgeScoresMalesResponse = {
    status: number;
    message: string;
    data: JudgesScoresData
}

export type JudgeScoresFemalesResponse = JudgeScoresMalesResponse

export type JudgesTalentScoresErrorResponse = {
    status: number
    message: string
}