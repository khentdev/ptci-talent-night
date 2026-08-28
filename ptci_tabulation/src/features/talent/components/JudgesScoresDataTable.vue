<template>
  <feature-base-table>
    <template #table>
      <feature-server-state
        v-if="isServerError"
        :on-retry="retryFn"
        :title="`Couldn't load judges score for ${
          type === 'female' ? 'females' : 'males'
        }`"
        :message="`There was an issue retrieving judge scores for ${
          type === 'female' ? 'females' : 'males'
        }. Please check your connection and try again.`"
      />
      <is-empty-state v-else-if="!judgesScoresData" />
      <table :class="TABLE_STYLES.TB" v-else>
        <thead :class="TABLE_STYLES.THEADROW">
          <tr>
            <th :class="TABLE_STYLES.TH">Judge</th>
            <th :class="TABLE_STYLES.TH">Candidate No.</th>
            <th :class="TABLE_STYLES.TH">Team</th>
            <th :class="TABLE_STYLES.TH">Name</th>
            <th :class="TABLE_STYLES.TH">Gender</th>
            <th :class="TABLE_STYLES.TH">Mastery</th>
            <th :class="TABLE_STYLES.TH">Performance</th>
            <th :class="TABLE_STYLES.TH">Overall Impression</th>
            <th :class="TABLE_STYLES.TH">Audience Impact</th>
            <th :class="TABLE_STYLES.TH">Total Score</th>
          </tr>
        </thead>
        <tbody :class="TABLE_STYLES.TBODY">
          <template
            v-for="([judgeKey, scores], i) in Object.entries(
              judgesScoresData || {}
            )"
            :key="judgeKey"
          >
            <tr
              v-for="score in scores"
              :key="score.score_id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td :class="TABLE_STYLES.TD.bold">
                {{ `Judge ${i + 1}` }}
              </td>
              <td :class="TABLE_STYLES.TD.bold">
                {{ score.cand_number }}
              </td>
              <td :class="TABLE_STYLES.TD.no_bold">
                <span
                  class="px-2 py-1 rounded text-xs font-medium text-nowrap"
                  :class="getTeamBadgeClasses(CapitalizeLabel(score.cand_team))"
                >
                  {{ getFormattedTeamLabel(CapitalizeLabel(score.cand_team)) }}
                </span>
              </td>
              <td :class="TABLE_STYLES.TD.no_bold">
                {{ FormatFullName(score.cand_name) }}
              </td>
              <td :class="TABLE_STYLES.TD.no_bold">
                {{ CapitalizeLabel(score.cand_gender) }}
              </td>
              <td :class="TABLE_STYLES.TD.no_bold">
                {{ score.mastery }}
              </td>
              <td :class="TABLE_STYLES.TD.no_bold">
                {{ score.performance_choreography }}
              </td>
              <td :class="TABLE_STYLES.TD.no_bold">
                {{ score.overall_impression }}
              </td>
              <td :class="TABLE_STYLES.TD.no_bold">
                {{ score.audience_impact }}
              </td>
              <td :class="TABLE_STYLES.TD.bold">
                {{ score.total_score }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </feature-base-table>
</template>

<script setup lang="ts">
import FeatureBaseTable from "../../shared/components/reusables/FeatureBaseTable.vue";
import { TABLE_STYLES } from "../../shared/constants/tableStyles";
import type {
  CandidateTeamOptions,
  JudgesScoresData,
} from "../types/judgesScores/types";
import { CapitalizeLabel } from "../../../utils/capitalizeWord";
import { FormatFullName } from "../../../utils/capitalizeWord";
import IsEmptyState from "../../shared/components/reusables/IsEmptyState.vue";
import FeatureServerState from "../../shared/components/reusables/FeatureServerState.vue";

defineProps<{
  judgesScoresData: JudgesScoresData | undefined;
  type: "male" | "female";
  isFetching?: boolean;
  isServerError?: boolean;
  retryFn: () => any;
}>();

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
</script>
