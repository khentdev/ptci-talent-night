<template>
  <FeatureBaseTable>
    <template #table>
      <FeatureServerState v-if="fetchError.serverError" :on-retry="refetchAccounts"
        :title="`Couldn't load ${roleLabel.toLowerCase()} accounts`"
        :message="`There was an issue retrieving ${roleLabel.toLowerCase()} accounts. Please check your connection and try again.`" />
      <IsEmptyState v-else-if="!accountsQuery.data?.data?.length" />
      <table v-else :class="TABLE_STYLES.TB">
        <thead :class="TABLE_STYLES.THEADROW">
          <tr>
            <th :class="TABLE_STYLES.TH">Time Created</th>
            <th :class="TABLE_STYLES.TH">Username</th>
            <th :class="TABLE_STYLES.TH">Status</th>
            <th v-if="isJudge" :class="TABLE_STYLES.TH">Submission</th>
            <th :class="TABLE_STYLES.TH">Actions</th>
          </tr>
        </thead>

        <tbody :class="TABLE_STYLES.TBODY">
          <tr v-for="a in accountsQuery.data?.data" :key="`${a.role}-${a.id}`"
            class="hover:bg-gray-50 transition-colors">
            <td :class="TABLE_STYLES.TD.no_bold">
              {{ formatDateAndTime(a.created_at) }}
            </td>
            <td :class="TABLE_STYLES.TD.bold">
              {{ a.username }}
              <span v-if="isSelf(a)" class="ml-1 text-xs font-normal text-gray-500">(you)</span>
            </td>
            <td :class="TABLE_STYLES.TD.no_bold">
              <span class="px-2 py-1 rounded text-xs font-medium"
                :class="a.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'">
                {{ a.is_active ? "Active" : "Inactive" }}
              </span>
            </td>
            <td v-if="isJudge" :class="TABLE_STYLES.TD.no_bold">
              <span class="px-2 py-1 rounded text-xs font-medium text-nowrap"
                :class="a.has_submitted ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'">
                {{ a.has_submitted ? "Submitted" : "Pending" }}
              </span>
            </td>
            <td :class="TABLE_STYLES.TD.no_bold">
              <ActionsDropdown :items="rowActions(a)" :trigger-title="`Actions for ${a.username}`" />
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </FeatureBaseTable>
  <FeatureBaseForm title="Reset Password"
    :description="`Set a new password for &quot;${accountToUpdate?.username ?? ''}&quot;. Their current sessions will be signed out.`"
    :show-form="showForm">
    <AccountForm mode="reset-password" :role="role" :account="accountToUpdate" :on-submit="resetPassword"
      :is-loading="resetPasswordMutation.isPending" :on-close="() => (showForm = false)" />
  </FeatureBaseForm>
  <ConfirmationModal :show="showActionModal" :title="actionCopy.title" :description="actionCopy.description"
    :action-fn-name="actionCopy.actionFnName" :action-fn="runPendingAction" :is-loading="isActionPending"
    :close="() => (showActionModal = false)" />
  <DeleteConfirmationModal :datas="dataToDelete" :title="`Delete ${roleLabel}`"
    :description="`Are you sure you want to delete this ${roleLabel.toLowerCase()} account?`" number-label="Role"
    name-label="Username" :on-close="() => (showConfirmation = false)" :show="showConfirmation"
    :on-delete="deleteAccount" />
</template>

