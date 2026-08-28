import { defineStore } from "pinia";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { questionAnswerService } from "../services/questionAnswerService";
import { ref, toRaw, watchEffect } from "vue";
import { useToast } from "../../shared/composables/useToast";
import type { CreateQuestionAnswerScoreParams, QuestionAnswerScoreErrorResponse } from "../types/questionAnswer/types";
import type { AxiosError } from "axios";
import { appErrorHandler } from "../../errors/appErrorHandler";
import type { CandidateTeamOptions } from "../types/talent/types";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useLocalStorage } from "@vueuse/core";

export const useQuestionAnswerStore = defineStore("questionAnswerScore", () => {
    const { toast } = useToast()

    const { setLoading } = useLoadingStore()
    const { setError } = useGlobalErrorSetter()

    type ScoreFields = {
        candidateId: string | null;
        candidateNumber: string | null;
        candidateName: string | null;
        candidateTeam: Capitalize<CandidateTeamOptions>;
        total_score: number
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
    const maleCandidateInputs = useLocalStorage<ScoreFields[]>("male-questionAnswer-scores", []);
    const femaleCandidateInputs = useLocalStorage<ScoreFields[]>("female-questionAnswer-scores", []);

    const maleEnabled = ref(false)
    const getMaleCandidates = useQuery({
        queryKey: ["maleCandidatesQuestionAnswerScoreFeat"],
        queryFn: () => questionAnswerService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "male")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: maleEnabled
    });
    const refetchMaleQuestionAnswerFeat = () => getMaleCandidates.refetch()


    const femaleEnabled = ref(false)
    const getFemaleCandidates = useQuery({
        queryKey: ["femaleCandidatesQuestionAnswerScoreFeat"],
        queryFn: () => questionAnswerService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "female")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: femaleEnabled
    });
    const refetchFemaleQuestionAnswerFeat = () => getFemaleCandidates.refetch()

    const createQuestionAnswerScoreMaleMutation = useMutation({
        mutationFn: async (data: CreateQuestionAnswerScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                questionAnswerService.createQuestionAnswerScore(
                    {
                        cand_id: d.cand_id,
                        total_score: d.total_score,
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
            setSubmitted(true, "male-questionAnswer-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<QuestionAnswerScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Male question and answer scores have been restored. Please try again.");
            }
        }
    })

    const createQuestionAnswerScoreMale = (data: CreateQuestionAnswerScoreParams[]) => createQuestionAnswerScoreMaleMutation.mutateAsync(data)


    const createQuestionAnswerScoreFemaleMutation = useMutation({
        mutationFn: async (data: CreateQuestionAnswerScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                questionAnswerService.createQuestionAnswerScore(
                    {
                        cand_id: d.cand_id,
                        total_score: d.total_score,
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
            setSubmitted(true, "female-questionAnswer-submitted")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<QuestionAnswerScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Female question and answer scores have been restored. Please try again.");
            }
        }
    })
    const createQuestionAnswerScoreFemale = (data: CreateQuestionAnswerScoreParams[]) => createQuestionAnswerScoreFemaleMutation.mutateAsync(data)

    watchEffect(() => {
        setLoading("questionAnswerCandidates", "maleInitialFetching", getMaleCandidates.isPending.value || getMaleCandidates.isLoading.value)
        setLoading("questionAnswerCandidates", "maleFetchRefresh", getMaleCandidates.isFetching.value)
        setLoading("questionAnswerCandidates", "femaleInitialFetching", getFemaleCandidates.isPending.value || getFemaleCandidates.isLoading.value)
        setLoading("questionAnswerCandidates", "femaleFetchRefresh", getFemaleCandidates.isFetching.value)

        setLoading("questionAnswerCandidates", "createMaleQuestionAnswerScore", createQuestionAnswerScoreMaleMutation.isPending.value)
        setLoading("questionAnswerCandidates", "createFemaleQuestionAnswerScore", createQuestionAnswerScoreFemaleMutation.isPending.value)

        if (getMaleCandidates.data.value) {
            setError("questionAnswerCandidates", "maleFetchOffline", false)
            setError("questionAnswerCandidates", "maleFetchServerError", false)
        }
        if (getFemaleCandidates.data.value) {
            setError("questionAnswerCandidates", "femaleFetchOffline", false)
            setError("questionAnswerCandidates", "femaleFetchServerError", false)
        }
    })

    watchEffect(() => {
        if (getMaleCandidates.isError.value) {
            const maleError = getMaleCandidates.error.value as AxiosError<QuestionAnswerScoreErrorResponse>
            if (maleError) {
                const { type, } = appErrorHandler(maleError)
                if (type === "offline") { setError("questionAnswerCandidates", "maleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("questionAnswerCandidates", "maleFetchServerError", true)
                }
            }

        }

        if (getFemaleCandidates.isError.value) {
            const femaleError = getFemaleCandidates.error.value as AxiosError<QuestionAnswerScoreErrorResponse>
            if (femaleError) {
                const { type, } = appErrorHandler(femaleError)
                if (type === "offline") { setError("questionAnswerCandidates", "femaleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("questionAnswerCandidates", "femaleFetchServerError", true)
                }
            }
        }

    })

    return {
        getMaleCandidates,
        getFemaleCandidates,
        refetchMaleQuestionAnswerFeat,
        refetchFemaleQuestionAnswerFeat,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        createQuestionAnswerScoreMale, createQuestionAnswerScoreFemale, submissions,
        setSubmitted,
        isSubmitted,
    }
})