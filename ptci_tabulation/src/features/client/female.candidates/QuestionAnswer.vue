<template>
    <feature-base-component :is-loading="useLoading['questionAnswerCandidates:femaleInitialFetching']">
        <feature-offline-state v-if="getError['questionAnswerCandidates:femaleFetchOffline'] || offline" />
        <data-loading-state v-else-if="useLoading['questionAnswerCandidates:femaleInitialFetching']" />
        <template v-else>
            <feature-header :popup-fn="openSevenRules" :has-icon="true"
                title="Female Candidate Question and Answer Scores" action-fn-name="Submit"
                action-fn-title="Submit question and Answer scores for candidates" popup-fn-name="View Top 7 Rules"
                popup-fn-title="View top 7 rules" :action-fn="openConfirmationModal"
                description="Provide question and answer performance scores for each female contestant." />

            <question-answer-data-table input-key-submitted="female-questionAnswer-submitted" candidate-type="female"
                :retry-fn="refetchFemaleQuestionAnswerFeat" ref="questionAnswerScoreDataTable"
                input-key="female-questionAnswer-scores"
                :is-loading="useLoading['questionAnswerCandidates:femaleFetchRefresh']"
                :is-error="getError['questionAnswerCandidates:femaleFetchServerError']" />
        </template>
    </feature-base-component>

    <top-seven-rules :is-dark-bg="true" :is-open="isSevenRulesOpen" :close="() => (isSevenRulesOpen = false)" />
    <popup-modal :show="isModalPopupShown" @close="() => (isModalPopupShown = false)" />
    <confirmation-modal title="Submit Question and Answer Scores for Candidates"
        :is-loading="useLoading['questionAnswerCandidates:createFemaleQuestionAnswerScore']"
        description="Once submitted, these scores will be locked and cannot be changed. Please review all fields carefully before confirming."
        :show="isConfirmationShown" :action-fn="handleCreateQuestionAnswerScore"
        :close="() => isConfirmationShown = false" />
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
    import { useQuestionAnswerStore } from '../store/useQuestionAnswerStore';
    import QuestionAnswerDataTable from '../components/questionanswer/QuestionAnswerDataTable.vue';

    const { isOnline } = useNetworkCheck()
    const { getError } = useGlobalErrorSetter()
    const { useLoading } = useLoadingStore()

    const { refetchFemaleQuestionAnswerFeat, createQuestionAnswerScoreFemale, enableFemale } = useQuestionAnswerStore()
    const offline = computed(() => !isOnline.value)

    onMounted(() => {
        enableFemale()
    })

    const isSevenRulesOpen = ref(false);
    const openSevenRules = () => {
        isSevenRulesOpen.value = true;
    };
    const questionAnswerScoreDataTable = ref<InstanceType<
        typeof QuestionAnswerDataTable
    > | null>(null);

    const isModalPopupShown = ref(false);
    const setModalPopupOpen = () => {
        isModalPopupShown.value = true;
    };
    const isConfirmationShown = ref(false);
    const openConfirmationModal = () => {
        if (
            getError["questionAnswerCandidates:femaleFetchOffline"] ||
            getError["questionAnswerCandidates:femaleFetchServerError"] ||
            offline.value
        )
            return;

        const hasMissingFields = questionAnswerScoreDataTable.value?.validateFields();
        if (hasMissingFields) {
            setModalPopupOpen();
            return;
        }
        isConfirmationShown.value = true;
    };


    const handleCreateQuestionAnswerScore = async () => {
        const scores = questionAnswerScoreDataTable.value?.candidateScoreInputs;
        if (!scores || !scores.length) return;
        const payload = scores.map((s) => ({
            cand_id: Number(s.candidateId),
            total_score: Number(s.total_score)
        }));

        await createQuestionAnswerScoreFemale(payload);
    }
</script>
