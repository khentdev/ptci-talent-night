<template>
  <AppHeader />
  <div
    class="relative flex w-full bg-no-repeat bg-cover bg-center text-sm min-h-screen"
    :style="{ backgroundImage: `url(${background})` }"
  >
    <div
      @click.self="toggleNavbar"
      v-if="isMobile && navbarOpen"
      class="fixed inset-0 bg-black/10 z-35"
    ></div>
    <button
      :class="navbarOpen ? 'hidden' : 'block'"
      class="absolute top-28 bg-primary/50 p-2 rounded -left-1 z-40 cursor-pointer"
      @click="toggleNavbar"
    >
      <SquareChevronRight class="shrink-0 size-5 stroke-white" />
    </button>
    <div
      class="transition-transform duration-300 ease-in-out"
      :class="[
        isMobile
          ? [
              'absolute z-40 w-72 h-screen transform',
              navbarOpen ? '-translate-x-5' : '-translate-x-full',
            ]
          : ['relative ml-5'],
      ]"
    >
      <aside
        :class="
          navbarOpen
            ? 'max-w-72 w-72 p-6 px-4'
            : 'w-0 ml-0 p-0 -translate-x-[10rem] overflow-hidden'
        "
        class="flex flex-col items-start mt-22 mb-8 space-y-5 ease-in-out sidebar h-[calc(100vh-7.5rem)] rounded-2xl backdrop-blur-md bg-white border border-gray-200 shadow-lg shadow-black/10 text-gray-800 transition-all duration-300"
      >
        <div
          class="flex justify-between items-center space-x-3 w-full px-4 shrink-0"
          :class="{ 'p-2': !isMobile }"
        >
          <div
            class="flex items-center space-x-3 shrink-0 transition-colors"
            :class="navbarOpen ? 'opacity-100' : 'opacity-0'"
          >
            <CircleUserRound class="shrink-0 stroke-primary size-5" />
            <span class="font-medium text-base">{{
              `${userName} (${role})`
            }}</span>
          </div>
          <button
            class="cursor-pointer p-2 hover:bg-gray-100 rounded transition-colors"
            @click="toggleNavbar"
          >
            <SquareChevronLeft class="size-5 stroke-black shrink-0" />
          </button>
        </div>
        <span
          class="w-full h-[1px] bg-gray-200 transition-colors"
          :class="navbarOpen ? 'opacity-100' : 'opacity-0'"
        ></span>
        <nav
          class="flex flex-col space-y-3 w-full overflow-y-auto flex-1 p-2 min-h-0 transition-colors"
          :class="navbarOpen ? 'opacity-100' : 'opacity-0'"
        >
          <ul v-for="(v, i) in navigationBtns" :key="i + v.label">
            <router-link
              v-on:click="toggleNavbar"
              v-slot="{ href, navigate, isExactActive }"
              :to="{ name: v.routeName }"
              :custom="true"
              v-if="v.routeName"
              ><a
                :aria-expanded="v.isOpen?.value"
                :href="href"
                @click="navigate"
                :class="[
                  isExactActive
                    ? 'stroke-white text-white font-medium bg-primary'
                    : 'hover:bg-primary/5 ',
                  'relative flex items-center justify-between rounded-2xl font-poppins p-2 transition-colors duration-200',
                ]"
                ><div class="flex items-center space-x-3">
                  <component
                    :is="v.icon"
                    :key="v.icon"
                    :class="[
                      isExactActive ? 'stroke-white' : 'stroke-primary',
                      'size-5 shrink-0',
                    ]"
                  ></component>
                  <span class="flex items-center relative shrink-0"
                    >{{ v.label }}
                  </span>
                </div>
              </a></router-link
            >
            <div
              class="flex justify-center w-full flex-col gap-2 rounded-2xl"
              v-if="v.hasChildren"
            >
              <li
                @click="v.onClick"
                class="relative flex items-center justify-between bg-white hover:bg-primary/5 rounded-2xl font-poppins p-2 transition-colors duration-200"
              >
                <div class="flex items-center space-x-3">
                  <component
                    :is="v.icon"
                    :key="v.icon"
                    class="size-5 stroke-primary shrink-0"
                  ></component>
                  <span class="flex items-center relative shrink-0"
                    >{{ v.label }}
                  </span>
                </div>
                <component
                  v-if="v.dropDownIcon"
                  :is="v.dropDownIcon"
                  :key="v.dropDownIcon"
                  :class="[
                    'stroke-primary size-4 shrink-0 transition-transform duration-200',
                    v.isOpen?.value ? 'rotate-90' : 'rotate-0',
                  ]"
                ></component>
              </li>

              <transition appear @enter="enterDropdown" @leave="leaveDropdown">
                <div
                  class="flex flex-col w-full gap-1.5 p-2"
                  v-if="v.isOpen?.value"
                >
                  <router-link
                    v-on:click="toggleNavbar"
                    :to="{ name: r.routeName }"
                    :key="r.routeName + i"
                    v-for="(r, i) in v.childrens"
                    v-slot="{ isExactActive, navigate, href }"
                    :custom="true"
                  >
                    <a
                      :href="href"
                      @click="navigate"
                      :class="[
                        isExactActive
                          ? 'bg-primary  text-white border-primary shadow-md font-medium'
                          : 'hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm ',
                        'flex items-center shrink-0 relative pl-6  ml-2 pr-3 py-2.5 text-gray-800 transition-all duration-200 w-full rounded-xl border-gray-200 text-sm',
                      ]"
                    >
                      <span class="flex items-center text-wrap"
                        ><div
                          v-if="r"
                          :class="[
                            isExactActive ? 'bg-white' : 'bg-primary/40',
                          ]"
                          class="w-1.5 h-1.5 flex items-center rounded-full mr-3 shrink-0 text-nowrap"
                        ></div>
                        {{ r.label }}
                      </span>
                    </a></router-link
                  >
                </div>
              </transition>
            </div>
          </ul>
        </nav>
      </aside>
    </div>
    <!-- This is where I will render parent's view component: it is a vslot for router view of parent to render child view. -->
    <section class="flex-1 relative overflow-x-auto">
      <div class="w-full h-full">
        <slot name="router-view"></slot>
      </div>
    </section>
  </div>
