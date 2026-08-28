import { defineStore } from "pinia";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { swimwearService } from "../services/swimwearService";
import { ref, toRaw, watchEffect } from "vue";
import { useToast } from "../../shared/composables/useToast";
import type { CreateSwimwearScoreParams, SwimwearScoreErrorResponse } from "../types/swimwear/types";
import type { AxiosError } from "axios";
import { appErrorHandler } from "../../errors/appErrorHandler";
import type { CandidateTeamOptions } from "../types/talent/types";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useLocalStorage } from "@vueuse/core";

export const useSwimwearStore = defineStore("swimwearScore", () => {
    const { toast } = useToast()

    const { setLoading } = useLoadingStore()
    const { setError } = useGlobalErrorSetter()

    type ScoreFields = {
        candidateId: string | null;
        candidateNumber: string | null;
        candidateName: string | null;
        candidateTeam: Capitalize<CandidateTeamOptions>;
        stage_presence: number,
        figure_and_fitness: number
        poise_and_bearing: number
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
    const maleCandidateInputs = useLocalStorage<ScoreFields[]>("male-swimwear-scores", []);
    const femaleCandidateInputs = useLocalStorage<ScoreFields[]>("female-swimwear-scores", []);

    const maleEnabled = ref(false)
    const getMaleCandidates = useQuery({
        queryKey: ["maleCandidatesSwimwearScoreFeat"],
        queryFn: () => swimwearService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "male")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: maleEnabled
    });
    const refetchMaleSwimwearFeat = () => getMaleCandidates.refetch()


    const femaleEnabled = ref(false)
    const getFemaleCandidates = useQuery({
        queryKey: ["femaleCandidatesSwimwearScoreFeat"],
        queryFn: () => swimwearService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "female")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: femaleEnabled
    });
    const refetchFemaleSwimwearFeat = () => getFemaleCandidates.refetch()

    const createSwimwearScoreMaleMutation = useMutation({
        mutationFn: async (data: CreateSwimwearScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                swimwearService.createSwimwearcore(
                    {
                        cand_id: d.cand_id,
                        stage_presence: d.stage_presence,
                        figure_and_fitness: d.figure_and_fitness,
                        poise_and_bearing: d.poise_and_bearing,
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
            setSubmitted(true, "male-swimwear-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<SwimwearScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Male swimwear scores have been restored. Please try again.");
            }
        }
    })

    const createSwimwearScoreMale = (data: CreateSwimwearScoreParams[]) => createSwimwearScoreMaleMutation.mutateAsync(data)


    const createSwimwearScoreFemaleMutation = useMutation({
        mutationFn: async (data: CreateSwimwearScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                swimwearService.createSwimwearcore(
                    {
                        cand_id: d.cand_id,
                        stage_presence: d.stage_presence,
                        figure_and_fitness: d.figure_and_fitness,
                        poise_and_bearing: d.poise_and_bearing,
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
            setSubmitted(true, "female-swimwear-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<SwimwearScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Female swimwear scores have been restored. Please try again.");
            }
        }
    })
    const createSwimwearScoreFemale = (data: CreateSwimwearScoreParams[]) => createSwimwearScoreFemaleMutation.mutateAsync(data)

    watchEffect(() => {
        setLoading("swimwearCandidates", "maleInitialFetching", getMaleCandidates.isPending.value || getMaleCandidates.isLoading.value)
        setLoading("swimwearCandidates", "maleFetchRefresh", getMaleCandidates.isFetching.value)
        setLoading("swimwearCandidates", "femaleInitialFetching", getFemaleCandidates.isPending.value || getFemaleCandidates.isLoading.value)
        setLoading("swimwearCandidates", "femaleFetchRefresh", getFemaleCandidates.isFetching.value)

        setLoading("swimwearCandidates", "createMaleSwimwearScore", createSwimwearScoreMaleMutation.isPending.value)
        setLoading("swimwearCandidates", "createFemaleSwimwearScore", createSwimwearScoreFemaleMutation.isPending.value)

        if (getMaleCandidates.data.value) {
            setError("swimwearCandidates", "maleFetchOffline", false)
            setError("swimwearCandidates", "maleFetchServerError", false)
        }
        if (getFemaleCandidates.data.value) {
            setError("swimwearCandidates", "femaleFetchOffline", false)
            setError("swimwearCandidates", "femaleFetchServerError", false)
        }
    })

    watchEffect(() => {
        if (getMaleCandidates.isError.value) {
            const maleError = getMaleCandidates.error.value as AxiosError<SwimwearScoreErrorResponse>
            if (maleError) {
                const { type, } = appErrorHandler(maleError)
                if (type === "offline") { setError("swimwearCandidates", "maleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("swimwearCandidates", "maleFetchServerError", true)
                }
            }

        }

        if (getFemaleCandidates.isError.value) {
            const femaleError = getFemaleCandidates.error.value as AxiosError<SwimwearScoreErrorResponse>
            if (femaleError) {
                const { type, } = appErrorHandler(femaleError)
                if (type === "offline") { setError("swimwearCandidates", "femaleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("swimwearCandidates", "femaleFetchServerError", true)
                }
            }
        }

    })

    return {
        getMaleCandidates,
        getFemaleCandidates,
        refetchMaleSwimwearFeat,
        refetchFemaleSwimwearFeat,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        createSwimwearScoreMale, createSwimwearScoreFemale, submissions,
        setSubmitted,
        isSubmitted,
    }
})