<template>
  <section
    class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center"
  >
    <div
      class="w-full max-w-full mt-12 rounded-2xl"
      :class="{
        'border border-gray-200': !getCandidates.isPending,
      }"
    >
      <div class="overflow-hidden rounded-2xl">
        <FeatureOfflineState
          v-if="fetchError.offline || isOffline"
        />
        <DataLoadingState
          v-else-if="getCandidates.isPending"
        />
        <template v-else>
          <div class="relative">
            <InlineFetchIndicator v-show="getCandidates.isFetching"/>
            <FeatureHeader
              :has-icon="true"
              :action-fn="toggleForm"
              action-fn-name="Add Candidate"
              title="Manage Candidates"
              action-fn-title="Add new candidate"
              description="View and manage all Talent Night candidates"
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
      :is-loading="addCandidateMutation.isPending"
      :on-close="() => (formOpen = false)"
    />
  </FeatureBaseForm>
</template>

<script setup lang="ts">
import InlineFetchIndicator from "../../shared/components/reusables/InlineFetchIndicator.vue";
import FeatureHeader from "../../shared/components/reusables/FeatureHeader.vue";
import DataLoadingState from "../../shared/components/reusables/DataLoadingState.vue";
import CandidateDataTable from "../components/candidates/CandidateDataTable.vue";
import FeatureBaseForm from "../../shared/components/reusables/FeatureBaseForm.vue";
import FeatureOfflineState from "../../shared/components/reusables/FeatureOfflineState.vue";
import { useNetworkCheck } from "../../../shared/composables/useNetworkStatus";
import CandidateForm from "../components/candidates/CandidateForm.vue";
import { computed, ref } from "vue";
import { useCandidatesStore } from "../store/candidateStore";

const { isOnline } = useNetworkCheck();
const { addCandidate, addCandidateMutation, getCandidates, fetchError } =
  useCandidatesStore();

const isOffline = computed(() => !isOnline.value);

const formOpen = ref(false);
const toggleForm = () => (formOpen.value = !formOpen.value);
</script>