</template>
<script lang="ts" setup>
import { gsap } from "gsap";
import {
  SquareChevronRight,
  CircleUserRound,
  SquareChevronLeft,
} from "lucide-vue-next";
import background from "../../../assets/images/background.png";
import AppHeader from "../../../features/shared/components/AppHeader.vue";
import { useDeviceDetection } from "../../../features/shared/composables/useDeviceDetection";
import { ref } from "vue";
import type { NavigationBtns } from "./types/featureBaseLayout";

const { isMobile } = useDeviceDetection();
const navbarOpen = ref(false);
const toggleNavbar = () => (navbarOpen.value = !navbarOpen.value);

defineProps<{
  navigationBtns: NavigationBtns;
  userName?: string;
  role?: string;
}>();

function enterDropdown(el: Element) {
  const element = el as HTMLElement;
  const initialHeight = element.offsetHeight;
  gsap.set(element, { height: 0, opacity: 0, overflow: "hidden" });
  gsap.to(element, {
    height: initialHeight,
    opacity: 1,
    duration: 0.25,
    ease: "power2.out",
    onComplete: () => {
      gsap.set(element, { height: "auto", overflow: "visible" });
    },
  });
}

function leaveDropdown(el: Element, done: () => void) {
  const element = el as HTMLElement;
  const currentHeight = element.offsetHeight;
  gsap.set(element, { height: currentHeight, overflow: "hidden" });
  gsap.to(element, {
    height: 0,
    opacity: 0,
    duration: 0.2,
    ease: "power2.in",
    onComplete: () => {
      done();
      gsap.set(element, { height: "", overflow: "" });
    },
  });
}
</script>
<style scoped>
nav {
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
</style>
