<template>
  <section class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center">
    <div class="w-full max-w-full mt-12 rounded-2xl" :class="useLoading['uniformScoresMale:initialFetching']
      ? ''
      : 'border border-gray-200'
      ">
      <div class="overflow-hidden rounded-2xl">
        <feature-offline-state v-if="getError['uniformScoreMale:fetchOffline'] || offline" />
        <data-loading-state v-else-if="useLoading['uniformScoresMale:initialFetching']" />
        <template v-else>
          <div class="relative">
            <inline-fetch-indicator v-show="useLoading['uniformScoresMale:fetchRefresh']" />
            <feature-header title="Uniform Scores for Males"
              description="View and manage all uniform scores of candidates" />
            <uniform-scores-data-table :retry-fn="refetchGetMaleUniformScores" type="male"
              :uniform-scores-data="getMaleUniformScores.data"
              :is-server-error="getError['uniformScoreMale:fetchServerError']" />
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import DataLoadingState from '../../../shared/components/reusables/DataLoadingState.vue';
  import UniformScoresDataTable from '../../components/UniformScoresDataTable.vue';
  import FeatureHeader from '../../../shared/components/reusables/FeatureHeader.vue';
  import { useUniformScores } from '../../store/useUniformScores';
  import InlineFetchIndicator from '../../../shared/components/reusables/InlineFetchIndicator.vue';
  import { computed, onMounted } from 'vue';
  const { refetchGetMaleUniformScores, getMaleUniformScores, enableMale } = useUniformScores()
  import { useGlobalErrorSetter } from '../../../../shared/store/useGlobalErrorState';
  import FeatureOfflineState from '../../../shared/components/reusables/FeatureOfflineState.vue';
  import { useNetworkCheck } from '../../../../shared/composables/useNetworkStatus';
  import { useLoadingStore } from '../../../../shared/store/useLoadingState';


  const { isOnline } = useNetworkCheck()
  const { useLoading } = useLoadingStore()
  const { getError } = useGlobalErrorSetter()


  const offline = computed(() => !isOnline.value)
  onMounted(() => {
    enableMale()
  })
</script>