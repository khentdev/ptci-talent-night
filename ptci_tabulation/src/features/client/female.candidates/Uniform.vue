<template>
    <feature-base-component :is-loading="useLoading['uniformCandidates:femaleInitialFetching']">
        <feature-offline-state v-if="getError['uniformCandidates:femaleFetchOffline'] || offline" />
        <data-loading-state v-else-if="useLoading['uniformCandidates:femaleInitialFetching']" />
        <template v-else>
            <feature-header :popup-fn="openSevenRules" :has-icon="true" title="Female Candidate Uniform Scores"
                action-fn-name="Submit" action-fn-title="Submit uniform scores for candidates"
                popup-fn-name="View Top 7 Rules" popup-fn-title="View top 7 rules" :action-fn="openConfirmationModal"
                description="Provide uniform performance scores for each female contestant." />

            <uniform-score-data-table input-key-submitted="female-uniform-submitted" candidate-type="female"
                :retry-fn="refetchFemaleUniformUniformFeat" ref="uniformScoreDataTable" input-key="female-uniform-scores"
                :is-loading="useLoading['uniformCandidates:femaleFetchRefresh']"
                :is-error="getError['uniformCandidates:femaleFetchServerError']" />
        </template>
    </feature-base-component>

    <top-seven-rules :is-dark-bg="true" :is-open="isSevenRulesOpen" :close="() => (isSevenRulesOpen = false)" />
    <popup-modal :show="isModalPopupShown" @close="() => (isModalPopupShown = false)" />
    <confirmation-modal title="Submit Uniform Scores for Candidates"
        :is-loading="useLoading['uniformCandidates:createFemaleUniformScore']"
        description="Once submitted, these scores will be locked and cannot be changed. Please review all fields carefully before confirming."
        :show="isConfirmationShown" :action-fn="handleCreateUniformScore" :close="() => isConfirmationShown = false" />
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
    import { useUniformStore } from '../store/useUniformStore';
    import UniformScoreDataTable from '../components/uniform/UniformScoreDataTable.vue';

    const { isOnline } = useNetworkCheck()
    const { getError } = useGlobalErrorSetter()
    const { useLoading } = useLoadingStore()

    const { refetchFemaleUniformUniformFeat, createUniformScoreFemale, enableFemale } = useUniformStore()
    const offline = computed(() => !isOnline.value)

    onMounted(() => {
        enableFemale()
    })

    const isSevenRulesOpen = ref(false);
    const openSevenRules = () => {
        isSevenRulesOpen.value = true;
    };
    const uniformScoreDataTable = ref<InstanceType<
        typeof UniformScoreDataTable
    > | null>(null);

    const isModalPopupShown = ref(false);
    const setModalPopupOpen = () => {
        isModalPopupShown.value = true;
    };
    const isConfirmationShown = ref(false);
    const openConfirmationModal = () => {
        if (
            getError["uniformCandidates:femaleFetchOffline"] ||
            getError["uniformCandidates:femaleFetchServerError"] ||
            offline.value
        )
            return;

        const hasMissingFields = uniformScoreDataTable.value?.validateFields();
        if (hasMissingFields) {
            setModalPopupOpen();
            return;
        }
        isConfirmationShown.value = true;
    };


    const handleCreateUniformScore = async () => {
        const scores = uniformScoreDataTable.value?.candidateScoreInputs;
        if (!scores || !scores.length) return;
        const payload = scores.map((s) => ({
            cand_id: Number(s.candidateId),
            poise_and_bearings: Number(s.poise_and_bearings),
            personality_and_projection: Number(s.personality_and_projection),
            neatness: Number(s.neatness),
            overall_impact: Number(s.overall_impact)
        }));

        await createUniformScoreFemale(payload);
    }
</script>
