import { defineStore } from "pinia";
import { overallTalentScoreService } from "../services/overallTalentScoreService";
import { useQuery } from "@tanstack/vue-query";
import { ref, watchEffect } from "vue";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import type { AxiosError } from "axios";
import type { OverallTalentScoreErrorResponse } from "../types/overallTalentScore/types";
import { appErrorHandler } from "../../errors/appErrorHandler";
export const useOverallTalentScore = defineStore("talentStore", () => {

    const { setLoading } = useLoadingStore()
    const { setError } = useGlobalErrorSetter()

    const maleEnabled = ref(false)
    const getOverallScoreMale = useQuery({
        queryKey: ["overallScoreMale"],
        queryFn: () => overallTalentScoreService.getOverallScoreMale(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data,
        enabled: maleEnabled
    })

    const refetchOverallScoreMale = () => { getOverallScoreMale.refetch() }

    const femaleEnabled = ref(false)
    const getOverallScoreFemale = useQuery({
        queryKey: ["overallScoreFemale"],
        queryFn: () => overallTalentScoreService.getOverallScoreFemale(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data,
        enabled: femaleEnabled
    })
    const refetchOverallScoreFemale = () => { getOverallScoreFemale.refetch() }




    watchEffect(() => {
        setLoading("overallTalentScoreMale", "initialFetch", getOverallScoreMale.isPending.value || getOverallScoreMale.isLoading.value)
        setLoading("overallTalentScoreMale", "fetchRefresh", getOverallScoreMale.isPending.value)

        setLoading("overallTalentScoreFemale", "initialFetch", getOverallScoreFemale.isPending.value || getOverallScoreFemale.isLoading.value)
        setLoading("overallTalentScoreFemale", "fetchRefresh", getOverallScoreFemale.isPending.value)
    })


    watchEffect(() => {
        if (getOverallScoreMale.isError.value) {
            const error = getOverallScoreMale.error.value as AxiosError<OverallTalentScoreErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                if (type === "offline") { setError("overallScoreMale", "fetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("overallScoreMale", "fetchServerError", true)
                }
            }
        }
        if (getOverallScoreFemale.isError.value) {
            const error = getOverallScoreMale.error.value as AxiosError<OverallTalentScoreErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                if (type === "offline") { setError("overallScoreFemale", "fetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("overallScoreFemale", "fetchServerError", true)
                }
            }
        }
    })

    return {
        getOverallScoreMale, getOverallScoreFemale,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        refetchOverallScoreMale, refetchOverallScoreFemale
    }

})