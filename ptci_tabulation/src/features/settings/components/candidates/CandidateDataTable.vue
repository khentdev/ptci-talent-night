<template>
  <FeatureBaseTable>
    <template #table>
      <FeatureServerState v-if="getError['candidates:fetchServerError']" :on-retry="refetchCandidates"
        title="Couldn't load candidates"
        message="There was an issue retrieving candidate data. Please check your connection and try again." />
      <IsEmptyState v-else-if="!getCandidates.data?.data?.length" />
      <table v-else :class="TABLE_STYLES.TB">
        <thead :class="TABLE_STYLES.THEADROW">
          <tr>
            <th :class="TABLE_STYLES.TH">Time Created</th>
            <th :class="TABLE_STYLES.TH">Candidate No.</th>
            <th :class="TABLE_STYLES.TH">Candidate Name</th>
            <th :class="TABLE_STYLES.TH">Team</th>
            <th :class="TABLE_STYLES.TH">Gender</th>
            <th :class="TABLE_STYLES.TH">Actions</th>
          </tr>
        </thead>

        <tbody :class="TABLE_STYLES.TBODY">
          <tr v-for="c in getCandidates.data?.data" :key="`${c.cand_team}-${c.cand_id}`"
            class="hover:bg-gray-50 transition-colors">
            <td :class="TABLE_STYLES.TD.no_bold">
              {{ formatDateAndTime(c.created_at) }}
            </td>
            <td :class="TABLE_STYLES.TD.bold">
              {{ c.cand_number }}
            </td>
            <td :class="TABLE_STYLES.TD.bold">
              {{ FormatFullName(c.cand_name) }}
            </td>
            <td :class="TABLE_STYLES.TD.no_bold">
              <span class="px-2 py-1 rounded text-xs font-medium" :class="getTeamBadgeClasses(c.cand_team)">
                {{ CapitalizeLabel(c.cand_team) }}
              </span>
            </td>
            <td :class="TABLE_STYLES.TD.no_bold">
              <span class="px-2 py-1 rounded text-xs font-medium" :class="getGenderBadgeClasses(c.cand_gender)">
                {{ CapitalizeLabel(c.cand_gender) }}
              </span>
            </td>
            <td :class="TABLE_STYLES.TD.no_bold">
              <div class="flex items-center space-x-2">
                <button :class="TABLE_STYLES.ACTION_ADD_UPDATE" title="Edit candidate" @click="
                  toggleForm({
                    cand_id: c.cand_id,
                    cand_number: c.cand_number,
                    cand_name: c.cand_name,
                    cand_gender: c.cand_gender,
                    cand_team: c.cand_team,
                  })
                  ">
                  <SquarePen class="size-4 md:size-5 shrink-0" />
                </button>

                <button @click="
                  toggleConfirmationModal({
                    id: c.cand_id,
                    number: c.cand_number,
                    name: c.cand_name,
                  })
                  " :class="TABLE_STYLES.ACTION_DEL" title="Delete candidate">
                  <Trash class="size-4 md:size-5 shrink-0" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </FeatureBaseTable>
  <FeatureBaseForm title="Update Candidate" description="Provide complete candidate details" :show-form="showForm">
    <CandidateForm :candidate-data-to-update="candidateDataToUpdate" :on-submit="updateCandidate"
      :is-loading="useLoading['candidates:updateCandidate']" mode="update" :on-close="() => (showForm = false)" />
  </FeatureBaseForm>
  <DeleteConfirmationModal :datas="dataToDelete" title="Delete Candidate"
    description="Are you sure you want to delete this candidate?" :on-close="() => (showConfirmation = false)"
    :show="showConfirmation" :on-delete="deleteCandidate" />
</template>

<script setup lang="ts">
  import { SquarePen, Trash } from "lucide-vue-next";
  import { useCandidatesStore } from "../../store/candidateStore";
  import type {
    UpdateCandidateParams,
    CandidateTeamOptions,
  } from "../../types/candidates";
  import FeatureBaseTable from "../../../shared/components/reusables/FeatureBaseTable.vue";
  import CandidateForm from "../candidates/CandidateForm.vue";
  import FeatureBaseForm from "../../../shared/components/reusables/FeatureBaseForm.vue";
  import IsEmptyState from "../../../shared/components/reusables/IsEmptyState.vue";
  import DeleteConfirmationModal from "../../../shared/components/reusables/DeleteConfirmationModal.vue";
  import { TABLE_STYLES } from "../../../shared/constants/tableStyles";
  import {
    CapitalizeLabel,
    FormatFullName,
  } from "../../../../utils/capitalizeWord";
  import FeatureServerState from "../../../shared/components/reusables/FeatureServerState.vue";
  import { useGlobalErrorSetter } from "../../../../shared/store/useGlobalErrorState";
  import { ref } from "vue";
  import { useLoadingStore } from "../../../../shared/store/useLoadingState";

  const { getError } = useGlobalErrorSetter();
  const { useLoading } = useLoadingStore();
  const { getCandidates, updateCandidate, deleteCandidate, refetchCandidates } =
    useCandidatesStore();

  const formatDateAndTime = (date: string): string => {
    const dateObj = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    };
    return new Intl.DateTimeFormat("en-US", options).format(dateObj);
  };

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

  const showForm = ref(false);
  const candidateDataToUpdate = ref<UpdateCandidateParams>();
  const toggleForm = (data: UpdateCandidateParams) => {
    showForm.value = !showForm.value;
    candidateDataToUpdate.value = data;
  };

  type DataToDelete = { id: string; number: string; name: string };
  const showConfirmation = ref(false);
  const dataToDelete = ref<DataToDelete | null>(null);

  const toggleConfirmationModal = ({ id, number, name }: DataToDelete) => {
    showConfirmation.value = !showConfirmation.value;
    dataToDelete.value = { id, number, name };
  };
</script>
