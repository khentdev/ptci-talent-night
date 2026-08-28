<template>
    <feature-base-table>
        <template #table>
            <feature-server-state :on-retry="retryFn" v-if="isServerError" :title="`Couldn't load uniform score for ${type === 'female' ? 'females' : 'males'
                }`" :message="`There was an issue retrieving uniform scores for ${type === 'female' ? 'females' : 'males'
                    }. Please check your connection and try again.`" />
            <is-empty-state v-else-if="!uniformScoresData" />
            <table :class="TABLE_STYLES.TB" v-else>
                <thead :class="TABLE_STYLES.THEADROW">
                    <tr>
                        <th :class="TABLE_STYLES.TH">Candidate No.</th>
                        <th :class="TABLE_STYLES.TH">Candidate Team</th>
                        <th :class="TABLE_STYLES.TH">Candidate Name</th>
                        <th :class="TABLE_STYLES.TH">Candidate Gender</th>
                        <th :class="TABLE_STYLES.TH">Poise and Bearings</th>
                        <th :class="TABLE_STYLES.TH">Personality and Projection</th>
                        <th :class="TABLE_STYLES.TH">Neatness</th>
                        <th :class="TABLE_STYLES.TH">Overall Impact</th>
                        <th :class="TABLE_STYLES.TH">Total Score</th>
                    </tr>
                </thead>
                <tbody :class="TABLE_STYLES.TBODY">
                    <tr class="hover:bg-gray-50 transition-colors" v-for="c in uniformScoresData" :key="c.cand_id">
                        <td :class="TABLE_STYLES.TD.bold">{{ c.cand_number }}</td>
                        <td :class="TABLE_STYLES.TD.no_bold">{{ FormatFullName(c.cand_name) }}</td>
                        <td :class="TABLE_STYLES.TD.no_bold">
                            <span :class="getTeamBadgeClasses((c.cand_team))"
                                class="px-2 py-1 rounded text-xs font-medium">{{
                                    CapitalizeLabel(c.cand_team)
                                }}
                            </span>
                        </td>
                        <td :class="TABLE_STYLES.TD.no_bold">
                            <span class="px-2 py-1 rounded text-xs font-medium"
                                :class="getGenderBadgeClasses(c.cand_gender)">
                                {{ CapitalizeLabel(c.cand_gender) }}
                            </span>
                        </td>

                        <td :class="TABLE_STYLES.TD.no_bold">{{ c.poise_and_bearings }}</td>
                        <td :class="TABLE_STYLES.TD.no_bold">{{ c.personality_and_projection }}</td>
                        <td :class="TABLE_STYLES.TD.no_bold">{{ c.neatness }}</td>
                        <td :class="TABLE_STYLES.TD.no_bold">{{ c.overall_impact }}</td>
                        <td :class="TABLE_STYLES.TD.bold">{{ c.total_score }}</td>
                    </tr>
                </tbody>
            </table>
        </template>
    </feature-base-table>

</template>
<script lang="ts" setup>
    import FeatureServerState from '../../shared/components/reusables/FeatureServerState.vue';
    import { TABLE_STYLES } from '../../shared/constants/tableStyles';
    import IsEmptyState from '../../shared/components/reusables/IsEmptyState.vue';
    import { CapitalizeLabel, FormatFullName } from '../../../utils/capitalizeWord';
    import FeatureBaseTable from '../../shared/components/reusables/FeatureBaseTable.vue';
    import type { CandidateTeamOptions, UniformScores } from '../types/uniformScore';

    defineProps<{
        uniformScoresData?: UniformScores;
        type: "male" | "female";
        isFetching?: boolean;
        isServerError?: boolean;
        retryFn: () => any;
    }>();

    const getTeamBadgeClasses = (team: CandidateTeamOptions) => {
        const teamLower = team.toLowerCase();
        return {
            red: "bg-red-400 text-white",
            yellow: "bg-yellow-400 text-gray-800",
            green: "bg-green-400 text-gray-800",
            purple: "bg-purple-400 text-white",
            blue: "bg-blue-400 text-white",
        }[teamLower];
    };

    const getGenderBadgeClasses = (gender: "male" | "female" | "other") => {
        const genderLower = gender.toLowerCase();
        return {
            male: "bg-blue-100 text-blue-800",
            female: "bg-pink-100 text-pink-800",
            other: "bg-gray-100 text-gray-700",
        }[genderLower];
    };
</script>