import { defineStore } from "pinia";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { productionService } from "../services/productionService";
import { ref, toRaw, watchEffect } from "vue";
import { useToast } from "../../shared/composables/useToast";
import type { CreateProductionScoreParams, ProductionScoreErrorResponse } from "../types/production/types";
import type { AxiosError } from "axios";
import { appErrorHandler } from "../../errors/appErrorHandler";
import type { CandidateTeamOptions } from "../types/talent/types";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useLocalStorage } from "@vueuse/core";

export const useProductionStore = defineStore("productionScore", () => {
    const { toast } = useToast()

    const { setLoading } = useLoadingStore()
    const { setError } = useGlobalErrorSetter()

    type ScoreFields = {
        candidateId: string | null;
        candidateNumber: string | null;
        candidateName: string | null;
        candidateTeam: Capitalize<CandidateTeamOptions>;
        choreography: string
        projection: string
        audience_impact: string
    }[]

    const submitKey = ref<string>("")
    const stored = useLocalStorage<{ submitted: boolean }>(
        submitKey.value,
        { submitted: false }
    );

    const setSubmitted = (val: boolean, key: string) => {
        submitKey.value = key
        stored.value.submitted = val;
    };

    const maleCandidateInputs = useLocalStorage<ScoreFields[]>("male-production-scores", []);
    const femaleCandidateInputs = useLocalStorage<ScoreFields[]>("female-production-scores", []);

    const maleEnabled = ref(false)
    const getMaleCandidates = useQuery({
        queryKey: ["maleCandidatesDataProductionFeat"],
        queryFn: () => productionService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "male")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: maleEnabled
    });
    const refetchMaleCandidatesProductionFeat = () => getMaleCandidates.refetch()

    const femaleEnabled = ref(false)
    const getFemaleCandidates = useQuery({
        queryKey: ["femaleCandidatesDataProductionFeat"],
        queryFn: () => productionService.getCandidates(),
        staleTime: 15 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        select: (data) => data.data
            .filter((d) => d.cand_gender === "female")
            .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
        enabled: femaleEnabled
    });
    const refetchFemaleCandidatesProductionFeat = () => getFemaleCandidates.refetch()

    const createProductionScoreMaleMutation = useMutation({
        mutationFn: async (data: CreateProductionScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                productionService.createProductionScore(
                    {
                        cand_id: d.cand_id,
                        choreography: d.choreography,
                        projection: d.projection,
                        audience_impact: d.audience_impact
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
            setSubmitted(true,"male-production-scores")
            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<ProductionScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Male production scores have been restored. Please try again.");
            }
        }
    })
    const createProductionScoreMale = (data: CreateProductionScoreParams[]) => createProductionScoreMaleMutation.mutateAsync(data)

    const createProductionScoreFemaleMutation = useMutation({
        mutationFn: async (data: CreateProductionScoreParams[]) => {
            const results = await Promise.allSettled(data.map(d =>
                productionService.createProductionScore(
                    {
                        cand_id: d.cand_id,
                        choreography: d.choreography,
                        projection: d.projection,
                        audience_impact: d.audience_impact
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
            setSubmitted(true, "female-production-scores")

            toast.success("All scores submitted successfully!")
        },
        onError: (err: AxiosError<ProductionScoreErrorResponse>, _, context) => {
            const parsed = appErrorHandler(err)
            const infraMaps = ["offline", "unreachable", "serverError", "requestTimeout"]
            if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
            if (err.status === 422) { toast.error("You have already submitted a score for this candidates"); return; }
            if (context?.backupScores) {
                maleCandidateInputs.value = structuredClone(context.backupScores);
                toast.info("Female production scores have been restored. Please try again.");
            }
        }
    })
    const createProductionScoreFemale = (data: CreateProductionScoreParams[]) => createProductionScoreFemaleMutation.mutateAsync(data)



    watchEffect(() => {
        setLoading("productionCandidates", "maleInitialFetching", getMaleCandidates.isPending.value || getMaleCandidates.isLoading.value)
        setLoading("productionCandidates", "maleFetchRefresh", getMaleCandidates.isFetching.value)
        setLoading("productionCandidates", "femaleInitialFetching", getFemaleCandidates.isPending.value || getFemaleCandidates.isLoading.value)
        setLoading("productionCandidates", "femaleFetchRefresh", getFemaleCandidates.isFetching.value)

        setLoading("productionCandidates", "createMaleProductionScore", createProductionScoreMaleMutation.isPending.value)
        setLoading("productionCandidates", "createFemaleProductionScore", createProductionScoreFemaleMutation.isPending.value)

        if (getMaleCandidates.data.value) {
            setError("productionCandidates", "maleFetchOffline", false)
            setError("productionCandidates", "maleFetchServerError", false)
        }
        if (getFemaleCandidates.data.value) {
            setError("productionCandidates", "femaleFetchOffline", false)
            setError("productionCandidates", "femaleFetchServerError", false)
        }
    })

    watchEffect(() => {
        if (getMaleCandidates.isError.value) {
            const maleError = getMaleCandidates.error.value as AxiosError<ProductionScoreErrorResponse>
            if (maleError) {
                const { type, } = appErrorHandler(maleError)
                if (type === "offline") { setError("productionCandidates", "maleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("productionCandidates", "maleFetchServerError", true)
                }
            }

        }

        if (getFemaleCandidates.isError.value) {
            const femaleError = getFemaleCandidates.error.value as AxiosError<ProductionScoreErrorResponse>
            if (femaleError) {
                const { type, } = appErrorHandler(femaleError)
                if (type === "offline") { setError("productionCandidates", "femaleFetchOffline", true) }
                if (type === "serverError" || type === "unreachable" || type === "requestTimeout") {
                    setError("productionCandidates", "femaleFetchServerError", true)
                }
            }
        }

    })

    return {
        getMaleCandidates,
        getFemaleCandidates,
        refetchMaleCandidatesProductionFeat,
        refetchFemaleCandidatesProductionFeat,
        enableMale: () => { maleEnabled.value = true },
        enableFemale: () => { femaleEnabled.value = true },
        createProductionScoreMale, createProductionScoreFemale
    }
})