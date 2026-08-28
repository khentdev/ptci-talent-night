<template>
  <main
    class="relative w-full min-h-screen bg-center bg-no-repeat bg-cover"
    :style="{ backgroundImage: `url(${authBg})` }"
  >
    <div
      class="grid items-center min-h-screen grid-cols-1 gap-8 px-3 p-10 overflow-hidden justify-items-center xl:flex xl:flex-row xl:gap-5"
    >
      <div
        class="flex items-center justify-center w-full px-3 mt-8 sm:px-6 md:px-10 xl:order-2"
      >
        <div
          class="relative flex justify-center w-full h-48 sm:h-64 md:h-80 lg:h-96"
        >
          <div
            class="absolute w-28 h-full transform -skew-x-8 -translate-x-20 -translate-y-10 sm:w-32 sm:-translate-x-24 md:w-40 md:-translate-x-28 lg:w-44 lg:-translate-x-32 xl:w-52 xl:-translate-x-40"
          >
            <div
              class="relative w-full h-full overflow-hidden bg-white border border-gray-200 shadow-xl shadow-black/20 rounded"
            >
              <Transition name="fade" appear>
                <img
                  loading="lazy"
                  :key="leftCardIndex"
                  :src="leftCardSrc"
                  :alt="`Candidate portrait ${leftCardIndex + 1}`"
                  class="object-cover object-center w-full h-full"
                />
              </Transition>
            </div>
          </div>

          <div
            class="absolute w-28 h-full transform -skew-x-8 translate-x-20 sm:w-32 sm:translate-x-24 md:w-40 md:translate-x-28 lg:w-44 lg:translate-x-32 xl:w-52 xl:translate-x-40 -translate-y-10"
          >
            <div
              class="relative w-full h-full overflow-hidden bg-white border border-gray-200 shadow-xl shadow-black/20 rounded"
            >
              <Transition name="fade" appear>
                <img
                  loading="lazy"
                  :key="rightCardIndex"
                  :src="rightCardSrc"
                  :alt="`Candidate portrait ${rightCardIndex + 1}`"
                  class="object-cover object-center w-full h-full"
                />
              </Transition>
            </div>
          </div>

          <div
            class="absolute w-28 h-full transform -skew-x-8 -translate-x-1/2 sm:w-32 md:w-40 lg:w-44 xl:w-52 left-1/2"
          >
            <div
              class="relative w-full h-full overflow-hidden bg-white border border-gray-200 shadow-xl shadow-black/20 rounded"
            >
              <Transition name="fade" appear>
                <img
                  loading="lazy"
                  :key="centerCardIndex"
                  :src="centerCardSrc"
                  :alt="`Center candidate portrait ${centerCardIndex + 1}`"
                  class="object-cover object-center w-full h-full"
                />
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <div
        class="flex items-center justify-center w-full h-full px-3 sm:px-6 md:px-10 lg:order-1"
      >
        <div
          class="container flex flex-col items-center justify-center max-w-md bg-white border border-gray-200 shadow-2xl shadow-black/30 rounded"
        >
          <div
            class="flex flex-col items-center justify-center w-full gap-5 p-6 md:gap-10"
          >
            <h2
              class="text-xl font-bold text-center text-gray-800 font-poppins md:mt-3 md:text-2xl"
            >
              Welcome to the Official
              <span class="text-primary">Ms & Mr. PTCI Pageant</span> Tabulation
              System
            </h2>

            <form
              @submit.prevent="handleSubmit"
              class="flex flex-col w-full h-full gap-5 text-sm text-gray-800 rounded-xl"
            >
              <div class="grid gap-2">
                <label
                  for="username"
                  class="text-xs font-semibold text-gray-700 md:text-sm"
                  >Username</label
                >
                <div class="relative">
                  <AtSign
                    class="absolute transform -translate-y-1/2 pointer-events-none top-1/2 size-4 left-2 stroke-gray-400"
                  />
                  <input
                    @input="authStore.clearLoginErrors()"
                    v-model="usernameInput"
                    type="text"
                    required
                    id="username"
                    autocomplete="username"
                    placeholder="Enter your username"
                    class="w-full h-12 px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 transition-all duration-300 ease-out bg-white border border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-gray-300 hover:shadow-md focus:shadow-lg"
                  />
                </div>
                <p
                  class="text-red-400"
                  v-if="
                    authStore.loginErrors.general ||
                    authStore.loginErrors.invalidCredentials
                  "
                >
                  <span class="flex gap-2 items-center"
                    ><CircleAlert class="shrink-0 size-4" />
                    {{
                      authStore.loginErrors.general ||
                      authStore.loginErrors.invalidCredentials
                    }}</span
                  >
                </p>
              </div>

              <div class="grid gap-2">
                <label
                  for="password"
                  class="text-xs font-semibold text-gray-700 md:text-sm"
                  >Password</label
                >
                <div class="relative">
                  <LockKeyhole
                    class="absolute transform -translate-y-1/2 pointer-events-none top-1/2 size-4 left-2 stroke-gray-400"
                  />
                  <input
                    @input="authStore.clearLoginErrors()"
                    v-model="passwordInput"
                    type="password"
                    id="password"
                    required
                    autocomplete="current-password"
                    placeholder="Enter your password"
                    class="w-full h-12 px-4 py-3 pl-10 text-gray-800 placeholder-gray-400 transition-all duration-300 ease-out bg-white border border-gray-200 shadow-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-gray-300 hover:shadow-md focus:shadow-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                :disabled="isSigningIn"
                :class="ACTION_STYLES.PRIMARYBTN"
              >
                <span class="flex items-center justify-center gap-3">
                  <template v-if="isSigningIn">
                    <LoaderCircle class="animate-spin size-5" />
                    <span>Signing in...</span>
                  </template>
                  <template v-else>
                    <span>Sign In</span>
                    <LogIn
                      class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </template>
                </span>
              </button>

              <span
                class="mt-2 text-gray-700 underline transition-colors duration-300 cursor-pointer hover:text-gray-800 w-fit"
              >
                Forgot password?
              </span>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="ts" setup>
