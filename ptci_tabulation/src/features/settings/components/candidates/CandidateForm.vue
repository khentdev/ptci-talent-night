<template>
  <form class="grid grid-cols-2 gap-2 md:gap-5" @submit.prevent="handleSubmit">
    <div class="col-span-2 sm:col-span-1">
      <label for="candidateId" class="block text-sm font-medium text-gray-700">
        Candidate Number
      </label>
      <input
        v-model="candidateNumber"
        id="candidateId"
        type="text"
        placeholder="Enter candidate no."
        :class="FORM_FIELDS.INPUT_FIELD"
      />
      <p
        v-if="candidateFormErrors.general"
        class="text-sm text-red-500 flex items-center gap-3 mt-1"
      >
        <TriangleAlert class="size-4 shrink-0" />
        {{ candidateFormErrors.general }}
      </p>
    </div>

    <div class="col-span-2 sm:col-span-1">
      <label for="teamName" class="block text-sm font-medium text-gray-700">
        Team Name
      </label>
      <div class="relative">
        <button
          @click.stop="toggleTeamDropdown"
          type="button"
          aria-controls="dropdown-listbox"
          :aria-expanded="teamDropdownOpen"
          :class="FORM_FIELDS.DROPDOWN"
        >
          <span>{{ selectedTeamLabel || "Select team..." }}</span>
          <ChevronDown class="shrink-0 size-4" />
        </button>
        <transition
          enter-active-class="transition-transform duration-100 ease-out"
          enter-from-class="-translate-y-5 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="opacity-0"
        >
          <ul
            v-if="teamDropdownOpen"
            role="listbox"
            v-on-click-outside.bubble="toggleTeamDropdown"
            class="absolute z-40 w-full mt-1 overflow-hidden overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 md:max-h-50"
          >
            <li
              v-for="(item, i) in formattedTeamOptions"
              :key="i"
              :id="'team-' + item.value"
              role="option"
              tabindex="0"
              :aria-selected="selectedTeam === item.value"
              @click="selectTeam(item.value, item.label)"
              @keydown.enter.prevent="selectTeam(item.value, item.label)"
              @keydown.space.prevent="selectTeam(item.value, item.label)"
              :class="[
                'flex items-center gap-2 px-3 py-2 cursor-pointer text-sm hover:bg-gray-100 transition-colors focus:outline-none focus:bg-gray-100',
                formatTeamColor(item.value),
              ]"
            >
              {{ item.label }}
            </li>
          </ul>
        </transition>
      </div>
    </div>

    <div class="col-span-2">
      <label for="gender" class="block text-sm font-medium text-gray-700">
        Gender
      </label>
      <div class="relative">
        <button
          @click.stop="toggleGenderDropdown"
          type="button"
          aria-controls="gender-dropdown-list"
          :aria-expanded="genderDropdownOpen"
          :class="FORM_FIELDS.DROPDOWN"
        >
          <span>{{ selectedGenderLabel || "Select gender..." }}</span>
          <ChevronDown class="shrink-0 size-4" />
        </button>
        <transition
          enter-active-class="transition-transform duration-100 ease-out"
          enter-from-class="-translate-y-5 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="opacity-0"
        >
          <ul
            v-if="genderDropdownOpen"
            v-on-click-outside.bubble="toggleGenderDropdown"
            class="absolute z-40 w-full mt-1 overflow-hidden overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 md:max-h-50"
          >
            <li
              v-for="(gender, i) in genderOptions"
              :key="i"
              :id="'gender-' + gender"
              role="option"
              tabindex="0"
              :aria-selected="selectedGender === gender"
              class="px-3 py-2 cursor-pointer text-sm text-gray-700 hover:bg-gray-100 transition-colors focus:bg-gray-100 focus:outline-none"
              @click="selectGender(gender)"
              @keydown.enter.prevent="selectGender(gender)"
              @keydown.space.prevent="selectGender(gender)"
            >
              {{ CapitalizeLabel(gender) }}
            </li>
          </ul>
        </transition>
      </div>
    </div>

    <div>
      <label for="lastName" class="block text-sm font-medium text-gray-700">
        Last Name
      </label>
      <input
        v-model="candidateLastName"
        id="lastName"
        type="text"
        :class="FORM_FIELDS.INPUT_FIELD"
        placeholder="Doe"
      />
    </div>

    <div>
      <label for="firstName" class="block text-sm font-medium text-gray-700">
        First Name
      </label>
      <input
        v-model="candidateFirstName"
        id="firstName"
        type="text"
        placeholder="John"
        :class="FORM_FIELDS.INPUT_FIELD"
      />
    </div>

    <div class="flex justify-between items-center gap-5 col-span-2 mt-3">
      <button @click="onClose" type="button" :class="ACTION_STYLES.CANCELBTN">
        Cancel
      </button>
      <button
        type="submit"
        :disabled="isLoading"
        :class="ACTION_STYLES.PRIMARYBTN"
      >
        {{ isLoading ? "Submitting..." : "Submit" }}
      </button>
    </div>
  </form>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { ChevronDown, TriangleAlert } from "lucide-vue-next";
