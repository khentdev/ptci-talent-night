<template>
  <feature-base-table>
    <template #table>
      <feature-server-state :on-retry="retryFn" :title="`Couldn't load ${props.candidateType} candidates`"
        message="There was an issue retrieving candidate data. Please check your connection and try again."
        v-if="isError" />
      <is-empty-state v-else-if="!candidatesQuery.data?.length" />
      <table :class="TABLE_STYLES.TB" v-else>
        <thead :class="TABLE_STYLES.THEADROW">
          <tr>
            <th :class="TABLE_STYLES.TH">Candidate No.</th>
            <th :class="TABLE_STYLES.TH">Full Name</th>
            <th :class="TABLE_STYLES.TH">Team</th>
            <th :class="TABLE_STYLES.TH">Mastery (30%)</th>
            <th :class="TABLE_STYLES.TH">Performance (40%)</th>
            <th :class="TABLE_STYLES.TH">Impression (20%)</th>
            <th :class="TABLE_STYLES.TH">Audience (10%)</th>
          </tr>
        </thead>

        <tbody :class="TABLE_STYLES.TBODY">
          <tr v-for="c in candidateScoreInputs" :key="c.candidateId!" class="hover:bg-gray-50 transition-colors">
            <td :class="TABLE_STYLES.TD.bold">
              {{ c.candidateNumber }}
            </td>
            <td :class="TABLE_STYLES.TD.bold">
              {{ c.candidateName }}
            </td>
            <td :class="TABLE_STYLES.TD.no_bold">
              <span class="px-2 py-1 rounded text-xs font-medium text-nowrap"
                :class="getTeamBadgeClasses(c.candidateTeam)">
                {{ getFormattedTeamLabel(c.candidateTeam) }}
              </span>
            </td>

            <td :class="TABLE_STYLES.TD.no_bold">
              <input type="text" :disabled="authStore.getUserMetaData?.has_submitted" v-model="c.mastery"
                @input="clampValues(c)" min="0" :max="SCORE_CRITERIA.mastery.max"
                class="w-20 px-2 py-1 disabled:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded border border-gray-700 hover:border-primary text-center focus:border-primary focus:outline-none transition-colors focus:ring-primary/20 focus:ring-2" />
            </td>

            <td :class="TABLE_STYLES.TD.no_bold">
              <input type="text" :disabled="authStore.getUserMetaData?.has_submitted" v-model="c.performance"
                @input="clampValues(c)" min="0" :max="SCORE_CRITERIA.performance.max"
                class="w-20 px-2 py-1 disabled:bg-gray-200 disabled:opacity-50 rounded border border-gray-700 hover:border-primary text-center focus:border-primary focus:outline-none transition-colors focus:ring-primary/20 focus:ring-2" />
            </td>

            <td :class="TABLE_STYLES.TD.no_bold">
              <input type="text" :disabled="authStore.getUserMetaData?.has_submitted" v-model="c.impression"
                @input="clampValues(c)" min="0" :max="SCORE_CRITERIA.impression.max"
                class="w-20 px-2 py-1 disabled:bg-gray-200 disabled:opacity-50 rounded border border-gray-700 hover:border-primary text-center focus:border-primary focus:outline-none transition-colors focus:ring-primary/20 focus:ring-2" />
            </td>

            <td :class="TABLE_STYLES.TD.no_bold">
              <input type="text" :disabled="authStore.getUserMetaData?.has_submitted" v-model="c.audience"
                @input="clampValues(c)" min="0" :max="SCORE_CRITERIA.audience.max"
                class="w-20 px-2 py-1 disabled:bg-gray-200 disabled:opacity-50 rounded border border-gray-700 hover:border-primary text-center focus:border-primary focus:outline-none transition-colors focus:ring-primary/20 focus:ring-2" />
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </feature-base-table>
</template>
<script lang="ts" setup>
  import { CapitalizeLabel } from "../../../../utils/capitalizeWord";
  import { useTalentStore } from "../../store/useTalentStore";
  import { useLocalStorage } from "@vueuse/core";
  import { watchEffect, computed } from "vue";
  import { TABLE_STYLES } from "../../../shared/constants/tableStyles";
  import FeatureBaseTable from "../../../shared/components/reusables/FeatureBaseTable.vue";
  import type { CandidateTeamOptions } from "../../types/talent/types";
  import IsEmptyState from "../../../shared/components/reusables/IsEmptyState.vue";
  import FeatureServerState from "../../../shared/components/reusables/FeatureServerState.vue";
  import type { CandidatesDataTalentFeat } from "../../types/talent/types";
  import { useAuthStore } from "../../../auth/store/authStore";

  const authStore = useAuthStore();

  const SCORE_CRITERIA = {
    mastery: { max: 30 },
    performance: { max: 40 },
    impression: { max: 20 },
    audience: { max: 10 },
  } as const;

  type ScoreFields = {
    candidateId: string | null;
    candidateNumber: string | null;
    candidateName: string | null;
    candidateTeam: Capitalize<CandidateTeamOptions>;
    mastery: string;
    performance: string;
    impression: string;
    audience: string;
  };

  const props = defineProps<{
    candidateType: "male" | "female";
    inputKey: string;
    retryFn: () => any;
    isLoading?: boolean;
    isError?: boolean;
  }>();

  const { getMaleCandidates, getFemaleCandidates } = useTalentStore();

  const candidatesQuery = computed(() =>
    props.candidateType === "male" ? getMaleCandidates : getFemaleCandidates
  );

  const candidateScoreInputs = useLocalStorage<ScoreFields[]>(props.inputKey, []);

  watchEffect(() => {
    const data = candidatesQuery.value?.data || [];
    if (data.length) {
      const cachedData = candidateScoreInputs.value || [];

      candidateScoreInputs.value = data.map((c: CandidatesDataTalentFeat) => {
        const cached = cachedData.find((d) => d.candidateId === c.cand_id);
        return (
          cached ?? {
            candidateId: c.cand_id,
            candidateNumber: c.cand_number,
            candidateName: c.cand_name,
            candidateTeam: CapitalizeLabel(c.cand_team),
            mastery: "",
            performance: "",
            impression: "",
            audience: "",
          }
        );
      });
    }
  });

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

    candidate.mastery = sanitize(candidate.mastery);
    candidate.performance = sanitize(candidate.performance);
    candidate.impression = sanitize(candidate.impression);
    candidate.audience = sanitize(candidate.audience);

    if (Number(candidate.mastery) >= SCORE_CRITERIA.mastery.max) {
      candidate.mastery = SCORE_CRITERIA.mastery.max.toString();
      candidate.mastery = candidate.mastery.replace(/\.$/, "");
    }

    if (Number(candidate.performance) >= SCORE_CRITERIA.performance.max) {
      candidate.performance = SCORE_CRITERIA.performance.max.toString();
      candidate.performance = candidate.performance.replace(/\.$/, "");
    }

    if (Number(candidate.impression) >= SCORE_CRITERIA.impression.max) {
      candidate.impression = SCORE_CRITERIA.impression.max.toString();
      candidate.impression = candidate.impression.replace(/\.$/, "");
    }

    if (Number(candidate.audience) >= SCORE_CRITERIA.audience.max) {
      candidate.audience = SCORE_CRITERIA.audience.max.toString();
      candidate.audience = candidate.audience.replace(/\.$/, "");
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
      return !c.mastery || !c.performance || !c.impression || !c.audience;
    });
    return hasError;
  };

  const clearInputs = () => {
    candidateScoreInputs.value.forEach((c) => {
      c.mastery = "";
      c.performance = "";
      c.impression = "";
      c.audience = "";
    });
  };

  defineExpose({ validateFields, candidateScoreInputs, clearInputs });
</script>
