<template>
    <feature-base-table>
        <template #table>
            <feature-server-state :on-retry="retryFn" :title="`Couldn't load ${props.candidateType} candidates`"
                message="There was an issue retrieving candidate data. Please check your connection and try again."
                v-if="isError" />
            <is-empty-state v-else-if="!candidatesQuery" />
            <table :class="TABLE_STYLES.TB" v-else>
                <thead>
                    <tr>
                        <th :class="TABLE_STYLES.TH">Candidate No.</th>
                        <th :class="TABLE_STYLES.TH">Full Name</th>
                        <th :class="TABLE_STYLES.TH">Team</th>
                        <th :class="TABLE_STYLES.TH">Question and Answer (50%)</th>
                        <th :class="TABLE_STYLES.TH">Beauty (50%)</th>
                    </tr>
                </thead>
                <tbody :class="TABLE_STYLES.TBODY">
                    <tr class="hover:bg-gray-50 transition-colors" v-for="c in candidateScoreInputs"
                        :key="c.candidateId!">
                        <td :class="TABLE_STYLES.TD.bold">{{ c.candidateNumber }}</td>
                        <td :class="TABLE_STYLES.TD.bold">{{ FormatFullName(c.candidateName!) }}</td>
                        <td :class="TABLE_STYLES.TD.no_bold">
                            <span class="px-2 py-1 rounded text-xs font-medium text-nowrap"
                                :class="getTeamBadgeClasses(c.candidateTeam)">
                                {{ getFormattedTeamLabel(c.candidateTeam) }}
                            </span>
                        </td>
                        <td :class="TABLE_STYLES.TD.no_bold">
                            <input type="text" v-model="c.qna" :max="SCORE_CRITERIA.qa.max" :disabled="hasSubmitted"
                                @input="clampValues(c)" min="0"
                                class="w-20 px-2 py-1 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-700 hover:border-primary text-center focus:border-primary focus:outline-none transition-colors focus:ring-primary/20 focus:ring-2" />
                        </td>
                        <td :class="TABLE_STYLES.TD.no_bold">
                            <input type="text" v-model="c.beauty" :max="SCORE_CRITERIA.beauty.max" min="0"
                                :disabled="hasSubmitted" @input="clampValues(c)"
                                class="w-20 px-2 py-1 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-700 hover:border-primary text-center focus:border-primary focus:outline-none transition-colors focus:ring-primary/20 focus:ring-2" />
                        </td>

                    </tr>
                </tbody>
            </table>
        </template>
    </feature-base-table>

