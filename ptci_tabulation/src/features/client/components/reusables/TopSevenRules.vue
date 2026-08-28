<template>
  <teleport to="body">
    <transition
      enter-active-class="transition-color duration-200 ease-out"
      leave-active-class="transition-color duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        :class="{ 'backdrop-blur-sm': isDarkBg }"
        class="fixed inset-0 flex bg-black/50 items-center justify-center z-50 p-4 sm:p-6 md:p-10"
      >
        <div
          class="w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl bg-white shadow-lg rounded-2xl flex flex-col space-y-5 p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
        >
          <h1 class="text-xl sm:text-2xl font-bold text-primary font-lora">
            TOP 7 RULES
          </h1>
          <div class="bg-gray-100 w-full h-[1px] shrink-0"></div>

          <div class="flex flex-col space-y-3">
            <text-card :rules="topSevenRules" />
          </div>

          <button
            @click="close"
            class="bg-primary cursor-pointer text-white font-medium rounded-lg min-h-10 px-8 self-end hover:bg-primary/90 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </transition>
  </teleport>
</template>
<script setup lang="ts">
import TextCard from "./TextCard.vue";
type Rules = {
  boldTitle?: string;
  text: string;
}[];

const topSevenRules: Rules = [
  {
    boldTitle: "1. Impartiality",
    text: "Judges must remain unbiased and evaluate each candidate solely on their performance.",
  },
  {
    boldTitle: "2. Confidentiality",
    text: "All scores must remain confidential and should not be shared with anyone outside the judging panel.",
  },
  {
    boldTitle: "3. Scoring Limits",
    text: "Respect the maximum points for each category (e.g., if Mastery is 30%, enter maximum 30 points). Do not exceed the allocated percentage points for any scoring criteria.",
  },
  {
    boldTitle: "4. Scoring Criteria",
    text: "Follow the provided scoring criteria for each category and assign scores based on merit.",
  },
  {
    boldTitle: "5. No Outside Influence",
    text: "Judges should not engage in any discussions with participants or other judge that could influence their scores.",
  },
  {
    boldTitle: "6. Timely Submission",
    text: "Ensure all scores are submitted within the allotted time to avoid delays in results.",
  },
  {
    boldTitle: "7. Scoring Submission",
    text: "To maintain fairness in the evaluation process, judges can only submit scores once all candidates have completed the production.",
  },
];
withDefaults(
  defineProps<{ isOpen: boolean; close: () => void; isDarkBg?: boolean }>(),
  { isDarkBg: false }
);
</script>
