import { defineStore } from "pinia";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { uniformService } from "../services/uniformService";
import {  ref, toRaw, watchEffect } from "vue";
import { useToast } from "../../shared/composables/useToast";
import type { CreateUniformScoreParams, UniformScoreErrorResponse } from "../types/uniform/types";
import type { AxiosError } from "axios";
import { appErrorHandler } from "../../errors/appErrorHandler";
import type { CandidateTeamOptions } from "../types/talent/types";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useLocalStorage } from "@vueuse/core";

export const useUniformStore = defineStore("uniformScore", () => {
    const { toast } = useToast()

    const { setLoading } = useLoadingStore()
    const { setError } = useGlobalErrorSetter()

    type ScoreFields = {
        candidateId: string | null;
        candidateNumber: string | null;
        candidateName: string | null;
        candidateTeam: Capitalize<CandidateTeamOptions>;
        poise_and_bearings: number,
        personality_and_projection: number
        neatness: number
        overall_impact: number
    }[]
    const submissions = useLocalStorage<Record<string, { submitted: boolean }>>(
        "uniform-submissions",
        {}
    );

    const setSubmitted = (val: boolean, key: string) => {
        submissions.value[key] = { submitted: val };
    };

    const isSubmitted = (key: string) => {
        return submissions.value[key]?.submitted ?? false;
    };
    const maleCandidateInputs = useLocalStorage<ScoreFields[]>("male-uniform-scores", []);
    const femaleCandidateInputs = useLocalStorage<ScoreFields[]>("female-uniform-scores", []);

    const maleEnabled = ref(false)
    const getMaleCandidates = useQuery({
        queryKey: ["maleCandidatesUniformScoreFeat"],
        queryFn: () => uniformService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "male")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: maleEnabled
    });
    const refetchMaleUniformUniformFeat = () => getMaleCandidates.refetch()

    const femaleEnabled = ref(false)
    const getFemaleCandidates = useQuery({
        queryKey: ["femaleCandidatesUniformScoreFeat"],
        queryFn: () => uniformService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "female")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: femaleEnabled
    });
    const refetchFemaleUniformUniformFeat = () => getFemaleCandidates.refetch()

    const createUniformScoreMaleMutation = useMutation({
        mutationFn: async (data: CreateUniformScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                uniformService.createUniformScore(
                    {
                        cand_id: d.cand_id,
                        poise_and_bearings: d.poise_and_bearings,
                        personality_and_projection: d.personality_and_projection,
                        neatness: d.neatness,
                        overall_impact: d.overall_impact
                    })
            ))
            const failures = results.filter(d => d.status === "rejected")
            if (failures.length > 0) throw (failures[0] as PromiseRejectedResult).reason
            return results.filter(d => d.status === "fulfilled").map(v => v.value)
        },
        onMutate: () => {
            const backupScores = structuredClone(toRaw(maleCandidateInputs.value))
            return { backupScores }
        },
        onSuccess: () => {
            setSubmitted(true, "male-uniform-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<UniformScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Male uniform scores have been restored. Please try again.");
            }
        }
    })
    const createUniformScoreMale = (data: CreateUniformScoreParams[]) => createUniformScoreMaleMutation.mutateAsync(data)

    const createUniformScoreFemaleMutation = useMutation({
        mutationFn: async (data: CreateUniformScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                uniformService.createUniformScore(
                    {
                        cand_id: d.cand_id,
                        poise_and_bearings: d.poise_and_bearings,
                        personality_and_projection: d.personality_and_projection,
                        neatness: d.neatness,
                        overall_impact: d.overall_impact
                    })
            ))
            const failures = results.filter(d => d.status === "rejected")
            if (failures.length > 0) throw (failures[0] as PromiseRejectedResult).reason
            return results.filter(d => d.status === "fulfilled").map(v => v.value)
        },
        onMutate: () => {
            const backupScores = structuredClone(toRaw(femaleCandidateInputs.value))
            return { backupScores }
        },
        onSuccess: () => {
            setSubmitted(true, "female-uniform-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<UniformScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Female uniform scores have been restored. Please try again.");
            }
        }
    })
    const createUniformScoreFemale = (data: CreateUniformScoreParams[]) => createUniformScoreFemaleMutation.mutateAsync(data)

    watchEffect(() => {
        setLoading("uniformCandidates", "maleInitialFetching", getMaleCandidates.isPending.value || getMaleCandidates.isLoading.value)
        setLoading("uniformCandidates", "maleFetchRefresh", getMaleCandidates.isFetching.value)
        setLoading("uniformCandidates", "femaleInitialFetching", getFemaleCandidates.isPending.value || getFemaleCandidates.isLoading.value)
        setLoading("uniformCandidates", "femaleFetchRefresh", getFemaleCandidates.isFetching.value)

        setLoading("uniformCandidates", "createMaleUniformScore", createUniformScoreMaleMutation.isPending.value)
        setLoading("uniformCandidates", "createFemaleUniformScore", createUniformScoreFemaleMutation.isPending.value)

        if (getMaleCandidates.data.value) {
            setError("uniformCandidates", "maleFetchOffline", false)
            setError("uniformCandidates", "maleFetchServerError", false)
        }
        if (getFemaleCandidates.data.value) {
            setError("uniformCandidates", "femaleFetchOffline", false)
            setError("uniformCandidates", "femaleFetchServerError", false)
        }
    })

    watchEffect(() => {
        if (getMaleCandidates.isError.value) {
            const maleError = getMaleCandidates.error.value as AxiosError<UniformScoreErrorResponse>
            if (maleError) {
                const { type, } = appErrorHandler(maleError)
                if (type === "offline") { setError("uniformCandidates", "maleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("uniformCandidates", "maleFetchServerError", true)
                }
            }

        }

        if (getFemaleCandidates.isError.value) {
            const femaleError = getFemaleCandidates.error.value as AxiosError<UniformScoreErrorResponse>
            if (femaleError) {
                const { type, } = appErrorHandler(femaleError)
                if (type === "offline") { setError("uniformCandidates", "femaleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("uniformCandidates", "femaleFetchServerError", true)
                }
            }
        }

    })

    return {
        getMaleCandidates,
        getFemaleCandidates,
        refetchMaleUniformUniformFeat,
        refetchFemaleUniformUniformFeat,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        createUniformScoreMale, createUniformScoreFemale, submissions,
        setSubmitted,
        isSubmitted,
    }
})