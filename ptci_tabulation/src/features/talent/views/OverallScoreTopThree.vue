<template>
  <section class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center gap-8">
    <feature-offline-state v-if="offline" />
    <template v-else>
      <div class="w-full max-w-full mt-16 md:mt-12 rounded-2xl">
        <div class="overflow-hidden rounded-2xl relative">
          <data-loading-state v-if="getOverallScoreMale.isPending" />
          <template v-else>
            <inline-fetch-indicator v-show="getOverallScoreMale.isFetching" />
            <feature-header title="Top 3 Males"
              description="Shows the top 3 ranked male contestants based on judges’ evaluations." />
            <top-three-data-table :is-server-error="maleError.serverError" :retry-fn="refetchOverallScoreMale"
              :candidates="top3Male" type="male" />
          </template>
        </div>
      </div>

      <div class="w-full max-w-full rounded-2xl">
        <div class="overflow-hidden rounded-2xl relative">
          <data-loading-state v-if="getOverallScoreFemale.isPending" />
          <template v-else>
            <inline-fetch-indicator v-show="getOverallScoreFemale.isFetching" />
            <feature-header title="Top 3 Females"
              description="Shows the top 3 ranked female contestants based on judges’ evaluations." />
            <top-three-data-table :is-server-error="femaleError.serverError" :retry-fn="refetchOverallScoreFemale"
              :candidates="top3Female" type="female" />
          </template>
        </div>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
  import FeatureOfflineState from "../../shared/components/reusables/FeatureOfflineState.vue";
  import TopThreeDataTable from "../components/TopThreeDataTable.vue";
  import DataLoadingState from "../../shared/components/reusables/DataLoadingState.vue";
  import InlineFetchIndicator from "../../shared/components/reusables/InlineFetchIndicator.vue";
  import { useNetworkCheck } from "../../../shared/composables/useNetworkStatus";
  import FeatureHeader from "../../shared/components/reusables/FeatureHeader.vue";
  import { useOverallTalentScore } from "../store/useOverallTalentScore";
  import { onMounted, computed } from "vue";

  const { isOnline } = useNetworkCheck()
  const {
    getOverallScoreMale, getOverallScoreFemale,
    enableMale, enableFemale,
    refetchOverallScoreMale, refetchOverallScoreFemale,
    maleError, femaleError,
  } = useOverallTalentScore();

  onMounted(() => {
    enableMale();
    enableFemale();
  });

  const offline = computed(() => !isOnline.value || maleError.offline || femaleError.offline)
  const top3Male = computed(() => getOverallScoreMale.data?.slice(0, 3))
  const top3Female = computed(() => getOverallScoreFemale.data?.slice(0, 3))
</script>
