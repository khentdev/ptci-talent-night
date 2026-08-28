<template>
  <Transition
    tag="div"
    class="absolute inset-0 z-30 flex items-center justify-center bg-white/80 backdrop-blur-sm"
    enter-active-class="transition-opacity duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div class="flex items-center gap-2 text-gray-600">
      <div
        class="w-5 h-5 border-2 border-gray-400 rounded-full animate-spin border-t-transparent"
      ></div>
      <span class="text-sm md:text-base">
        {{ text }}
      </span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
type Props = {
  text?: string;
};
withDefaults(defineProps<Props>(), {
  text: "Fetching latest data...",
});
</script>