<script setup lang="ts">
  import { KeyRound, RotateCcw, Trash, UserCheck, UserX } from "lucide-vue-next";
  import { computed, ref } from "vue";
  import { useAccountStore } from "../../store/accountStore";
  import { useAuthStore } from "../../../auth/store/authStore";
  import type { AccountData, AccountRole } from "../../types/accounts";
  import FeatureBaseTable from "../../../shared/components/reusables/FeatureBaseTable.vue";
  import FeatureBaseForm from "../../../shared/components/reusables/FeatureBaseForm.vue";
  import IsEmptyState from "../../../shared/components/reusables/IsEmptyState.vue";
  import DeleteConfirmationModal from "../../../shared/components/reusables/DeleteConfirmationModal.vue";
  import FeatureServerState from "../../../shared/components/reusables/FeatureServerState.vue";
  import ConfirmationModal from "../../../client/components/reusables/ConfirmationModal.vue";
  import ActionsDropdown from "../../../shared/components/reusables/ActionsDropdown.vue";
  import type { ActionsDropdownItem } from "../../../shared/types/actionsDropdown";
  import AccountForm from "./AccountForm.vue";
  import { TABLE_STYLES } from "../../../shared/constants/tableStyles";
  import { CapitalizeLabel } from "../../../../utils/capitalizeWord";

  const props = defineProps<{ role: AccountRole }>();

  const accountStore = useAccountStore();
  const { resetPassword, resetSubmission, setActive, deleteAccount } = accountStore;
  const authStore = useAuthStore();

  const isJudge = computed(() => props.role === "judge");
  const roleLabel = computed(() => CapitalizeLabel(props.role));
  const accountsQuery = computed(() =>
    isJudge.value ? accountStore.getJudgeAccounts : accountStore.getAdminAccounts,
  );
  const fetchError = computed(() =>
    isJudge.value ? accountStore.judgeFetchError : accountStore.adminFetchError,
  );
  const refetchAccounts = () =>
    isJudge.value ? accountStore.refetchJudgeAccounts() : accountStore.refetchAdminAccounts();
  const resetPasswordMutation = computed(() => accountStore.resetPasswordMutation);

  const isSelf = (account: AccountData) => authStore.getUserMetaData?.id === account.id;

  const formatDateAndTime = (date: string): string => {
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(dateObj);
  };

  const showForm = ref(false);
  const accountToUpdate = ref<AccountData | null>(null);
  const toggleForm = (account: AccountData) => {
    showForm.value = !showForm.value;
    accountToUpdate.value = account;
  };

  type RowAction = "reset-submission" | "deactivate" | "activate";
  const showActionModal = ref(false);
  const pendingAction = ref<{ action: RowAction; account: AccountData } | null>(null);

  const toggleActionModal = (action: RowAction, account: AccountData) => {
    showActionModal.value = !showActionModal.value;
    pendingAction.value = { action, account };
  };

  const actionCopy = computed(() => {
    const username = pendingAction.value?.account.username ?? "";
    return {
      "reset-submission": {
        title: "Reset Submission",
        description: `Allow "${username}" to submit scores again? Scores already submitted are kept.`,
        actionFnName: "Reset",
      },
      deactivate: {
        title: "Deactivate Account",
        description: `"${username}" will be signed out immediately and won't be able to log in until reactivated.`,
        actionFnName: "Deactivate",
      },
      activate: {
        title: "Activate Account",
        description: `Allow "${username}" to log in again?`,
        actionFnName: "Activate",
      },
    }[pendingAction.value?.action ?? "activate"];
  });

  const isActionPending = computed(
    () => accountStore.resetSubmissionMutation.isPending || accountStore.setActiveMutation.isPending,
  );

  const runPendingAction = async () => {
    if (!pendingAction.value) return;
    const { action, account } = pendingAction.value;
    if (action === "reset-submission") await resetSubmission({ id: account.id });
    else await setActive({ id: account.id, is_active: action === "activate" });
  };

  type DataToDelete = { id: string; number: string; name: string };
  const showConfirmation = ref(false);
  const dataToDelete = ref<DataToDelete | null>(null);

  const toggleConfirmationModal = (account: AccountData) => {
    showConfirmation.value = !showConfirmation.value;
    dataToDelete.value = { id: account.id, number: CapitalizeLabel(account.role), name: account.username };
  };

  const rowActions = (account: AccountData): ActionsDropdownItem[] => {
    const self = isSelf(account);
    const actions: ActionsDropdownItem[] = [
      { label: "Reset Password", icon: KeyRound, onClick: () => toggleForm(account) },
    ];
    if (isJudge.value) {
      actions.push({
        label: "Reset Submission",
        icon: RotateCcw,
        disabled: !account.has_submitted,
        title: account.has_submitted ? undefined : "Judge has not submitted yet",
        onClick: () => toggleActionModal("reset-submission", account),
      });
    }
    actions.push(
      account.is_active
        ? {
            label: "Deactivate",
            icon: UserX,
            danger: true,
            disabled: self,
            title: self ? "You cannot deactivate your own account" : undefined,
            onClick: () => toggleActionModal("deactivate", account),
          }
        : { label: "Activate", icon: UserCheck, onClick: () => toggleActionModal("activate", account) },
      {
        label: "Delete",
        icon: Trash,
        danger: true,
        disabled: self,
        title: self ? "You cannot delete your own account" : undefined,
        onClick: () => toggleConfirmationModal(account),
      },
    );
    return actions;
  };
</script>
