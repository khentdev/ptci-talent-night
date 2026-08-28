<template>
  <teleport to="body">
    <transition
      appear
      enter-active-class="transition duration-200 ease-out"
      leave-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/10"
      >
        <div
          class="w-[90%] max-w-sm rounded-2xl bg-white shadow-xl border border-amber-100 overflow-hidden animate-in fade-in zoom-in duration-300"
        >
          <div class="h-2 w-full bg-amber-400"></div>

          <div class="p-6 text-center flex flex-col items-center gap-4">
            <div
              class="flex items-center justify-center size-14 rounded-full bg-amber-50"
            >
              <CircleAlert class="stroke-amber-400 size-8" />
            </div>

            <h2
              class="font-poppins font-semibold text-gray-900 text-lg tracking-wide"
            >
              {{ title }}
            </h2>

            <p class="text-gray-700 text-sm leading-relaxed max-w-xs">
              {{ description }}
            </p>

            <button
              @click="$emit('close')"
              class="mt-2 px-5 cursor-pointer py-2.5 rounded-full font-medium text-white bg-primary hover:bg-primary/90 transition-colors duration-200"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
<script lang="ts" setup>
import { CircleAlert } from "lucide-vue-next";
withDefaults(
  defineProps<{ title?: string; description?: string; show: boolean }>(),
  {
    title: "All fields must be filled up",
    description: "Complete all fields before submitting your scores.",
  }
);
defineEmits<{ close: [] }>();
</script>
