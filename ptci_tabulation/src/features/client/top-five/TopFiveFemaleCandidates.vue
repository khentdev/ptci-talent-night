<template>
    <feature-base-component :is-loading="useLoading['topFiveCandidates:femaleInitialFetching']">
        <feature-offline-state v-if="getError['topFiveCandidates:femaleFetchOffline'] || offline" />
        <data-loading-state v-else-if="useLoading['topFiveCandidates:femaleInitialFetching']" />
        <template v-else>
            <feature-header :popup-fn="openSevenRules" :has-icon="true" title="Female Candidate Top Five Scores"
                action-fn-name="Submit" action-fn-title="Submit top five scores for candidates"
                popup-fn-name="View Top 7 Rules" popup-fn-title="View top 7 rules" :action-fn="openConfirmationModal"
                description="Provide top five performance scores for each female contestant." />

            <top-five-score-data-table input-key-submitted="female-topFive-submitted" candidate-type="female"
                :retry-fn="refetchFemaleTopFiveFeat" ref="topFiveScoreDataTable" input-key="female-topFive-scores"
                :is-loading="useLoading['topFiveCandidates:femaleFetchRefresh']"
                :is-error="getError['topFiveCandidates:femaleFetchServerError']" />
        </template>
    </feature-base-component>

    <top-seven-rules :is-dark-bg="true" :is-open="isSevenRulesOpen" :close="() => (isSevenRulesOpen = false)" />
    <popup-modal :show="isModalPopupShown" @close="() => (isModalPopupShown = false)" />
    <confirmation-modal title="Submit Top Five Scores for Candidates"
        :is-loading="useLoading['topFiveCandidates:createFemaleTopFiveScore']"
        description="Once submitted, these scores will be locked and cannot be changed. Please review all fields carefully before confirming."
        :show="isConfirmationShown" :action-fn="handleCreateTopFiveScore" :close="() => isConfirmationShown = false" />
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
    import { useTopFiveStore } from '../store/useTopFiveStore';
    import TopFiveScoreDataTable from '../components/top-five/TopFiveScoreDataTable.vue';

    const { isOnline } = useNetworkCheck()
    const { getError } = useGlobalErrorSetter()
    const { useLoading } = useLoadingStore()

    const { refetchFemaleTopFiveFeat, createTopFiveScoreFemale, enableFemale } = useTopFiveStore()
    const offline = computed(() => !isOnline.value)

    onMounted(() => {
        enableFemale()
    })

    const isSevenRulesOpen = ref(false);
    const openSevenRules = () => {
        isSevenRulesOpen.value = true;
    };
    const topFiveScoreDataTable = ref<InstanceType<
        typeof TopFiveScoreDataTable
    > | null>(null);

    const isModalPopupShown = ref(false);
    const setModalPopupOpen = () => {
        isModalPopupShown.value = true;
    };
    const isConfirmationShown = ref(false);
    const openConfirmationModal = () => {
        if (
            getError["topFiveCandidates:femaleFetchOffline"] ||
            getError["topFiveCandidates:femaleFetchServerError"] ||
            offline.value
        )
            return;

        const hasMissingFields = topFiveScoreDataTable.value?.validateFields();
        if (hasMissingFields) {
            setModalPopupOpen();
            return;
        }
        isConfirmationShown.value = true;
    };


    const handleCreateTopFiveScore = async () => {
        const scores = topFiveScoreDataTable.value?.candidateScoreInputs;
        if (!scores || !scores.length) return;
        const payload = scores.map((s) => ({
            cand_id: Number(s.candidateId),
            qna: Number(s.qna),
            beauty: Number(s.beauty)
        }));

        await createTopFiveScoreFemale(payload);
    }
</script>
