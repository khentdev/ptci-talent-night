<template>
  <div
    class="bg-gray-50 md:px-6 md:py-4 px-4 py-4 items-center border-b border-gray-200 flex justify-between"
  >
    <div>
      <h2 class="md:text-xl text-lg font-semibold text-gray-800">
        {{ title }}
      </h2>
      <p class="text-xs md:text-sm text-gray-600 mt-1 max-w-4/5 sm:max-w-full">
        {{ description }}
      </p>
    </div>
    <div class="justify-between flex items-center gap-3">
      <button
        v-if="popupFn"
        @click="popupFn"
        :title="popupFnTitle"
        :class="[popupFnName ? 'py-2 px-2 md:px-3 space-x-3' : 'size-9']"
        class="inline-flex cursor-pointer items-center justify-center bg-primary/70 hover:bg-primary/80 text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm hover:shadow-md"
      >
        <template v-if="!isMobile && hasIcon">
          <span>{{ popupFnName }}</span>
        </template>
        <Menu v-if="hasIcon && isMobile" class="size-5 shrink-0" />
      </button>
      <button
        v-if="actionFn"
        @click="actionFn"
        :class="[actionFnName ? 'py-2 px-2 md:px-3 space-x-3' : 'size-9']"
        class="inline-flex cursor-pointer items-center justify-center bg-primary font-medium hover:bg-primary/90 text-white rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm hover:shadow-md"
        :title="actionFnTitle"
      >
        <template v-if="!isMobile && hasIcon">
          <span>{{ actionFnName }}</span>
        </template>
        <plus v-if="hasIcon && isMobile" class="size-5 shrink-0" />
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Plus ,Menu} from "lucide-vue-next";
import { useDeviceDetection } from "../../composables/useDeviceDetection";

const { isMobile } = useDeviceDetection();
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    actionFn?: () => void;
    popupFn?: () => void;
    popupFnName?: string;
    popupFnTitle?: string;
    actionFnName?: string;
    actionFnTitle?: string;
    hasIcon?: boolean;
  }>(),
  {
    title: "Manage your data",
    description: "View and manage all data here.",
    hasIcon: false,
  }
);
</script>
