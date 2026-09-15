<template>
  <section
    class="relative overflow-x-auto  rounded-2xl flex flex-col p-6 min-h-screen"
  >
    <div
      class="flex flex-col space-y-8 w-full mt-16 bg-white min-h-full p-6 rounded-2xl overflow-y-auto border border-gray-200 shadow-lg shadow-black/5"
    >
      <header class="text-center space-y-3 pb-6 border-b border-gray-100">
        <h1 class="text-gray-800 text-2xl sm:text-3xl font-bold font-lora">
          Welcome,
          <span class="text-primary tracking-wide font-lora">{{
            capitalizedName(authStore.getUserMetaData?.username)?.concat("!")
          }}</span>
        </h1>
        <p class="text-gray-600 text-sm sm:text-base font-poppins">
          You're logged in as a
          <span class="font-semibold text-primary">Judge</span> for the Talent
          Night evaluation.
        </p>
      </header>

      <div class="space-y-8 flex flex-col h-full">
        <div class="text-center space-y-4">
          <div class="relative">
            <h2
              class="text-gray-800 text-2xl sm:text-4xl font-bold font-lora relative z-10"
            >
              Judging Rules
            </h2>
          </div>
          <p
            class="text-gray-600 text-base sm:text-lg font-poppins max-w-2xl mx-auto leading-relaxed"
          >
            Please carefully read the following rules before proceeding to the
            judging phase. Your understanding and compliance with these
            guidelines ensures fair and consistent evaluation.
          </p>
        </div>

        <div
          class="bg-gradient-to-br from-primaryLight/20 via-white to-primaryLight/10 rounded-2xl md:p-8 p-4 border border-primary/20 shadow-xl shadow-primary/5"
        >
          <div class="flex items-center gap-3 mb-6 shrink-0">
            <div
              class="size-8 bg-primary/10 rounded-lg flex items-center justify-center"
            >
              <Menu class="stroke-primary size-4 stroke-3" />
            </div>
            <h3 class="text-lg md:text-xl font-bold text-gray-800 font-lora">
              General Judging Rules
            </h3>
          </div>

          <div
            class="space-y-4 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          >
            <text-card :rules="judgingRules" />
          </div>
        </div>

        <div class="flex justify-center shrink-0">
          <button
            @click="
              () => {
                router.push({ name: 'male-candidates-talent' });
              }
            "
            class="group cursor-pointer bg-primary text-white px-5 md:px-10 py-4 rounded-xl font-semibold font-poppins transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-primary/30 focus:outline-none focus:ring-4 focus:ring-primary/20"
          >
            <span class="flex items-center gap-3 md:text-sm text-xs">
              <circle-check class="hidden md:block sm:size-5 shrink-0" />
              Proceed to Judging
            </span>
          </button>
        </div>

        <div
          class="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-3 md:p-6 border border-gray-200 shadow-lg"
        >
          <div
            class="flex md:flex-row flex-col items-center justify-between space-y-5 md:space-y-0 md:space-x-10 overflow-x-auto"
          >
            <div class="space-y-1 md:text-start text-center md:min-w-56">
              <h3 class="font-semibold text-gray-800 font-lora text-lg">
                Need to review rules again?
              </h3>
              <p class="text-sm text-gray-600 font-poppins">
                Access the judging guidelines anytime during your session.
              </p>
            </div>
            <div class="flex md:flex-row flex-col items-center gap-3">
              <button
                @click="openTopSix"
                class="group bg-primary/10 text-nowrap hover:bg-primary/20 text-primary hover:text-primary/80 px-5 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                <Menu class="stroke-primary size-4 stroke-3 shrink-0" />

                <span>View Top 7 Rules</span>
                <chevron-right
                  class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 shrink-0"
                />
              </button>

              <button
                @click="openGeneralRules"
                class="group bg-primary/10 hover:bg-primary/20 md:mr-3 md:text-center text-start md:text-nowrap text-primary hover:text-primary/80 px-5 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                title="View general judging rules"
              >
                <Menu class="stroke-primary size-4 stroke-3 shrink-0" />
                <span>See General Judging Rules</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <top-seven-rules :close="closeTopSix" :isOpen="isTopSixOpen" />

  <transition
    enter-active-class="transition-color duration-200 ease-out"
    leave-active-class="transition-color duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isGeneralRulesOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click="closeGeneralRules"
    >
      <div
        class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        @click.stop
      >
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="size-8 bg-primary/10 rounded-lg flex items-center justify-center"
              >
                <Menu class="stroke-primary size-4 stroke-3" />
              </div>
              <h3 class="text-xl font-bold text-gray-800 font-lora">
                General Judging Rules
              </h3>
            </div>
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div class="space-y-6">
            <div class="space-y-4">
              <text-card :rules="judgingRules" />
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-end">
            <button
              @click="closeGeneralRules"
              class="bg-primary text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import TextCard from "./components/reusables/TextCard.vue";
import { ChevronRight, Menu, CircleCheck } from "lucide-vue-next";
import TopSevenRules from "./components/reusables/TopSevenRules.vue";
import { useAuthStore } from "../auth/store/authStore";
import { CapitalizeLabel } from "../../utils/capitalizeWord";
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();

type Rules = {
  boldTitle?: string;
  text: string;
}[];

const judgingRules: Rules = [
  {
    text: "1. Scores cannot be edited or repeated once submitted.",
  },
  {
    text: "2. Strictly no duplication or repetition of score submissions.",
  },
  {
    text: "3. Scores will be automatically saved to the admin once submitted.",
  },
  {
    text: "4. Each contestants must be assigned a unique total score according to the judging criteria.",
  },
  {
    boldTitle: "5. Important",
    text: "View the system rules to check the rules per category.",
  },
];

const isTopSixOpen = ref(false);
const isGeneralRulesOpen = ref(false);

const openTopSix = () => (isTopSixOpen.value = true);
const closeTopSix = () => (isTopSixOpen.value = false);

const openGeneralRules = () => (isGeneralRulesOpen.value = true);
const closeGeneralRules = () => (isGeneralRulesOpen.value = false);

const capitalizedName = (val: string | undefined) =>
  val ? CapitalizeLabel(val) : "- Unknown User -";
</script>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 6px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background-color: rgba(166, 140, 106, 0.2);
  border-radius: 3px;
}

.scrollbar-thin::-webkit-scrollbar-thumb:hover {
  background-color: rgba(166, 140, 106, 0.3);
}
</style>
