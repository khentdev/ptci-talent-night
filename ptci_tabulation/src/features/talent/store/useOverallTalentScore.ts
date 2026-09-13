import { defineStore } from "pinia";
import { overallTalentScoreService } from "../services/overallTalentScoreService";
import { useQuery } from "@tanstack/vue-query";
import { reactive, readonly, ref, watchEffect } from "vue";
import type { AxiosError } from "axios";
import type { OverallTalentScoreErrorResponse } from "../types/overallTalentScore/types";
import { appErrorHandler } from "../../errors/appErrorHandler";
export const useOverallTalentScore = defineStore("overallTalentScore", () => {

    const maleEnabled = ref(false)
    const getOverallScoreMale = useQuery({
        queryKey: ["overallScoreMale"],
        queryFn: () => overallTalentScoreService.getOverallScoreMale(),
        staleTime: 15 * 60 * 1000,
        gcTime: 15 * 60 * 1000,
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
        staleTime: 5 * 60 * 1000,
        gcTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data,
        enabled: femaleEnabled
    })
    const refetchOverallScoreFemale = () => { getOverallScoreFemale.refetch() }

    const maleError = reactive({ serverError: false, offline: false })
    const femaleError = reactive({ serverError: false, offline: false })

    watchEffect(() => {
        if (getOverallScoreMale.isError.value) {
            const error = getOverallScoreMale.error.value as AxiosError<OverallTalentScoreErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                maleError.offline = type === "offline"
                maleError.serverError = type === "serverError" || type === "unreachable" || type === "requestTimeout"
            }
        } else if (getOverallScoreMale.data.value) {
            maleError.offline = false
            maleError.serverError = false
        }
    })

    watchEffect(() => {
        if (getOverallScoreFemale.isError.value) {
            const error = getOverallScoreFemale.error.value as AxiosError<OverallTalentScoreErrorResponse>
            if (error) {
                const { type } = appErrorHandler(error)
                femaleError.offline = type === "offline"
                femaleError.serverError = type === "serverError" || type === "unreachable" || type === "requestTimeout"
            }
        } else if (getOverallScoreFemale.data.value) {
            femaleError.offline = false
            femaleError.serverError = false
        }
    })

    return {
        getOverallScoreMale, getOverallScoreFemale,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        refetchOverallScoreMale, refetchOverallScoreFemale,
        maleError: readonly(maleError),
        femaleError: readonly(femaleError)
    }

})
