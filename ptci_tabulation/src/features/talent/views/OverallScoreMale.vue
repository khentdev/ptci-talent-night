<template>
  <section class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center">
    <div class="w-full max-w-full mt-16 md:mt-12 rounded-2xl">
      <div class="overflow-hidden rounded-2xl">
        <feature-offline-state v-if="getError['overallScoreMale:fetchOffline'] || offline" />
        <data-loading-state v-else-if="useLoading['overallTalentScoreMale:initialFetch']" />
        <template v-else>
          <div class="relative">
            <inline-fetch-indicator v-show="useLoading['overallTalentScoreMale:fetchRefresh']" />
            <feature-header title="Overall Scores for Males"
              description="Shows the total scores of all male contestants based on judges’ evaluations." />
            <overall-score-data-table :is-server-error="getError['overallScoreMale:fetchServerError']"
              :retry-fn="refetchOverallScoreMale" :overall-scores="getOverallScoreMale.data" type="male" />
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
  const { getOverallScoreMale, enableMale, refetchOverallScoreMale } = useOverallTalentScore();
  onMounted(() => {
    enableMale();
  });

  const offline = computed(() => !isOnline.value)
  const { getError } = useGlobalErrorSetter();
  const { useLoading } = useLoadingStore();
</script>
