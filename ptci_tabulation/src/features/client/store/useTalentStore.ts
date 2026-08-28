import { defineStore } from "pinia";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { talentService } from "../services/talentService";
import { toRaw, ref, watchEffect } from "vue";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import type { AxiosError } from "axios";
import type { TalentFeatErrorResponse, CreateTalentScoreParams, CandidateTeamOptions } from "../types/talent/types";
import { appErrorHandler } from "../../errors/appErrorHandler";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useToast } from "../../shared/composables/useToast";
import { useLocalStorage } from "@vueuse/core";
import { useAuthStore } from "../../auth/store/authStore";

export const useTalentStore = defineStore("talentStore", () => {


    const authStore = useAuthStore()
    type ScoreFields = {
        candidateId: string | null;
        candidateNumber: string | null;
        candidateName: string | null;
        candidateTeam: Capitalize<CandidateTeamOptions>;
        mastery: string;
        performance: string;
        impression: string;
        audience: string;
    };

    const maleCandidateInputs = useLocalStorage<ScoreFields[]>("male-talent-scores", []);
    const femaleCandidateInputs = useLocalStorage<ScoreFields[]>("female-talent-scores", []);


    const { toast } = useToast()

    const { setError } = useGlobalErrorSetter()
    const { setLoading } = useLoadingStore()
    const maleEnabled = ref(false)
    const femaleEnabled = ref(false)

    const getMaleCandidates = useQuery({
        queryKey: ["maleCandidatesDataTalentFeat"],
        queryFn: () => talentService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "male")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: maleEnabled
    });
    const refetchMaleCandidatesTalentFeat = () => getMaleCandidates.refetch()

    const getFemaleCandidates = useQuery({
        queryKey: ["femaleCandidatesDataTalentFeat"],
        queryFn: () => talentService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "female")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: femaleEnabled
    })
    const refetchFemaleCandidatesTalentFeat = () => getFemaleCandidates.refetch()


    const createMaleTalentScoreMutation = useMutation({
        mutationFn: async (scores: CreateTalentScoreParams[]) => {
            authStore.setUserMetaDataAfterScoreSubmit(true)
            const results = await Promise.allSettled(
                scores.map((c) =>
                    talentService.createTalentScore({
                        cand_id: c.cand_id,
                        mastery: c.mastery,
                        performance_choreography: c.performance_choreography,
                        overall_impression: c.overall_impression,
                        audience_impact: c.audience_impact,
                    })
                )
            );
            const failures = results.filter(d => d.status === "rejected")
            if (failures.length > 0) throw (failures[0] as PromiseRejectedResult).reason
            return results.filter(r => r.status === "fulfilled").map(r => r.value)
        },
        onMutate: async () => {
            const backupScores = structuredClone(toRaw(maleCandidateInputs.value))
            return { backupScores }
        },
        onSuccess: async () => {
            toast.success("All scores submitted successfully!");
        },
        onError: (err: AxiosError<TalentFeatErrorResponse>, _, context) => {
            authStore.setUserMetaDataAfterScoreSubmit(false)
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Male talent scores have been restored. Please try again.");
            }
        }
    })
    const createMaleTalentScore = (data: CreateTalentScoreParams[]) =>
        createMaleTalentScoreMutation.mutateAsync(data)

    const createFemaleTalentScoreMutation = useMutation({
        mutationFn: async (scores: CreateTalentScoreParams[]) => {
            const results = await Promise.allSettled(
                scores.map((c) =>
                    talentService.createTalentScore({
                        cand_id: c.cand_id,
                        mastery: c.mastery,
                        performance_choreography: c.performance_choreography,
                        overall_impression: c.overall_impression,
                        audience_impact: c.audience_impact,
                    })
                )
            );
            const failures = results.filter(d => d.status === "rejected")
            if (failures.length > 0) throw (failures[0] as PromiseRejectedResult).reason
            return results.filter(r => r.status === "fulfilled").map(r => r.value)
        },
        onMutate: async () => {
            const backupScores = structuredClone(toRaw(femaleCandidateInputs.value))
            femaleCandidateInputs.value.forEach((candidate) => {
                candidate.mastery = "";
                candidate.performance = "";
                candidate.impression = "";
                candidate.audience = "";
            });
            return { backupScores }
        },
        onSuccess: () => {
            toast.success("Female talent scores submitted successfully!");
        },
        onError: (err: AxiosError<TalentFeatErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (context?.backupScores) {
                femaleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Female talent scores have been restored. Please try again.");
            }
        }
    })
    const createFemaleTalentScore = (data: CreateTalentScoreParams[]) =>
        createFemaleTalentScoreMutation.mutateAsync(data)


    watchEffect(() => {
        setLoading("talentCandidates", "maleInitialFetching", getMaleCandidates.isPending.value || getMaleCandidates.isLoading.value)
        setLoading("talentCandidates", "maleFetchRefresh", getMaleCandidates.isFetching.value)
        setLoading("talentCandidates", "femaleInitialFetching", getFemaleCandidates.isPending.value || getFemaleCandidates.isLoading.value)
        setLoading("talentCandidates", "femaleFetchRefresh", getFemaleCandidates.isFetching.value)

        setLoading("talentCandidates", "createMaleTalentScore", createMaleTalentScoreMutation.isPending.value)
        setLoading("talentCandidates", "createFemaleTalentScore", createFemaleTalentScoreMutation.isPending.value)

        if (getMaleCandidates.data.value) {
            setError("talentCandidates", "maleFetchOffline", false)
            setError("talentCandidates", "maleFetchServerError", false)
        }
        if (getFemaleCandidates.data.value) {
            setError("talentCandidates", "femaleFetchOffline", false)
            setError("talentCandidates", "femaleFetchServerError", false)
        }
    })

    watchEffect(() => {
        if (getMaleCandidates.isError.value) {
            const maleError = getMaleCandidates.error.value as AxiosError<TalentFeatErrorResponse>
            if (maleError) {
                const { type, } = appErrorHandler(maleError)
                if (type === "offline") { setError("talentCandidates", "maleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("talentCandidates", "maleFetchServerError", true)
                }
            }

        }

        if (getFemaleCandidates.isError.value) {
            const femaleError = getFemaleCandidates.error.value as AxiosError<TalentFeatErrorResponse>
            if (femaleError) {
                const { type, } = appErrorHandler(femaleError)
                if (type === "offline") { setError("talentCandidates", "femaleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("talentCandidates", "femaleFetchServerError", true)
                }
            }
        }

    })


    return {
        refetchMaleCandidatesTalentFeat,
        refetchFemaleCandidatesTalentFeat,
        getMaleCandidates,
        getFemaleCandidates,
        createMaleTalentScore,
        createFemaleTalentScore,
        enableMale: () => { maleEnabled.value = true; },
        enableFemale: () => { femaleEnabled.value = true }
    }
})

