import { defineStore } from "pinia";
import { useQuery } from "@tanstack/vue-query"
import { ref, watchEffect } from "vue";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { uniformScoresService } from "../services/uniformScores";
import type { AxiosError } from "axios";
import type { UniformScoresErrorResponse } from "../types/uniformScore";
import { appErrorHandler } from "../../errors/appErrorHandler";

export const useUniformScores = defineStore("uniformScores", () => {

    const { setLoading } = useLoadingStore()
    const { setError } = useGlobalErrorSetter()


    const maleEnabled = ref(false)
    const getMaleUniformScores = useQuery({
        queryKey: ["uniformScoresMale"],
        queryFn: () => uniformScoresService.getUniformScores(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        refetchOnWindowFocus: false,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (d) => d.data.filter(c => c.cand_gender === "male").sort((a, b) => Number(b.total_score ?? 0) - Number(a.total_score ?? 0)),
        enabled: maleEnabled
    })

    const refetchGetMaleUniformScores = () => { getMaleUniformScores.refetch(); maleEnabled.value = true }

    const femaleEnabled = ref(false)
    const getFemaleUniformScores = useQuery({
        queryKey: ["uniformScoresFemale"],
        queryFn: () => uniformScoresService.getUniformScores(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        refetchOnWindowFocus: false,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (d) => d.data.filter(c => c.cand_gender === "female").sort((a, b) => Number(b.total_score) - Number(a.total_score)),
        enabled: femaleEnabled
    })
    const refetchGetFemaleUniformScores = () => { getFemaleUniformScores.refetch(); femaleEnabled.value = true }


    watchEffect(() => {
        setLoading("uniformScoresMale", "initialFetching", getMaleUniformScores.isPending.value || getMaleUniformScores.isLoading.value)
        setLoading("uniformScoresMale", "fetchRefresh", getMaleUniformScores.isFetching.value)

        setLoading("uniformScoresFemale", "initialFetching", getFemaleUniformScores.isPending.value || getFemaleUniformScores.isLoading.value)
        setLoading("uniformScoresFemale", "fetchRefresh", getFemaleUniformScores.isFetching.value)
    })

    watchEffect(() => {
        if (getMaleUniformScores.isError.value) {
            const error = getMaleUniformScores.error.value as AxiosError<UniformScoresErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                if (type === "offline") { setError("uniformScoreMale", "fetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("uniformScoreMale", "fetchServerError", true)
                }
            }
        }
        if (getFemaleUniformScores.isError.value) {
            const error = getFemaleUniformScores.error.value as AxiosError<UniformScoresErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                if (type === "offline") { setError("uniformScoreFemale", "fetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("uniformScoreFemale", "fetchServerError", true)
                }
            }
        }
    })

    return {
        getMaleUniformScores,
        getFemaleUniformScores,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        refetchGetMaleUniformScores,
        refetchGetFemaleUniformScores
    }
})