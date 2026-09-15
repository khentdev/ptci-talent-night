<template>
  <div class="relative min-h-56">
    <FeatureServerState :on-retry="retryFn" v-if="isServerError" :title="`Couldn't load Top 3 ${type === 'female' ? 'Females' : 'Males'}`" :message="`There was an issue retrieving the Top 3 ${type === 'female' ? 'females' : 'males'
      }. Please check your connection and try again.`" />

    <is-empty-state v-else-if="!candidates?.length" />
    <table :class="TABLE_STYLES.TB" v-else>
      <thead>
        <tr :class="TABLE_STYLES.THEADROW">
          <th :class="TABLE_STYLES.TH">Rank</th>
          <th :class="TABLE_STYLES.TH">Candidate No.</th>
          <th :class="TABLE_STYLES.TH">Candidate Name</th>
          <th :class="TABLE_STYLES.TH">Candidate Team</th>
          <th :class="TABLE_STYLES.TH">Final Score</th>
        </tr>
      </thead>
      <tbody :class="TABLE_STYLES.TBODY">
        <tr class="hover:bg-gray-50 transition-colors" v-for="(c, i) in candidates" :key="c.cand_id">
          <td :class="TABLE_STYLES.TD.bold">{{ RANK_LABELS[i] ?? `#${i + 1}` }}</td>
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
  </div>
</template>
<script lang="ts" setup>
  import { TABLE_STYLES } from "../../shared/constants/tableStyles";
  import IsEmptyState from "../../shared/components/reusables/IsEmptyState.vue";
  import FeatureServerState from "../../shared/components/reusables/FeatureServerState.vue";
  import type { OverallTalentScore } from "../types/overallTalentScore/types";
  import type { CandidateTeamOptions } from "../../settings/types/candidates";
  import { CapitalizeLabel, FormatFullName } from "../../../utils/capitalizeWord";

  defineProps<{
    candidates?: OverallTalentScore;
    type: "male" | "female";
    isServerError?: boolean
    retryFn: () => void
  }>();

  const RANK_LABELS = ["1st", "2nd", "3rd"];

  const getFormattedTeamLabel = (team: Capitalize<CandidateTeamOptions>) => {
    const teamLower = team.toLowerCase();
    return {
      black: "Black Stallion",
      white: "White Wolves",
      purple: "Purple Hawk",
      green: "Green Dragon",
      red: "Red Vipers",
    }[teamLower];
  };

  const getTeamBadgeClasses = (team: Capitalize<CandidateTeamOptions> | null) => {
    if (team) {
      const teamLabel = getFormattedTeamLabel(team);
      return teamLabel
        ? {
          "Black Stallion": "bg-gray-900 text-white",
          "White Wolves": "bg-white text-gray-800 ring-1 ring-gray-300",
          "Purple Hawk": "bg-purple-400 text-white",
          "Green Dragon": "bg-green-400 text-gray-800",
          "Red Vipers": "bg-red-400 text-white",
        }[teamLabel]
        : "";
    }
  };
</script>
