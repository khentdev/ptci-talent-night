import { defineStore } from "pinia";
import { judgesScoresService } from "../services/judgesScoresService";
import { useQuery } from "@tanstack/vue-query";
import { ref, watchEffect } from "vue";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import type { AxiosError } from "axios";
import type { JudgesTalentScoresErrorResponse } from "../types/judgesScores/types";
import { appErrorHandler } from "../../errors/appErrorHandler";

export const useJudgesScores = defineStore("judgesScore", () => {

    const { setError } = useGlobalErrorSetter()
    const { setLoading } = useLoadingStore()

    const maleEnabled = ref(false)
    const judgesTalentScoresMales = useQuery({
        queryKey: ["judgesTalentScoresMales"],
        queryFn: () => judgesScoresService.getJudgesScoresMale(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
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
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (d) => d.data,
        enabled: femaleEnabled

    })
    const refetchJudgesScoresForFemales = () => judgesTalentScoresFemales.refetch()


    watchEffect(() => {
        setLoading("judgesScoresMale", "initialFetching", judgesTalentScoresMales.isPending.value || judgesTalentScoresMales.isLoading.value)
        setLoading("judgesScoresMale", "fetchRefresh", judgesTalentScoresMales.isFetching.value)
        setLoading("judgesScoresFemale", "initialFetching", judgesTalentScoresFemales.isPending.value || judgesTalentScoresFemales.isLoading.value)
        setLoading("judgesScoresFemale", "fetchRefresh", judgesTalentScoresFemales.isFetching.value)

        if (judgesTalentScoresMales.data.value) {
            setError("judgesScoresMale", "fetchServerError", false)
            setError("judgesScoresMale", "fetchOffline", false)
        }
        if (judgesTalentScoresFemales.data.value) {
            setError("judgesScoresFemale", "fetchServerError", false)
            setError("judgesScoresFemale", "fetchOffline", false)
        }
    })

    watchEffect(() => {
        if (judgesTalentScoresMales.isError.value) {
            const error = judgesTalentScoresMales.error.value as AxiosError<JudgesTalentScoresErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                if (type === "offline") { setError("judgesScoresMale", "fetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("judgesScoresMale", "fetchServerError", true)
                }
            }
        }
        if (judgesTalentScoresFemales.isError.value) {
            const error = judgesTalentScoresFemales.error.value as AxiosError<JudgesTalentScoresErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                if (type === "offline") { setError("judgesScoresFemale", "fetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("judgesScoresFemale", "fetchServerError", true)
                }
            }
        }
    })


    return {
        judgesTalentScoresMales,
        refetchJudgesScoresForMales,
        judgesTalentScoresFemales,
        refetchJudgesScoresForFemales,
        enableMale: () => maleEnabled.value = true,
        enableFemale: () => femaleEnabled.value = true
    }
})