import { vOnClickOutside } from "@vueuse/components";
import { useCandidatesStore } from "../../store/candidateStore";
import {
  ACTION_STYLES,
  FORM_FIELDS,
} from "../../../shared/constants/formStyles";
import type {
  CandidateTeamOptions,
  CreateCandidateParams,
  GenderOptions,
  UpdateCandidateParams,
} from "../../types/candidates";
import {
  CapitalizeLabel,
  splitName,
} from "../../../../utils/capitalizeWord";

const { candidateFormErrors, clearFormErrors } = useCandidatesStore();
onBeforeUnmount(() => {
  clearFormErrors();
});

const props = defineProps<{
  mode: "create" | "update";
  onClose: () => void;
  isLoading?: boolean;
  onSubmit: (
    data: any
  ) => Promise<UpdateCandidateParams | CreateCandidateParams | any>;
  candidateDataToUpdate?: UpdateCandidateParams | null;
}>();

const candidateNumber = ref("");
const candidateFirstName = ref("");
const candidateLastName = ref("");

const teamDropdownOpen = ref(false);
const genderDropdownOpen = ref(false);

const selectedTeam = ref<CandidateTeamOptions | null>(null);
const selectedTeamLabel = ref<string | null>(null);
const selectedGender = ref<GenderOptions>("male");
const selectedGenderLabel = ref<Capitalize<GenderOptions>>("Male");

const fillName = (fullname: string) => {
  const { lastName, firstName } = splitName(fullname);
  candidateLastName.value = lastName;
  candidateFirstName.value = firstName;
};
const populateForm = (data: UpdateCandidateParams) => {
  candidateNumber.value = data.cand_number;
  selectedTeam.value = data.cand_team;
  selectedTeamLabel.value = CapitalizeLabel(data.cand_team);
  selectedGender.value = data.cand_gender;
  selectedGenderLabel.value = CapitalizeLabel(data.cand_gender);
  fillName(data.cand_name);
};

watch(
  [() => props.candidateDataToUpdate, () => props.mode],
  ([hasData, update]) => {
    if (hasData && update === "update") populateForm(hasData);
  },
  { immediate: true }
);

const teamOptions: CandidateTeamOptions[] = [
  "red",
  "yellow",
  "green",
  "purple",
  "blue",
];
const formattedTeamOptions = teamOptions.map((color) => ({
  label: color.charAt(0).toUpperCase() + color.slice(1),
  value: color,
}));

const genderOptions: GenderOptions[] = ["male", "female", "other"];

const toggleTeamDropdown = () => {
  if (genderDropdownOpen.value) genderDropdownOpen.value = false;
  teamDropdownOpen.value = !teamDropdownOpen.value;
};

const toggleGenderDropdown = () => {
  if (teamDropdownOpen.value) teamDropdownOpen.value = false;
  genderDropdownOpen.value = !genderDropdownOpen.value;
};

const selectTeam = (team: CandidateTeamOptions, label: string) => {
  selectedTeam.value = team;
  selectedTeamLabel.value = label;
  teamDropdownOpen.value = false;
};

const selectGender = (gender: GenderOptions) => {
  selectedGender.value = gender;
  selectedGenderLabel.value = CapitalizeLabel(gender);
  genderDropdownOpen.value = false;
};

const formatTeamColor = (color: CandidateTeamOptions) => {
  return {
    red: "text-red-500",
    yellow: "text-yellow-400",
    green: "text-green-500",
    purple: "text-purple-500",
    blue: "text-blue-500",
  }[color];
};
watch(
  [
    candidateNumber,
    candidateFirstName,
    candidateLastName,
    selectedTeam,
    selectedGender,
  ],
  () => {
    if (candidateFormErrors.general) {
      candidateFormErrors.general = "";
    }
  }
);

const validateForm = () => {
  clearFormErrors();

  if (
    !candidateNumber.value.trim() ||
    !candidateFirstName.value.trim() ||
    !candidateLastName.value.trim() ||
    !selectedTeam.value ||
    !selectedGender.value
  ) {
    candidateFormErrors.general = "All fields are required.";
    return false;
  }

  return true;
};
watch(
  [candidateNumber, candidateFirstName, candidateLastName],
  ([candInput, firstName, lastName]) => {
    const digitOnly = /\D/g;
    const wordsOnly = /[^a-zA-Z\s,]/g;
    candidateNumber.value = candInput?.replace(digitOnly, "").substring(0, 11);
    candidateFirstName.value = firstName
      .replace(wordsOnly, "")
      .substring(0, 49);
    candidateLastName.value = lastName.replace(wordsOnly, "").substring(0, 49);
  }
);

const candidateFullName = computed(
  () =>
    `${CapitalizeLabel(candidateLastName.value)}, ${CapitalizeLabel(
      candidateFirstName.value
    )}`
);

const handleSubmit = async () => {
  if (!validateForm()) return;

  const addFormData: CreateCandidateParams = {
    cand_number: candidateNumber.value,
    cand_name: candidateFullName.value,
    cand_team: selectedTeam.value!,
    cand_gender: selectedGender.value!,
  };

  if (props.mode === "update" && props.candidateDataToUpdate) {
    const updateFormData: UpdateCandidateParams = {
      cand_id: props.candidateDataToUpdate?.cand_id,
      ...addFormData,
    };
    await props.onSubmit(updateFormData);
  } else await props.onSubmit(addFormData);

  props.onClose();
};
</script>
