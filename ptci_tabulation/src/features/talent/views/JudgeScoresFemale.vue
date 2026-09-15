<template>
  <section
    class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center"
  >
    <div
      class="w-full max-w-full mt-16 md:mt-12 rounded-2xl"
      :class="
        judgesTalentScoresFemales.isPending
          ? ''
          : 'border border-gray-200'
      "
    >
      <div class="overflow-hidden rounded-2xl">
        <feature-offline-state
          v-if="femaleError.offline || offline"
        />

        <data-loading-state
          v-else-if="judgesTalentScoresFemales.isPending"
        />
        <template v-else>
          <div class="relative">
            <inline-fetch-indicator v-show="judgesTalentScoresFemales.isFetching"/>
            <feature-header
              title="Judges Scores for Females"
              description="View the scoring details provided by judges for female participants."
            />

            <judges-scores-data-table
              type="female"
              :retry-fn="refetchJudgesScoresForFemales"
              :is-fetching="judgesTalentScoresFemales.isFetching"
              :is-server-error="femaleError.serverError"
              :judges-scores-data="judgesTalentScoresFemales.data"
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
import DataLoadingState from "../../shared/components/reusables/DataLoadingState.vue";
import InlineFetchIndicator from "../../shared/components/reusables/InlineFetchIndicator.vue";
import { useJudgesScores } from "../store/useJudgesScores";
import { useNetworkCheck } from "../../../shared/composables/useNetworkStatus";
import { computed, onMounted } from "vue";
import JudgesScoresDataTable from "../components/JudgesScoresDataTable.vue";
const { isOnline } = useNetworkCheck();
const {
  judgesTalentScoresFemales,
  refetchJudgesScoresForFemales,
  enableFemale,
  femaleError,
} = useJudgesScores();

const offline = computed(() => !isOnline.value);
onMounted(() => {
  enableFemale();
});
</script>
