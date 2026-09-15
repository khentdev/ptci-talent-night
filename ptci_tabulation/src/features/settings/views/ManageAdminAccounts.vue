<template>
  <section
    class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center"
  >
    <div
      class="w-full max-w-full mt-12 rounded-2xl"
      :class="{
        'border border-gray-200': !getAdminAccounts.isPending,
      }"
    >
      <div class="overflow-hidden rounded-2xl">
        <FeatureOfflineState
          v-if="adminFetchError.offline || isOffline"
        />
        <DataLoadingState
          v-else-if="getAdminAccounts.isPending"
        />
        <template v-else>
          <div class="relative">
            <InlineFetchIndicator v-show="getAdminAccounts.isFetching"/>
            <FeatureHeader
              :has-icon="true"
              :action-fn="toggleForm"
              action-fn-name="Add Admin"
              title="Manage Admin Accounts"
              action-fn-title="Add new admin account"
              description="Create admin accounts, reset passwords, and control access"
            />
            <AccountDataTable role="admin" />
          </div>
        </template>
      </div>
    </div>
  </section>
  <FeatureBaseForm
    :show-form="formOpen"
    title="Add Admin"
    description="Provide a username and password for the new admin"
  >
    <AccountForm
      mode="create"
      role="admin"
      :on-submit="createAccount"
      :is-loading="createAccountMutation.isPending"
      :on-close="() => (formOpen = false)"
    />
  </FeatureBaseForm>
</template>

<script setup lang="ts">
import InlineFetchIndicator from "../../shared/components/reusables/InlineFetchIndicator.vue";
import FeatureHeader from "../../shared/components/reusables/FeatureHeader.vue";
import DataLoadingState from "../../shared/components/reusables/DataLoadingState.vue";
import AccountDataTable from "../components/accounts/AccountDataTable.vue";
import FeatureBaseForm from "../../shared/components/reusables/FeatureBaseForm.vue";
import FeatureOfflineState from "../../shared/components/reusables/FeatureOfflineState.vue";
import { useNetworkCheck } from "../../../shared/composables/useNetworkStatus";
import AccountForm from "../components/accounts/AccountForm.vue";
import { computed, onMounted, ref } from "vue";
import { useAccountStore } from "../store/accountStore";

const { isOnline } = useNetworkCheck();
const { createAccount, createAccountMutation, getAdminAccounts, adminFetchError, enableAdmins } =
  useAccountStore();

const isOffline = computed(() => !isOnline.value);

const formOpen = ref(false);
const toggleForm = () => (formOpen.value = !formOpen.value);

onMounted(() => {
  enableAdmins();
});
</script>
