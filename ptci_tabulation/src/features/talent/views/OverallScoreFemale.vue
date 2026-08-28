<template>
  <section class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center">
    <div class="w-full max-w-full mt-16 md:mt-12 rounded-2xl">
      <div class="overflow-hidden rounded-2xl">
        <feature-offline-state v-if="getError['overallScoreFemale:fetchOffline'] || offline" />
        <data-loading-state v-else-if="useLoading['overallTalentScoreFemale:initialFetch']" />
        <template v-else>
          <div class="relative">
            <inline-fetch-indicator v-show="useLoading['overallTalentScoreFemale:fetchRefresh']" />
            <feature-header title="Overall Scores for Females"
              description="Shows the total scores of all female contestants based on judges’ evaluations." />
            <overall-score-data-table :is-server-error="getError['overallScoreFemale:fetchServerError']"
              :retry-fn="refetchOverallScoreFemale" :overall-scores="getOverallScoreFemale.data" type="female" />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { useLoadingStore } from "../../../shared/store/useLoadingState";
  import FeatureOfflineState from "../../shared/components/reusables/FeatureOfflineState.vue";
  import OverallScoreDataTable from "../components/OverallScoreDataTable.vue";
  import DataLoadingState from "../../shared/components/reusables/DataLoadingState.vue";
  import InlineFetchIndicator from "../../shared/components/reusables/InlineFetchIndicator.vue";
  import { useNetworkCheck } from "../../../shared/composables/useNetworkStatus";
  import FeatureHeader from "../../shared/components/reusables/FeatureHeader.vue";
  import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
  import { useOverallTalentScore } from "../store/useOverallTalentScore";
  import { onMounted, computed } from "vue";

  const { isOnline } = useNetworkCheck()
  const { getOverallScoreFemale, enableFemale, refetchOverallScoreFemale } = useOverallTalentScore();
  onMounted(() => {
    enableFemale();
  });

  const offline = computed(() => !isOnline.value)
  const { getError } = useGlobalErrorSetter();
  const { useLoading } = useLoadingStore();
</script>
