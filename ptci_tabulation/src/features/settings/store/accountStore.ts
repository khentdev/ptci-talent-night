import { defineStore } from "pinia";
import { reactive, readonly, ref, watchEffect } from "vue";

import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";

import { appErrorHandler } from "../../errors/appErrorHandler";
import { useToast } from "../../shared/composables/useToast";
import { accountsService } from "../services/accountsService";

import type { AxiosError } from "axios";
import type {
  AccountErrorResponse,
  AccountFormErrors,
  AccountIdParams,
  AccountRole,
  CreateAccountParams,
  GetAccountsDTO,
  ResetPasswordParams,
  SetAccountActiveParams,
} from "../types/accounts";

const INFRA_ERRORS = ["offline", "unreachable", "serverError", "requestTimeout"];
const ROLES: AccountRole[] = ["judge", "admin"];

export const useAccountStore = defineStore("accountStore", () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const accountFormErrors = reactive<AccountFormErrors>({
    general: "",
  });

  const clearFormErrors = () =>
    Object.keys(accountFormErrors).forEach(
      (key) => (accountFormErrors[key as keyof typeof accountFormErrors] = ""),
    );

  const judgesEnabled = ref(false);
  const getJudgeAccounts = useQuery({
    queryKey: ["accountsData", "judge"],
    queryFn: () => accountsService.getAccounts("judge"),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    enabled: judgesEnabled,
  });
  const refetchJudgeAccounts = () => getJudgeAccounts.refetch();

  const adminsEnabled = ref(false);
  const getAdminAccounts = useQuery({
    queryKey: ["accountsData", "admin"],
    queryFn: () => accountsService.getAccounts("admin"),
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    enabled: adminsEnabled,
  });
  const refetchAdminAccounts = () => getAdminAccounts.refetch();

  /** Form mutations (create / reset password): errors surface inside the open form. */
  const handleFormError = (err: AxiosError<AccountErrorResponse>) => {
    const { type, message, err: error } = appErrorHandler(err);
    if (error.status === 422 || error.status === 404) {
      accountFormErrors.general = message;
      return;
    }
    if (INFRA_ERRORS.includes(type)) {
      accountFormErrors.general = message;
    }
  };

  /** Row mutations (reset submission / activate / delete): errors surface as toasts. */
  const handleRowError = (err: AxiosError<AccountErrorResponse>) => {
    const parsed = appErrorHandler(err);
    if (INFRA_ERRORS.includes(parsed.type)) {
      toast.error(parsed.message);
      return;
    }
    if (parsed.err.status === 404) {
      toast.error("The account may already been deleted or is not found.");
      return;
    }
    if (parsed.err.status === 422) toast.error(parsed.message);
  };

  const createAccountMutation = useMutation({
    mutationFn: (data: CreateAccountParams) =>
      accountsService.createAccount(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["accountsData", variables.role] });
      toast.success(data.message, { dedup: true });
    },
    onError: handleFormError,
  });

  const createAccount = (data: CreateAccountParams) =>
    createAccountMutation.mutateAsync(data);

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordParams) =>
      accountsService.resetPassword(data),
    onSuccess: (data) => {
      toast.success(data.message, { dedup: true });
    },
    onError: handleFormError,
  });

  const resetPassword = (data: ResetPasswordParams) =>
    resetPasswordMutation.mutateAsync(data);

  const resetSubmissionMutation = useMutation({
    mutationFn: ({ id }: AccountIdParams) =>
      accountsService.resetSubmission({ id }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["accountsData"] });
      toast.success(data.message, { dedup: true });
    },
    onError: handleRowError,
  });

  const resetSubmission = ({ id }: AccountIdParams) =>
    resetSubmissionMutation.mutateAsync({ id });

  const setActiveMutation = useMutation({
    mutationFn: (data: SetAccountActiveParams) =>
      accountsService.setActive(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["accountsData"] });
      toast.success(data.message, { dedup: true });
    },
    onError: handleRowError,
  });

  const setActive = (data: SetAccountActiveParams) =>
    setActiveMutation.mutateAsync(data);

  const deleteAccountMutation = useMutation({
    mutationFn: ({ id }: AccountIdParams) =>
      accountsService.deleteAccount({ id }),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: ["accountsData"] });

      const previousData = {} as Partial<Record<AccountRole, GetAccountsDTO>>;
      for (const role of ROLES) {
        const cached = queryClient.getQueryData<GetAccountsDTO>(["accountsData", role]);
        if (!cached?.data) continue;
        previousData[role] = cached;
        queryClient.setQueryData<GetAccountsDTO>(["accountsData", role], {
          ...cached,
          data: cached.data.filter((a) => a.id !== id),
        });
      }
      return { previousData };
    },
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err: AxiosError<AccountErrorResponse>, _, context) => {
      handleRowError(err);
      for (const role of ROLES) {
        const previous = context?.previousData[role];
        if (previous) queryClient.setQueryData(["accountsData", role], previous);
      }
    },
  });

  const deleteAccount = ({ id }: AccountIdParams) =>
    deleteAccountMutation.mutate({ id });

  const judgeFetchError = reactive({ serverError: false, offline: false });
  const adminFetchError = reactive({ serverError: false, offline: false });

  watchEffect(() => {
    if (getJudgeAccounts.isError.value) {
      const error = getJudgeAccounts.error.value as AxiosError<AccountErrorResponse>;
      if (error) {
        const { type } = appErrorHandler(error);
        judgeFetchError.offline = type === "offline";
        judgeFetchError.serverError =
          type === "serverError" ||
          type === "unreachable" ||
          type === "requestTimeout";
      }
    } else if (getJudgeAccounts.isSuccess.value) {
      judgeFetchError.offline = false;
      judgeFetchError.serverError = false;
    }
  });

  watchEffect(() => {
    if (getAdminAccounts.isError.value) {
      const error = getAdminAccounts.error.value as AxiosError<AccountErrorResponse>;
      if (error) {
        const { type } = appErrorHandler(error);
        adminFetchError.offline = type === "offline";
        adminFetchError.serverError =
          type === "serverError" ||
          type === "unreachable" ||
          type === "requestTimeout";
      }
    } else if (getAdminAccounts.isSuccess.value) {
      adminFetchError.offline = false;
      adminFetchError.serverError = false;
    }
  });

  return {
    accountFormErrors,
    clearFormErrors,
    getJudgeAccounts,
    getAdminAccounts,
    refetchJudgeAccounts,
    refetchAdminAccounts,
    enableJudges: () => (judgesEnabled.value = true),
    enableAdmins: () => (adminsEnabled.value = true),
    createAccount,
    resetPassword,
    resetSubmission,
    setActive,
    deleteAccount,
    createAccountMutation,
    resetPasswordMutation,
    resetSubmissionMutation,
    setActiveMutation,
    deleteAccountMutation,
    judgeFetchError: readonly(judgeFetchError),
    adminFetchError: readonly(adminFetchError),
  };
});
