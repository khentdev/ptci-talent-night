import { defineStore } from "pinia";
import { judgesScoresService } from "../services/judgesScoresService";
import { useQuery } from "@tanstack/vue-query";
import { reactive, readonly, ref, watchEffect } from "vue";
import type { AxiosError } from "axios";
import type { JudgesTalentScoresErrorResponse } from "../types/judgesScores/types";
import { appErrorHandler } from "../../errors/appErrorHandler";

export const useJudgesScores = defineStore("judgesScore", () => {

    const maleEnabled = ref(false)
    const judgesTalentScoresMales = useQuery({
        queryKey: ["judgesTalentScoresMales"],
        queryFn: () => judgesScoresService.getJudgesScoresMale(),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (d) => d.data,
        enabled: maleEnabled
    })
    const refetchJudgesScoresForMales = () => judgesTalentScoresMales.refetch()

    const femaleEnabled = ref(false)
    const judgesTalentScoresFemales = useQuery({
        queryKey: ["judgesTalentScoresFemales"],
        queryFn: () => judgesScoresService.getJudgesScoresFemale(),
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (d) => d.data,
        enabled: femaleEnabled

    })
    const refetchJudgesScoresForFemales = () => judgesTalentScoresFemales.refetch()

    const maleError = reactive({ serverError: false, offline: false })
    const femaleError = reactive({ serverError: false, offline: false })

    watchEffect(() => {
        if (judgesTalentScoresMales.isError.value) {
            const error = judgesTalentScoresMales.error.value as AxiosError<JudgesTalentScoresErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                maleError.offline = type === "offline"
                maleError.serverError = type === "serverError" || type === "unreachable" || type === "requestTimeout"
            }
        } else if (judgesTalentScoresMales.isSuccess.value) {
            maleError.offline = false
            maleError.serverError = false
        }
    })

    watchEffect(() => {
        if (judgesTalentScoresFemales.isError.value) {
            const error = judgesTalentScoresFemales.error.value as AxiosError<JudgesTalentScoresErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                femaleError.offline = type === "offline"
                femaleError.serverError = type === "serverError" || type === "unreachable" || type === "requestTimeout"
            }
        } else if (judgesTalentScoresFemales.isSuccess.value) {
            femaleError.offline = false
            femaleError.serverError = false
        }
    })

    return {
        judgesTalentScoresMales,
        refetchJudgesScoresForMales,
        judgesTalentScoresFemales,
        refetchJudgesScoresForFemales,
        maleError: readonly(maleError),
        femaleError: readonly(femaleError),
        enableMale: () => maleEnabled.value = true,
        enableFemale: () => femaleEnabled.value = true
    }
})
