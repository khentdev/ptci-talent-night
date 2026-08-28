<template>
  <teleport to="body">
    <transition
      appear
      enter-active-class="transition-color duration-200 ease-out"
      leave-active-class="transition-color duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showForm"
        class="flex items-center p-4 py-10 justify-center bg-black/10 fixed inset-0 z-60 overflow-y-auto"
      >
        <div
          class="max-w-lg w-full bg-white shadow-lg rounded-2xl p-4 md:p-6 border border-gray-100"
        >
          <div class="w-full flex flex-col gap-2 md:gap-5">
            <div>
              <h2 class="text-lg md:text-2xl font-semibold text-gray-800">
                {{ title }}
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                {{ description }}
              </p>
            </div>
            <div class="border-t border-gray-200"></div>
            <slot />
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  showForm: boolean;
}>();
</script>
