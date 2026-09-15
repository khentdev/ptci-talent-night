import { defineStore } from "pinia";
import { reactive, readonly, watchEffect } from "vue";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import { appErrorHandler } from "../../errors/appErrorHandler";
import { useToast } from "../../shared/composables/useToast";
import { candidatesService } from "../services/candidatesService";

import type { AxiosError } from "axios";
import type {
  CandidateErrorResponse,
  CandidateFormErrors,
  CreateCandidateParams,
  DeleteCandidateParams,
  GetCandidatesDTO,
  UpdateCandidateParams,
} from "../types/candidates";
export const useCandidatesStore = defineStore("candidateStore", () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const candidateFormErrors = reactive<CandidateFormErrors>({
    general: "",
  });

  const clearFormErrors = () =>
    Object.keys(candidateFormErrors).forEach(
      (key) =>
        (candidateFormErrors[key as keyof typeof candidateFormErrors] = ""),
    );

  const getCandidates = useQuery({
    queryKey: ["candidatesData"],
    queryFn: () => candidatesService.getCandidates(),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    select: (data) => {
      return {
        ...data,
        data: [...data.data].sort(
          (a, b) => Number(a.cand_number) - Number(b.cand_number),
        ),
      };
    },
  });
  const refetchCandidates = () => getCandidates.refetch();

  const addCandidateMutation = useMutation({
    mutationFn: (data: CreateCandidateParams) =>
      candidatesService.createCandidate(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["candidatesData"] });
      toast.success(data.message, { dedup: true });
    },
    onError: (err: AxiosError<CandidateErrorResponse>) => {
      const { type, message, err: error } = appErrorHandler(err);
      if (error.status === 422) {
        candidateFormErrors.general = message;
        return;
      }
      const infraMaps = [
        "offline",
        "unreachable",
        "serverError",
        "requestTimeout",
      ];
      if (infraMaps.includes(type)) {
        candidateFormErrors.general = message;
      }
    },
  });

  const addCandidate = (data: CreateCandidateParams) =>
    addCandidateMutation.mutateAsync(data);

  const updateCandidateMutation = useMutation({
    mutationFn: (data: UpdateCandidateParams) =>
      candidatesService.updateCandidate(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["candidatesData"] });
      toast.success(data.message, { dedup: true });
    },
    onError: (err: AxiosError<CandidateErrorResponse>) => {
      const { type, message, err: error } = appErrorHandler(err);
      const infraMaps = [
        "offline",
        "unreachable",
        "serverError",
        "requestTimeout",
      ];
      if (error.status === 422) {
        candidateFormErrors.general = message;
        return;
      }
      if (infraMaps.includes(type)) {
        candidateFormErrors.general = message;
      }
    },
  });

  const updateCandidate = (data: UpdateCandidateParams) =>
    updateCandidateMutation.mutateAsync(data);

  const deleteCandidateMutation = useMutation({
    mutationFn: ({ id }: DeleteCandidateParams) =>
      candidatesService.deleteCandidate({ id }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["candidatesData"] });

      const previousData = queryClient.getQueryData<GetCandidatesDTO>([
        "candidatesData",
      ]);
      if (previousData?.data) {
        queryClient.setQueryData<GetCandidatesDTO>(["candidatesData"], {
          ...previousData,
          data: previousData.data.filter((c) => c.cand_id !== id),
        });
      }
      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err: AxiosError<CandidateErrorResponse>, _, context) => {
      const parsed = appErrorHandler(err);
      const infraMaps = [
        "offline",
        "unreachable",
        "serverError",
        "requestTimeout",
      ];

      if (infraMaps.includes(parsed.type)) toast.error(parsed.message);

      if (err.response?.data.status === 404) {
        toast.error("The contestant may already been deleted or is not found.");
      }
      if (context?.previousData) {
        queryClient.setQueryData(["candidatesData"], context.previousData);
      }
    },
  });

  const deleteCandidate = ({ id }: DeleteCandidateParams) =>
    deleteCandidateMutation.mutate({ id });

  const fetchError = reactive({ serverError: false, offline: false });

  watchEffect(() => {
    if (getCandidates.isError.value) {
      const error = getCandidates.error
        .value as AxiosError<CandidateErrorResponse>;
      if (error) {
        const { type } = appErrorHandler(error);
        fetchError.offline = type === "offline";
        fetchError.serverError =
          type === "serverError" ||
          type === "unreachable" ||
          type === "requestTimeout";
      }
    } else if (getCandidates.isSuccess.value) {
      fetchError.offline = false;
      fetchError.serverError = false;
    }
  });

  return {
    candidateFormErrors,
    clearFormErrors,
    getCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    refetchCandidates,
    addCandidateMutation,
    updateCandidateMutation,
    deleteCandidateMutation,
    fetchError: readonly(fetchError),
  };
});
