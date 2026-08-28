<template>
  <section
    class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center"
  >
    <div
      class="w-full max-w-full mt-12 rounded-2xl"
      :class="{
        'border border-gray-200': !useLoading['candidates:initialFetching'],
      }"
    >
      <div class="overflow-hidden rounded-2xl">
        <FeatureOfflineState
          v-if="getError['candidates:fetchOffline'] || isOffline"
        />
        <DataLoadingState
          v-else-if="useLoading['candidates:initialFetching']"
        />
        <template v-else>
          <div class="relative">
            <InlineFetchIndicator v-show="useLoading['candidates:fetchRefresh']"/>
            <FeatureHeader
              :has-icon="true"
              :action-fn="toggleForm"
              action-fn-name="Add Candidate"
              title="Manage Candidates"
              action-fn-title="Add new candidate"
              description="View and manage all pageant candidates"
            />
            <CandidateDataTable />
          </div>
        </template>
      </div>
    </div>
  </section>
  <FeatureBaseForm
    :show-form="formOpen"
    title="Add Candidate"
    description="Provide complete candidate details"
  >
    <CandidateForm
      mode="create"
      :on-submit="addCandidate"
      :is-loading="useLoading['candidates:createCandidate']"
      :on-close="() => (formOpen = false)"
    />
  </FeatureBaseForm>
</template>

<script setup lang="ts">
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import InlineFetchIndicator from "../../shared/components/reusables/InlineFetchIndicator.vue";
import FeatureHeader from "../../shared/components/reusables/FeatureHeader.vue";
import DataLoadingState from "../../shared/components/reusables/DataLoadingState.vue";
import CandidateDataTable from "../components/candidates/CandidateDataTable.vue";
import FeatureBaseForm from "../../shared/components/reusables/FeatureBaseForm.vue";
import FeatureOfflineState from "../../shared/components/reusables/FeatureOfflineState.vue";
import { useNetworkCheck } from "../../../shared/composables/useNetworkStatus";
import CandidateForm from "../components/candidates/CandidateForm.vue";
import { computed, ref } from "vue";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useCandidatesStore } from "../store/candidateStore";

const { isOnline } = useNetworkCheck();
const { getError } = useGlobalErrorSetter();
const { addCandidate } = useCandidatesStore();

const { useLoading } = useLoadingStore();
const isOffline = computed(() => !isOnline.value);

const formOpen = ref(false);
const toggleForm = () => (formOpen.value = !formOpen.value);
</script>
