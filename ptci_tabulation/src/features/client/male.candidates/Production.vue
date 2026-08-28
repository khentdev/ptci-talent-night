<template>
  <feature-base-component :is-loading="useLoading['productionCandidates:maleInitialFetching']">

    <feature-offline-state v-if="getError['productionCandidates:maleFetchOffline'] || offline" />
    <data-loading-state v-else-if="useLoading['productionCandidates:maleInitialFetching']" />
    <template v-else>
      <feature-header :popup-fn="openSevenRules" :has-icon="true" title="Male Candidate Production Scores"
        action-fn-name="Submit" action-fn-title="Submit production scores for candidates"
        popup-fn-name="View Top 7 Rules" popup-fn-title="View top 7 rules" :action-fn="openConfirmationModal"
        description="Provide production performance scores for each male contestant." />

      <production-score-data-table input-key-submitted="male-production-submitted" candidate-type="male"
        :retry-fn="refetchMaleCandidatesProductionFeat" ref="productionScoreDataTable"
        input-key="male-production-scores" :is-loading="useLoading['productionCandidates:maleFetchRefresh']"
        :is-error="getError['productionCandidates:maleFetchServerError']" />
    </template>
  </feature-base-component>

  <top-seven-rules :is-dark-bg="true" :is-open="isSevenRulesOpen" :close="() => (isSevenRulesOpen = false)" />
  <popup-modal :show="isModalPopupShown" @close="() => (isModalPopupShown = false)" />
  <confirmation-modal title="Submit Production Scores for Candidates"
    :is-loading="useLoading['productionCandidates:createMaleProductionScore']"
    description="Once submitted, these scores will be locked and cannot be changed. Please review all fields carefully before confirming."
    :show="isConfirmationShown" :action-fn="handleCreateProductionScore" :close="() => isConfirmationShown = false" />
</template>
<script lang="ts" setup>
  import FeatureBaseComponent from '../components/reusables/FeatureBaseComponent.vue';
  import { useLoadingStore } from '../../../shared/store/useLoadingState';
  import FeatureOfflineState from '../../shared/components/reusables/FeatureOfflineState.vue';
  import TopSevenRules from '../components/reusables/TopSevenRules.vue';
  import ProductionScoreDataTable from '../components/production/ProductionScoreDataTable.vue';
  import { useGlobalErrorSetter } from '../../../shared/store/useGlobalErrorState';
  import DataLoadingState from '../../shared/components/reusables/DataLoadingState.vue';
  import ConfirmationModal from '../components/reusables/ConfirmationModal.vue';
  import PopupModal from '../components/reusables/PopupModal.vue';
  import FeatureHeader from '../../shared/components/reusables/FeatureHeader.vue';
  import { computed, onMounted, ref } from 'vue';
  import { useNetworkCheck } from '../../../shared/composables/useNetworkStatus';
  import { useProductionStore } from '../store/useProductionStore';

  const { isOnline } = useNetworkCheck()
  const { getError } = useGlobalErrorSetter()
  const { useLoading } = useLoadingStore()

  const { refetchMaleCandidatesProductionFeat, createProductionScoreMale, enableMale } = useProductionStore()
  const offline = computed(() => !isOnline.value)
  onMounted(() => {
    enableMale()
  })

  const isSevenRulesOpen = ref(false);
  const openSevenRules = () => {
    isSevenRulesOpen.value = true;
  };
  const productionScoreDataTable = ref<InstanceType<
    typeof ProductionScoreDataTable
  > | null>(null);

  const isModalPopupShown = ref(false);
  const setModalPopupOpen = () => {
    isModalPopupShown.value = true;
  };
  const isConfirmationShown = ref(false);
  const openConfirmationModal = () => {
    if (
      getError["productionCandidates:femaleFetchOffline"] ||
      getError["productionCandidates:femaleFetchServerError"] ||
      offline.value
    )
      return;

    const hasMissingFields = productionScoreDataTable.value?.validateFields();
    if (hasMissingFields) {
      setModalPopupOpen();
      return;
    }
    isConfirmationShown.value = true;
  };


  const handleCreateProductionScore = async () => {
    const scores = productionScoreDataTable.value?.candidateScoreInputs;
    if (!scores || !scores.length) return;
    const payload = scores.map((s) => ({
      cand_id: Number(s.candidateId),
      choreography: Number(s.choreography),
      projection: Number(s.projection),
      audience_impact: Number(s.audience_impact)
    }));

    await createProductionScoreMale(payload);
  }
</script>