import authBg from "../../../assets/images/background.png";
import {
  AtSign,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  CircleAlert,
} from "lucide-vue-next";
import { ref, onMounted, onUnmounted, computed, Transition } from "vue";
import { useAuthStore } from "../store/authStore";
import { useRouter } from "vue-router";
import { ACTION_STYLES } from "../../shared/constants/formStyles";

import M1 from "../../../assets/images/M1.jpg";
import M2 from "../../../assets/images/M2.jpg";
import M3 from "../../../assets/images/M3.jpg";
import M4 from "../../../assets/images/M4.jpg";
import M5 from "../../../assets/images/M5.jpg";
import M6 from "../../../assets/images/M6.jpg";
import M7 from "../../../assets/images/M7.jpg";
import M8 from "../../../assets/images/M8.jpg";
import M9 from "../../../assets/images/M9.jpg";
import M10 from "../../../assets/images/M10.jpg";

import F1 from "../../../assets/images/F1.jpg";
import F2 from "../../../assets/images/F2.jpg";
import F3 from "../../../assets/images/F3.jpg";
import F4 from "../../../assets/images/F4.jpg";
import F5 from "../../../assets/images/F5.jpg";
import F6 from "../../../assets/images/F6.jpg";
import F7 from "../../../assets/images/F7.jpg";
import F8 from "../../../assets/images/F8.jpg";
import F9 from "../../../assets/images/F9.jpg";
import F10 from "../../../assets/images/F10.jpg";

const router = useRouter();
const authStore = useAuthStore();

const usernameInput = ref("");
const passwordInput = ref("");

const isSigningIn = ref(false);
const handleSubmit = async () => {
  let cachedPassword = passwordInput.value.trim();
  passwordInput.value = "";

  isSigningIn.value = true;
  try {
    const { success } = await authStore.loginUser({
      username: usernameInput.value.trim(),
      password: cachedPassword,
    });

    if (success && authStore.getUserMetaData?.role === "judge")
      return router.push({ name: "judge" });

    if (success && authStore.getUserMetaData?.role === "admin")
      return router.push({ name: "dashboard" });
  } finally {
    isSigningIn.value = false;
  }
};
const shuffle = <T>(array: T[]): T[] => {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const allImages = [
  M1,
  M2,
  M3,
  M4,
  M5,
  M6,
  M7,
  M8,
  M9,
  M10,
  F1,
  F2,
  F3,
  F4,
  F5,
  F6,
  F7,
  F8,
  F9,
  F10,
];

let shuffledImages = shuffle([...allImages]);

const leftCardIndex = ref(0);
const centerCardIndex = ref(1);
const rightCardIndex = ref(2);

const leftCardSrc = computed(() => shuffledImages[leftCardIndex.value]);
const centerCardSrc = computed(() => shuffledImages[centerCardIndex.value]);
const rightCardSrc = computed(() => shuffledImages[rightCardIndex.value]);

function nextIndex(current: number) {
  const next = (current + 3) % shuffledImages.length;
  if (next === 0) shuffledImages = shuffle([...allImages]);
  return next;
}

let leftIntervalId: ReturnType<typeof setInterval> | null = null;
let centerIntervalId: ReturnType<typeof setInterval> | null = null;
let rightIntervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  leftIntervalId = setInterval(() => {
    leftCardIndex.value = nextIndex(leftCardIndex.value);
  }, 3500);

  centerIntervalId = setInterval(() => {
    centerCardIndex.value = nextIndex(centerCardIndex.value);
  }, 4000);

  rightIntervalId = setInterval(() => {
    rightCardIndex.value = nextIndex(rightCardIndex.value);
  }, 3300);
});

onUnmounted(() => {
  if (leftIntervalId) clearInterval(leftIntervalId);
  if (centerIntervalId) clearInterval(centerIntervalId);
  if (rightIntervalId) clearInterval(rightIntervalId);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 500ms ease-in-out;
  position: absolute;
  inset: 0;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
