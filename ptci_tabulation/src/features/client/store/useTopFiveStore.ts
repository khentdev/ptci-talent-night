import { defineStore } from "pinia";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { topFiveService } from "../services/topFiveService";
import { ref, toRaw, watchEffect } from "vue";
import { useToast } from "../../shared/composables/useToast";
import type { CreateTopFiveScoreParams, TopFiveScoreErrorResponse } from "../types/top-five/types";
import type { AxiosError } from "axios";
import { appErrorHandler } from "../../errors/appErrorHandler";
import type { CandidateTeamOptions } from "../types/talent/types";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useLocalStorage } from "@vueuse/core";

export const useTopFiveStore = defineStore("topFiveScore", () => {
    const { toast } = useToast()

    const { setLoading } = useLoadingStore()
    const { setError } = useGlobalErrorSetter()

    type ScoreFields = {
        candidateId: string | null;
        candidateNumber: string | null;
        candidateName: string | null;
        candidateTeam: Capitalize<CandidateTeamOptions>;
        qna: number
        beauty: number
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
    const maleCandidateInputs = useLocalStorage<ScoreFields[]>("male-topFive-scores", []);
    const femaleCandidateInputs = useLocalStorage<ScoreFields[]>("female-topFive-scores", []);

    const maleEnabled = ref(false)
    const getMaleCandidates = useQuery({
        queryKey: ["maleCandidatesTopFiveScoreFeat"],
        queryFn: () => topFiveService.getTopFiveCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        // Best five, highest first. (Previously `.sort(asc).slice(5).reverse()`, which only
        // worked when the API returned exactly 10 per gender.)
        select: (data) => data.data
            .filter((d) => d.cand_gender === "male")
            .sort((a, b) => Number(b.total_score) - Number(a.total_score)).slice(0, 5),
        enabled: maleEnabled
    });
    const refetchMaleTopFiveFeat = () => getMaleCandidates.refetch()


    const femaleEnabled = ref(false)
    const getFemaleCandidates = useQuery({
        queryKey: ["femaleCandidatesTopFiveScoreFeat"],
        queryFn: () => topFiveService.getTopFiveCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "female")
            .sort((a, b) => Number(b.total_score) - Number(a.total_score)).slice(0, 5),
        enabled: femaleEnabled
    });
    const refetchFemaleTopFiveFeat = () => getFemaleCandidates.refetch()

    const createTopFiveScoreMaleMutation = useMutation({
        mutationFn: async (data: CreateTopFiveScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                topFiveService.createTopFiveScore(
                    {
                        cand_id: d.cand_id,
                        qna: d.qna,
                        beauty: d.beauty
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
            setSubmitted(true, "male-topFive-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<TopFiveScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Male Top Five scores have been restored. Please try again.");
            }
        }
    })

    const createTopFiveScoreMale = (data: CreateTopFiveScoreParams[]) => createTopFiveScoreMaleMutation.mutateAsync(data)


    const createTopFiveScoreFemaleMutation = useMutation({
        mutationFn: async (data: CreateTopFiveScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                topFiveService.createTopFiveScore(
                    {
                        cand_id: d.cand_id,
                        qna: d.qna,
                        beauty: d.beauty
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
            setSubmitted(true, "female-topFive-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<TopFiveScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Female topFive scores have been restored. Please try again.");
            }
        }
    })
    const createTopFiveScoreFemale = (data: CreateTopFiveScoreParams[]) => createTopFiveScoreFemaleMutation.mutateAsync(data)

    watchEffect(() => {
        setLoading("topFiveCandidates", "maleInitialFetching", getMaleCandidates.isPending.value || getMaleCandidates.isLoading.value)
        setLoading("topFiveCandidates", "maleFetchRefresh", getMaleCandidates.isFetching.value)
        setLoading("topFiveCandidates", "femaleInitialFetching", getFemaleCandidates.isPending.value || getFemaleCandidates.isLoading.value)
        setLoading("topFiveCandidates", "femaleFetchRefresh", getFemaleCandidates.isFetching.value)

        setLoading("topFiveCandidates", "createMaleTopFiveScore", createTopFiveScoreMaleMutation.isPending.value)
        setLoading("topFiveCandidates", "createFemaleTopFiveScore", createTopFiveScoreFemaleMutation.isPending.value)

        if (getMaleCandidates.data.value) {
            setError("topFiveCandidates", "maleFetchOffline", false)
            setError("topFiveCandidates", "maleFetchServerError", false)
        }
        if (getFemaleCandidates.data.value) {
            setError("topFiveCandidates", "femaleFetchOffline", false)
            setError("topFiveCandidates", "femaleFetchServerError", false)
        }
    })

    watchEffect(() => {
        if (getMaleCandidates.isError.value) {
            const maleError = getMaleCandidates.error.value as AxiosError<TopFiveScoreErrorResponse>
            if (maleError) {
                const { type, } = appErrorHandler(maleError)
                if (type === "offline") { setError("topFiveCandidates", "maleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("topFiveCandidates", "maleFetchServerError", true)
                }
            }

        }

        if (getFemaleCandidates.isError.value) {
            const femaleError = getFemaleCandidates.error.value as AxiosError<TopFiveScoreErrorResponse>
            if (femaleError) {
                const { type, } = appErrorHandler(femaleError)
                if (type === "offline") { setError("topFiveCandidates", "femaleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("topFiveCandidates", "femaleFetchServerError", true)
                }
            }
        }

    })

    return {
        getMaleCandidates,
        getFemaleCandidates,
        refetchMaleTopFiveFeat,
        refetchFemaleTopFiveFeat,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        createTopFiveScoreMale, createTopFiveScoreFemale, submissions,
        setSubmitted,
        isSubmitted,
    }
})