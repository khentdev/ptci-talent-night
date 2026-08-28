<template>
  <section class="min-h-screen p-3 overflow-x-auto flex flex-col items-center justify-center">
    <div class="w-full max-w-full mt-16 md:mt-12 rounded-2xl" :class="{
      'border border-gray-200':
        !useLoading['talentCandidates:maleInitialFetching'],
    }">
      <div class="overflow-hidden rounded-2xl">
        <feature-offline-state v-if="getError['talentCandidates:maleFetchOffline'] || offline" />
        <data-loading-state v-else-if="useLoading['talentCandidates:maleInitialFetching']" />
        <template v-else>
          <feature-header :popup-fn="openSevenRules" popup-fn-name="View Top 7 Rules" popup-fn-title="View top 7 rules"
            :action-fn="openConfirmationModal" :has-icon="true" title="Male Candidate Talent Scores"
            action-fn-name="Submit" action-fn-title="Submit talent scores for candidates"
            description="Provide talent performance scores for each male contestant." />

          <talent-candidates-data-table :is-loading="useLoading['talentCandidates:maleFetchRefresh']"
            :is-error="getError['talentCandidates:maleFetchServerError']" :retry-fn="refetchMaleCandidatesTalentFeat"
            candidate-type="male" input-key="male-talent-scores" ref="talentCandidatesDataTableRef" />
        </template>
      </div>
    </div>
  </section>
  <popup-modal :show="isModalPopupShown" @close="() => (isModalPopupShown = false)" />
  <ConfirmationModal :show="isConfirmationShown" :action-fn="handleSubmitScores" action-fn-name="Submit"
    title="Submit Talent Scores for Candidates"
    description="Once submitted, these scores will be locked and cannot be changed. Please review all fields carefully before confirming."
    :close="() => (isConfirmationShown = false)" :is-loading="useLoading['talentCandidates:createMaleTalentScore']" />
  <top-seven-rules :is-dark-bg="true" :is-open="isSevenRulesOpen" :close="() => (isSevenRulesOpen = false)" />
</template>

<script lang="ts" setup>
  import FeatureHeader from "../../shared/components/reusables/FeatureHeader.vue";
  import TalentCandidatesDataTable from "../components/candidates/TalentCandidatesDataTable.vue";
  import ConfirmationModal from "../components/reusables/ConfirmationModal.vue";
  import DataLoadingState from "../../shared/components/reusables/DataLoadingState.vue";
  import PopupModal from "../components/reusables/PopupModal.vue";
  import FeatureOfflineState from "../../shared/components/reusables/FeatureOfflineState.vue";
  import TopSevenRules from "../components/reusables/TopSevenRules.vue";
  import { useTalentStore } from "../store/useTalentStore";
  import { useNetworkCheck } from "../../../shared/composables/useNetworkStatus";
  import { computed, onMounted, ref } from "vue";
  import { useLoadingStore } from "../../../shared/store/useLoadingState";
  import { useGlobalErrorSetter } from "../../../shared/store/useGlobalErrorState";

  const { isOnline } = useNetworkCheck();
  const offline = computed(() => !isOnline.value);

  const { getError } = useGlobalErrorSetter();
  const { useLoading } = useLoadingStore();
  const { createMaleTalentScore, refetchMaleCandidatesTalentFeat, enableMale } =
    useTalentStore();

  onMounted(() => {
    enableMale();
  });

  const isSevenRulesOpen = ref(false);
  const openSevenRules = () => {
    isSevenRulesOpen.value = true;
  };


  const talentCandidatesDataTableRef = ref<InstanceType<
    typeof TalentCandidatesDataTable
  > | null>(null);

  const isModalPopupShown = ref(false);
  const setModalPopupOpen = () => {
    isModalPopupShown.value = true;
  };

  const isConfirmationShown = ref(false);
  const openConfirmationModal = () => {
    if (
      getError["talentCandidates:maleFetchOffline"] ||
      getError["talentCandidates:maleFetchServerError"] ||
      offline.value
    )
      return;
    // I'll handle the server error here if user attempt to click the actionFn, they can't open it or trigger the modals; nothing will happen
    // If server error or user is offline I will return nothing if this Fn triggered
    const hasMissingFields = talentCandidatesDataTableRef.value?.validateFields();
    if (hasMissingFields) {
      setModalPopupOpen();
      return;
    }
    isConfirmationShown.value = true;
  };

  const handleSubmitScores = async () => {
    const scores = talentCandidatesDataTableRef.value?.candidateScoreInputs;
    if (!scores || !scores.length) return;
    const payload = scores.map((s) => ({
      cand_id: Number(s.candidateId),
      mastery: Number(s.mastery),
      performance_choreography: Number(s.performance),
      overall_impression: Number(s.impression),
      audience_impact: Number(s.audience),
    }));

    await createMaleTalentScore(payload);
  };
</script>