</template>
<script lang="ts" setup>
    import { computed, watchEffect } from 'vue';
    import FeatureBaseTable from '../../../shared/components/reusables/FeatureBaseTable.vue';
    import IsEmptyState from '../../../shared/components/reusables/IsEmptyState.vue';
    import FeatureServerState from '../../../shared/components/reusables/FeatureServerState.vue';
    import { useLocalStorage } from '@vueuse/core';
    import { TABLE_STYLES } from '../../../shared/constants/tableStyles';
    import { useTopFiveStore } from '../../store/useTopFiveStore';
    import type { CandidateTeamOptions } from '../../types/talent/types';
    import { CapitalizeLabel, FormatFullName } from '../../../../utils/capitalizeWord';

    const { getMaleCandidates, getFemaleCandidates, isSubmitted } = useTopFiveStore()
    const props = defineProps<{
        candidateType: "male" | "female";
        inputKey: string;
        inputKeySubmitted?: string;
        retryFn: () => any;
        isLoading?: boolean;
        isError?: boolean;
    }>();


    const hasSubmitted = computed(() =>
        isSubmitted(props.inputKeySubmitted ?? "")
    );
    type ScoreFields = {
        candidateId: string | null;
        candidateNumber: string | null;
        candidateName: string | null;
        candidateTeam: Capitalize<CandidateTeamOptions>;
        qna: string
        beauty: string
    }

    const SCORE_CRITERIA = {
        qa: { max: 50 },
        beauty: { max: 50 }
    } as const;

    const candidatesQuery = computed(() => props.candidateType === "female" ? getFemaleCandidates : getMaleCandidates)
    const candidateScoreInputs = useLocalStorage<ScoreFields[]>(props.inputKey, [])

    watchEffect(() => {
        const data = candidatesQuery.value.data || []
        if (data.length) {
            const cachedData = candidateScoreInputs.value
            candidateScoreInputs.value = data.map(d => {
                const cached = cachedData.find(c => c.candidateId === d.cand_id)
                return cached ?? {
                    candidateId: d.cand_id,
                    candidateNumber: d.cand_number,
                    candidateName: d.cand_name,
                    candidateTeam: CapitalizeLabel(d.cand_team),
                    qna: "",
                    beauty: ""
                }
            })
        }
    })

    const clampValues = (candidate: ScoreFields) => {
        const sanitize = (value: string) => {

            let cleaned = value.replace(/[^0-9.]/g, "");
            if (!cleaned) return "";

            const decimalIndex = cleaned.indexOf(".");
            if (decimalIndex !== -1) {
                cleaned =
                    cleaned.substring(0, decimalIndex + 1) +
                    cleaned.substring(decimalIndex + 1).replace(/\./g, "");
            }

            const parts = cleaned.split(".");
            let integerPart = parts[0] || "";
            let decimalPart = parts[1] ? parts[1].slice(0, 2) : "";

            integerPart = integerPart.replace(/[^0-9]/g, "").replace(/^0+/, "");

            decimalPart = decimalPart.replace(/[^0-9]/g, "");

            if (!integerPart && decimalPart) {
                integerPart = "1";
            }

            if (cleaned.startsWith(".")) {
                return decimalPart ? `1.${decimalPart}` : "1.0";
            }
            if (cleaned.endsWith(".") && !decimalPart) {
                return integerPart + ".";
            }

            if (decimalPart) {
                return `${integerPart}.${decimalPart}`;
            }

            return integerPart || "1";
        };

        candidate.qna = sanitize(candidate.qna);
        candidate.beauty = sanitize(candidate.beauty);

        if (Number(candidate.qna) >= SCORE_CRITERIA.qa.max) {
            candidate.qna = SCORE_CRITERIA.qa.max.toString();
            candidate.qna = candidate.qna.replace(/\.$/, "");
        }

        if (Number(candidate.beauty) >= SCORE_CRITERIA.beauty.max) {
            candidate.beauty = SCORE_CRITERIA.beauty.max.toString();
            candidate.beauty = candidate.beauty.replace(/\.$/, "");
        }
    };

    const getFormattedTeamLabel = (team: Capitalize<CandidateTeamOptions>) => {
        const teamLower = team.toLowerCase();
        return {
            red: "Red Avengers",
            yellow: "Yellow Predators",
            green: "Green Warriors",
            purple: "Purple Gladiators",
            blue: "Blue Raptors",
        }[teamLower];
    };

    const getTeamBadgeClasses = (team: Capitalize<CandidateTeamOptions> | null) => {
        if (team) {
            const teamLabel = getFormattedTeamLabel(team);
            return teamLabel
                ? {
                    "Red Avengers": "bg-red-400 text-white",
                    "Yellow Predators": "bg-yellow-400 text-gray-800",
                    "Green Warriors": "bg-green-400 text-gray-800",
                    "Purple Gladiators": "bg-purple-400 text-white",
                    "Blue Raptors": "bg-blue-400 text-white",
                }[teamLabel]
                : "";
        }
    };

    const validateFields = () => {
        const hasError = candidateScoreInputs.value.some((c) => {
            return !c.qna || !c.beauty
        });
        return hasError;
    };

    defineExpose({ validateFields, candidateScoreInputs })
</script>