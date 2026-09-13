import { defineStore } from "pinia";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { talentService } from "../services/talentService";
import { toRaw, reactive, readonly, ref, watchEffect } from "vue";
import type { AxiosError } from "axios";
import type {
  TalentFeatErrorResponse,
  CreateTalentScoreParams,
  CandidateTeamOptions,
} from "../types/talent/types";
import { appErrorHandler } from "../../errors/appErrorHandler";
import { useToast } from "../../shared/composables/useToast";
import { useLocalStorage } from "@vueuse/core";
import { useAuthStore } from "../../auth/store/authStore";

export const useTalentStore = defineStore("talentStore", () => {
  const authStore = useAuthStore();
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

  const maleCandidateInputs = useLocalStorage<ScoreFields[]>(
    "male-talent-scores",
    [],
  );
  const femaleCandidateInputs = useLocalStorage<ScoreFields[]>(
    "female-talent-scores",
    [],
  );

  const { toast } = useToast();

  const maleEnabled = ref(false);
  const femaleEnabled = ref(false);

  const getMaleCandidates = useQuery({
    queryKey: ["maleCandidatesDataTalentFeat"],
    queryFn: () => talentService.getCandidates(),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    select: (data) =>
      data.data
        .filter((d) => d.cand_gender === "male")
        .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
    enabled: maleEnabled,
  });
  const refetchMaleCandidatesTalentFeat = () => {
    getMaleCandidates.refetch();
    getMyMaleTalentScores.refetch();
  };

  const getFemaleCandidates = useQuery({
    queryKey: ["femaleCandidatesDataTalentFeat"],
    queryFn: () => talentService.getCandidates(),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    select: (data) =>
      data.data
        .filter((d) => d.cand_gender === "female")
        .sort((a, b) => Number(a.cand_number) - Number(b.cand_number)),
    enabled: femaleEnabled,
  });
  const refetchFemaleCandidatesTalentFeat = () => {
    getFemaleCandidates.refetch();
    getMyFemaleTalentScores.refetch();
  };

  const getMyMaleTalentScores = useQuery({
    queryKey: ["myMaleTalentScores"],
    queryFn: () => talentService.getMyTalentScores("male"),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    select: (data) => data.data,
    enabled: maleEnabled,
  });
  const refetchMyMaleTalentScores = () => getMyMaleTalentScores.refetch();

  const getMyFemaleTalentScores = useQuery({
    queryKey: ["myFemaleTalentScores"],
    queryFn: () => talentService.getMyTalentScores("female"),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    select: (data) => data.data,
    enabled: femaleEnabled,
  });
  const refetchMyFemaleTalentScores = () => getMyFemaleTalentScores.refetch();

  const createMaleTalentScoreMutation = useMutation({
    mutationFn: (scores: CreateTalentScoreParams[]) =>
      talentService.createTalentScoreBatch(scores),
    onMutate: async () => {
      const backupScores = structuredClone(toRaw(maleCandidateInputs.value));
      return { backupScores };
    },
    onSuccess: async (res) => {
      authStore.setUserMetaDataAfterScoreSubmit(res.has_submitted);
      getMyMaleTalentScores.refetch().catch(() => {});
      toast.success("All scores submitted successfully!");
    },
    onError: (err: AxiosError<TalentFeatErrorResponse>, _, context) => {
      const parsed = appErrorHandler(err);
      const infraMaps = [
        "offline",
        "unreachable",
        "serverError",
        "requestTimeout",
      ];
      if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
      if (parsed.err.status === 422) {
        toast.error("You already submitted your scores for male candidates.");
        return;
      }

      if (context?.backupScores) {
        maleCandidateInputs.value = structuredClone(context.backupScores);
        toast.info("Male talent scores have been restored. Please try again.");
      }
    },
  });
  const createMaleTalentScore = (data: CreateTalentScoreParams[]) =>
    createMaleTalentScoreMutation.mutateAsync(data);

  const createFemaleTalentScoreMutation = useMutation({
    mutationFn: (scores: CreateTalentScoreParams[]) =>
      talentService.createTalentScoreBatch(scores),
    onMutate: async () => {
      const backupScores = structuredClone(toRaw(femaleCandidateInputs.value));
      femaleCandidateInputs.value.forEach((candidate) => {
        candidate.mastery = "";
        candidate.performance = "";
        candidate.impression = "";
        candidate.audience = "";
      });
      return { backupScores };
    },
    onSuccess: (res) => {
      authStore.setUserMetaDataAfterScoreSubmit(res.has_submitted);
      getMyFemaleTalentScores.refetch().catch(() => {});
      toast.success("Female talent scores submitted successfully!");
    },
    onError: (err: AxiosError<TalentFeatErrorResponse>, _, context) => {
      const parsed = appErrorHandler(err);
      const infraMaps = [
        "offline",
        "unreachable",
        "serverError",
        "requestTimeout",
      ];
      if (infraMaps.includes(parsed.type)) toast.error(parsed.message);
      if (context?.backupScores) {
        femaleCandidateInputs.value = structuredClone(context.backupScores);
        toast.info(
          "Female talent scores have been restored. Please try again.",
        );
      }
    },
  });
  const createFemaleTalentScore = (data: CreateTalentScoreParams[]) =>
    createFemaleTalentScoreMutation.mutateAsync(data);

  const maleError = reactive({ serverError: false, offline: false });
  const femaleError = reactive({ serverError: false, offline: false });

  watchEffect(() => {
    const candidatesFailed = getMaleCandidates.isError.value;
    const myScoresFailed = getMyMaleTalentScores.isError.value;
    if (candidatesFailed || myScoresFailed) {
      const error = (candidatesFailed
        ? getMaleCandidates.error.value
        : getMyMaleTalentScores.error.value) as AxiosError<TalentFeatErrorResponse>;
      if (error) {
        const { type } = appErrorHandler(error);
        maleError.offline = type === "offline";
        maleError.serverError =
          type === "serverError" ||
          type === "unreachable" ||
          type === "requestTimeout";
      }
    } else if (getMaleCandidates.isSuccess.value && getMyMaleTalentScores.isSuccess.value) {
      maleError.offline = false;
      maleError.serverError = false;
    }
  });

  watchEffect(() => {
    const candidatesFailed = getFemaleCandidates.isError.value;
    const myScoresFailed = getMyFemaleTalentScores.isError.value;
    if (candidatesFailed || myScoresFailed) {
      const error = (candidatesFailed
        ? getFemaleCandidates.error.value
        : getMyFemaleTalentScores.error.value) as AxiosError<TalentFeatErrorResponse>;
      if (error) {
        const { type } = appErrorHandler(error);
        femaleError.offline = type === "offline";
        femaleError.serverError =
          type === "serverError" ||
          type === "unreachable" ||
          type === "requestTimeout";
      }
    } else if (getFemaleCandidates.isSuccess.value && getMyFemaleTalentScores.isSuccess.value) {
      femaleError.offline = false;
      femaleError.serverError = false;
    }
  });

  return {
    refetchMaleCandidatesTalentFeat,
    refetchFemaleCandidatesTalentFeat,
    getMaleCandidates,
    getFemaleCandidates,
    getMyMaleTalentScores,
    getMyFemaleTalentScores,
    refetchMyMaleTalentScores,
    refetchMyFemaleTalentScores,
    createMaleTalentScore,
    createFemaleTalentScore,
    createMaleTalentScoreMutation,
    createFemaleTalentScoreMutation,
    maleError: readonly(maleError),
    femaleError: readonly(femaleError),
    enableMale: () => {
      maleEnabled.value = true;
    },
    enableFemale: () => {
      femaleEnabled.value = true;
    },
  };
});
