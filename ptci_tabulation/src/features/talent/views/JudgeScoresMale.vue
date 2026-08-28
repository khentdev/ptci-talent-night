<template>
  <section
    class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center"
  >
    <div
      class="w-full max-w-full mt-16 md:mt-12 rounded-2xl"
      :class="
        useLoading['judgesScoresMale:initialFetching']
          ? ''
          : 'border border-gray-200'
      "
    >
      <div class="overflow-hidden rounded-2xl">
        <feature-offline-state
          v-if="getError['judgesScoresMale:fetchOffline'] || offline"
        />

        <data-loading-state
          v-else-if="useLoading['judgesScoresMale:initialFetching']"
        />
        <template v-else>
          <div class="relative">
            <inline-fetch-indicator v-show="useLoading['judgesScoresMale:fetchRefresh']" />
            <feature-header
              title="Judges Scores for Males"
              description="View the scoring details provided by judges for male participants."
            />

            <judges-scores-data-table
              type="male"
              :retry-fn="refetchJudgesScoresForMales"
              :is-fetching="useLoading['judgesScoresMale:fetchRefresh']"
              :is-server-error="getError['judgesScoresMale:fetchServerError']"
              :judges-scores-data="judgesTalentScoresMales.data"
            />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import FeatureHeader from "../../shared/components/reusables/FeatureHeader.vue";
import FeatureOfflineState from "../../shared/components/reusables/FeatureOfflineState.vue";
import InlineFetchIndicator from "../../shared/components/reusables/InlineFetchIndicator.vue";
import DataLoadingState from "../../shared/components/reusables/DataLoadingState.vue";
import { useJudgesScores } from "../store/useJudgesScores";
import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";
import { useNetworkCheck } from "../../../shared/composables/useNetworkStatus";
import { computed, onMounted } from "vue";
import { useLoadingStore } from "../../../shared/store/useLoadingState";
import JudgesScoresDataTable from "../components/JudgesScoresDataTable.vue";
const { isOnline } = useNetworkCheck();
const { getError } = useGlobalErrorSetter();
const { useLoading } = useLoadingStore();
const { judgesTalentScoresMales, refetchJudgesScoresForMales, enableMale } =
  useJudgesScores();

const offline = computed(() => !isOnline.value);
onMounted(() => {
  enableMale();
});
</script>
