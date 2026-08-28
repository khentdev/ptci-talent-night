import { defineStore } from "pinia";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { formalService } from "../services/formalService";
import { ref, toRaw, watchEffect } from "vue";
import { useToast } from "../../shared/composables/useToast";
import type { CreateFormalScoreParams, FormalScoreErrorResponse } from "../types/formal/types";
import type { AxiosError } from "axios";
import { appErrorHandler } from "../../errors/appErrorHandler";
import type { CandidateTeamOptions } from "../types/talent/types";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useLocalStorage } from "@vueuse/core";

export const useFormalStore = defineStore("formalScore", () => {
    const { toast } = useToast()

    const { setLoading } = useLoadingStore()
    const { setError } = useGlobalErrorSetter()

    type ScoreFields = {
        candidateId: string | null;
        candidateNumber: string | null;
        candidateName: string | null;
        candidateTeam: Capitalize<CandidateTeamOptions>;
        poise_and_bearing: string,
        "personality/projection": string,
        "appropriateness/ellegance": string,
        overall_impact: string
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
    const maleCandidateInputs = useLocalStorage<ScoreFields[]>("male-formal-scores", []);
    const femaleCandidateInputs = useLocalStorage<ScoreFields[]>("female-formal-scores", []);

    const maleEnabled = ref(false)
    const getMaleCandidates = useQuery({
        queryKey: ["maleCandidatesFormalScoreFeat"],
        queryFn: () => formalService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "male")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: maleEnabled
    });
    const refetchMaleFormalFeat = () => getMaleCandidates.refetch()


    const femaleEnabled = ref(false)
    const getFemaleCandidates = useQuery({
        queryKey: ["femaleCandidatesFormalScoreFeat"],
        queryFn: () => formalService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "female")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: femaleEnabled
    });
    const refetchFemaleFormalFeat = () => getFemaleCandidates.refetch()

    const createFormalScoreMaleMutation = useMutation({
        mutationFn: async (data: CreateFormalScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                formalService.createFormalScore(
                    {
                        cand_id: d.cand_id,
                        poise_and_bearing: d.poise_and_bearing,
                        "personality/projection": d["personality/projection"],
                        "appropriateness/ellegance": d["appropriateness/ellegance"],
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
            setSubmitted(true, "male-formal-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<FormalScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Male formal scores have been restored. Please try again.");
            }
        }
    })

    const createFormalScoreMale = (data: CreateFormalScoreParams[]) => createFormalScoreMaleMutation.mutateAsync(data)


    const createFormalScoreFemaleMutation = useMutation({
        mutationFn: async (data: CreateFormalScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                formalService.createFormalScore(
                    {
                        cand_id: d.cand_id,
                        poise_and_bearing: d.poise_and_bearing,
                        "personality/projection": d["personality/projection"],
                        "appropriateness/ellegance": d["appropriateness/ellegance"],
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
            setSubmitted(true, "female-formal-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<FormalScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Female formal scores have been restored. Please try again.");
            }
        }
    })
    const createFormalScoreFemale = (data: CreateFormalScoreParams[]) => createFormalScoreFemaleMutation.mutateAsync(data)

    watchEffect(() => {
        setLoading("formalCandidates", "maleInitialFetching", getMaleCandidates.isPending.value || getMaleCandidates.isLoading.value)
        setLoading("formalCandidates", "maleFetchRefresh", getMaleCandidates.isFetching.value)
        setLoading("formalCandidates", "femaleInitialFetching", getFemaleCandidates.isPending.value || getFemaleCandidates.isLoading.value)
        setLoading("formalCandidates", "femaleFetchRefresh", getFemaleCandidates.isFetching.value)

        setLoading("formalCandidates", "createMaleFormalScore", createFormalScoreMaleMutation.isPending.value)
        setLoading("formalCandidates", "createFemaleFormalScore", createFormalScoreFemaleMutation.isPending.value)

        if (getMaleCandidates.data.value) {
            setError("formalCandidates", "maleFetchOffline", false)
            setError("formalCandidates", "maleFetchServerError", false)
        }
        if (getFemaleCandidates.data.value) {
            setError("formalCandidates", "femaleFetchOffline", false)
            setError("formalCandidates", "femaleFetchServerError", false)
        }
    })

    watchEffect(() => {
        if (getMaleCandidates.isError.value) {
            const maleError = getMaleCandidates.error.value as AxiosError<FormalScoreErrorResponse>
            if (maleError) {
                const { type, } = appErrorHandler(maleError)
                if (type === "offline") { setError("formalCandidates", "maleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("formalCandidates", "maleFetchServerError", true)
                }
            }

        }

        if (getFemaleCandidates.isError.value) {
            const femaleError = getFemaleCandidates.error.value as AxiosError<FormalScoreErrorResponse>
            if (femaleError) {
                const { type, } = appErrorHandler(femaleError)
                if (type === "offline") { setError("formalCandidates", "femaleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("formalCandidates", "femaleFetchServerError", true)
                }
            }
        }

    })

    return {
        getMaleCandidates,
        getFemaleCandidates,
        refetchMaleFormalFeat,
        refetchFemaleFormalFeat,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        createFormalScoreMale, createFormalScoreFemale, submissions,
        setSubmitted,
        isSubmitted,
    }
})