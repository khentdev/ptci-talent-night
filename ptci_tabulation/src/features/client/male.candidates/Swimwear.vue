<template>
  <feature-base-component :is-loading="useLoading['swimwearCandidates:maleInitialFetching']">
    <feature-offline-state v-if="getError['swimwearCandidates:maleFetchOffline'] || offline" />
    <data-loading-state v-else-if="useLoading['swimwearCandidates:maleInitialFetching']" />
    <template v-else>
      <feature-header :popup-fn="openSevenRules" :has-icon="true" title="Male Candidate Swimwear Scores"
        action-fn-name="Submit" action-fn-title="Submit swimwear scores for candidates" popup-fn-name="View Top 7 Rules"
        popup-fn-title="View top 7 rules" :action-fn="openConfirmationModal"
        description="Provide swimwear performance scores for each male contestant." />

      <swimwear-score-data-table input-key-submitted="male-swimwear-submitted" candidate-type="male"
        :retry-fn="refetchMaleSwimwearFeat" ref="swimwearScoreDataTable" input-key="male-swimwear-scores"
        :is-loading="useLoading['swimwearCandidates:maleFetchRefresh']"
        :is-error="getError['swimwearCandidates:maleFetchServerError']" />
    </template>
  </feature-base-component>

  <top-seven-rules :is-dark-bg="true" :is-open="isSevenRulesOpen" :close="() => (isSevenRulesOpen = false)" />
  <popup-modal :show="isModalPopupShown" @close="() => (isModalPopupShown = false)" />
  <confirmation-modal title="Submit Swimwear Scores for Candidates"
    :is-loading="useLoading['swimwearCandidates:createMaleSwimwearScore']"
    description="Once submitted, these scores will be locked and cannot be changed. Please review all fields carefully before confirming."
    :show="isConfirmationShown" :action-fn="handleCreateSwimwearScore" :close="() => isConfirmationShown = false" />
</template>
<script lang="ts" setup>
  import FeatureBaseComponent from '../components/reusables/FeatureBaseComponent.vue';
  import { useLoadingStore } from '../../../shared/store/useLoadingState';
  import FeatureOfflineState from '../../shared/components/reusables/FeatureOfflineState.vue';
  import TopSevenRules from '../components/reusables/TopSevenRules.vue';
  import { useGlobalErrorSetter } from '../../../shared/store/useGlobalErrorState';
  import DataLoadingState from '../../shared/components/reusables/DataLoadingState.vue';
  import ConfirmationModal from '../components/reusables/ConfirmationModal.vue';
  import PopupModal from '../components/reusables/PopupModal.vue';
  import FeatureHeader from '../../shared/components/reusables/FeatureHeader.vue';
  import { computed, onMounted, ref } from 'vue';
  import { useNetworkCheck } from '../../../shared/composables/useNetworkStatus';
  import { useSwimwearStore } from '../store/useSwimwearStore';
  import SwimwearScoreDataTable from '../components/swimwear/SwimwearScoreDataTable.vue';

  const { isOnline } = useNetworkCheck()
  const { getError } = useGlobalErrorSetter()
  const { useLoading } = useLoadingStore()

  const { refetchMaleSwimwearFeat, createSwimwearScoreMale, enableMale } = useSwimwearStore()
  const offline = computed(() => !isOnline.value)

  onMounted(() => {
    enableMale()
  })

  const isSevenRulesOpen = ref(false);
  const openSevenRules = () => {
    isSevenRulesOpen.value = true;
  };
  const swimwearScoreDataTable = ref<InstanceType<
    typeof SwimwearScoreDataTable
  > | null>(null);

  const isModalPopupShown = ref(false);
  const setModalPopupOpen = () => {
    isModalPopupShown.value = true;
  };
  const isConfirmationShown = ref(false);
  const openConfirmationModal = () => {
    if (
      getError["swimwearCandidates:maleFetchOffline"] ||
      getError["swimwearCandidates:maleFetchServerError"] ||
      offline.value
    )
      return;

    const hasMissingFields = swimwearScoreDataTable.value?.validateFields();
    if (hasMissingFields) {
      setModalPopupOpen();
      return;
    }
    isConfirmationShown.value = true;
  };


  const handleCreateSwimwearScore = async () => {
    const scores = swimwearScoreDataTable.value?.candidateScoreInputs;
    if (!scores || !scores.length) return;
    const payload = scores.map((s) => ({
      cand_id: Number(s.candidateId),
      stage_presence: Number(s.stage_presence),
      figure_and_fitness: Number(s.figure_and_fitness),
      poise_and_bearing: Number(s.poise_and_bearing),
      overall_impact: Number(s.overall_impact),
    }));

    await createSwimwearScoreMale(payload);
  }
</script>
