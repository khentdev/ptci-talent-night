<template>
  <feature-base-component :is-loading="useLoading['formalCandidates:maleInitialFetching']">
    <feature-offline-state v-if="getError['formalCandidates:maleFetchOffline'] || offline" />
    <data-loading-state v-else-if="useLoading['formalCandidates:maleInitialFetching']" />
    <template v-else>
      <feature-header :popup-fn="openSevenRules" :has-icon="true" title="Male Candidate Formal Scores"
        action-fn-name="Submit" action-fn-title="Submit formal scores for candidates" popup-fn-name="View Top 7 Rules"
        popup-fn-title="View top 7 rules" :action-fn="openConfirmationModal"
        description="Provide formal performance scores for each male contestant." />

      <formal-score-data-table input-key-submitted="male-formal-submitted" candidate-type="male"
        :retry-fn="refetchMaleFormalFeat" ref="formalScoreDataTable" input-key="male-formal-scores"
        :is-loading="useLoading['formalCandidates:maleFetchRefresh']"
        :is-error="getError['formalCandidates:maleFetchServerError']" />
    </template>
  </feature-base-component>

  <top-seven-rules :is-dark-bg="true" :is-open="isSevenRulesOpen" :close="() => (isSevenRulesOpen = false)" />
  <popup-modal :show="isModalPopupShown" @close="() => (isModalPopupShown = false)" />
  <confirmation-modal title="Submit Formal Scores for Candidates"
    :is-loading="useLoading['formalCandidates:createMaleFormalScore']"
    description="Once submitted, these scores will be locked and cannot be changed. Please review all fields carefully before confirming."
    :show="isConfirmationShown" :action-fn="handleCreateFormalScore" :close="() => isConfirmationShown = false" />
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
  import { useFormalStore } from '../store/useFormalStore';
  import FormalScoreDataTable from '../components/formal/FormalScoreDataTable.vue';

  const { isOnline } = useNetworkCheck()
  const { getError } = useGlobalErrorSetter()
  const { useLoading } = useLoadingStore()

  const { refetchMaleFormalFeat, createFormalScoreMale, enableMale } = useFormalStore()
  const offline = computed(() => !isOnline.value)

  onMounted(() => {
    enableMale()
  })

  const isSevenRulesOpen = ref(false);
  const openSevenRules = () => {
    isSevenRulesOpen.value = true;
  };
  const formalScoreDataTable = ref<InstanceType<
    typeof FormalScoreDataTable
  > | null>(null);

  const isModalPopupShown = ref(false);
  const setModalPopupOpen = () => {
    isModalPopupShown.value = true;
  };
  const isConfirmationShown = ref(false);
  const openConfirmationModal = () => {
    if (
      getError["formalCandidates:maleFetchOffline"] ||
      getError["formalCandidates:maleFetchServerError"] ||
      offline.value
    )
      return;

    const hasMissingFields = formalScoreDataTable.value?.validateFields();
    if (hasMissingFields) {
      setModalPopupOpen();
      return;
    }
    isConfirmationShown.value = true;
  };


  const handleCreateFormalScore = async () => {
    const scores = formalScoreDataTable.value?.candidateScoreInputs;
    if (!scores || !scores.length) return;
    const payload = scores.map((s) => ({
      cand_id: Number(s.candidateId),
      poise_and_bearing: Number(s.poise_and_bearing),
      "personality/projection": Number(s['personality/projection']),
      "appropriateness/ellegance": Number(s['appropriateness/ellegance']),
      overall_impact: Number(s.overall_impact),
    }));

    await createFormalScoreMale(payload);
  }
</script>
