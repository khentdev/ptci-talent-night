<template>
  <feature-base-table>
    <template #table>
      <FeatureServerState :on-retry="retryFn" v-if="isServerError" :title="`Couldn't load overall score for ${type === 'female' ? 'females' : 'males'
        }`" :message="`There was an issue retrieving overall scores for ${type === 'female' ? 'females' : 'males'
          }. Please check your connection and try again.`" />

      <is-empty-state v-else-if="!overallScores?.length" />
      <table :class="TABLE_STYLES.TB" v-else>
        <thead>
          <tr :class="TABLE_STYLES.THEADROW">
            <th :class="TABLE_STYLES.TH">Candidate No.</th>
            <th :class="TABLE_STYLES.TH">Candidate Name</th>
            <th :class="TABLE_STYLES.TH">Candidate Team</th>
            <th :class="TABLE_STYLES.TH">Final Score</th>
          </tr>
        </thead>
        <tbody :class="TABLE_STYLES.TBODY">
          <tr class="hover:bg-gray-50 transition-colors" v-for="c in overallScores" :key="c.cand_id">
            <td :class="TABLE_STYLES.TD.bold">{{ c.cand_number }}</td>
            <td :class="TABLE_STYLES.TD.no_bold">{{ FormatFullName(c.cand_name) }}</td>
            <td :class="TABLE_STYLES.TD">
              <span class="px-2 py-1 rounded text-xs font-medium text-nowrap"
                :class="getTeamBadgeClasses(CapitalizeLabel(c.cand_team))">{{
                  getFormattedTeamLabel(CapitalizeLabel(c.cand_team)) }}</span>
            </td>
            <td :class="TABLE_STYLES.TD.bold">{{ c.talent_final_score }}</td>
          </tr>
        </tbody>
      </table>
    </template>
  </feature-base-table>
</template>
<script lang="ts" setup>
  import FeatureBaseTable from "../../shared/components/reusables/FeatureBaseTable.vue";
  import { TABLE_STYLES } from "../../shared/constants/tableStyles";
  import IsEmptyState from "../../shared/components/reusables/IsEmptyState.vue";
  import FeatureServerState from "../../shared/components/reusables/FeatureServerState.vue";
  import type { OverallTalentScore } from "../types/overallTalentScore/types";
  import type { CandidateTeamOptions } from "../../settings/types/candidates";
  import { CapitalizeLabel, FormatFullName } from "../../../utils/capitalizeWord";

  defineProps<{
    overallScores?: OverallTalentScore;
    type: "male" | "female";
    isServerError?: boolean
    retryFn: () => void
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
