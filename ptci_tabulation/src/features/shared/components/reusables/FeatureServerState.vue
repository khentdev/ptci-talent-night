<template>
  <div
    class="absolute inset-0 flex flex-col items-center justify-center bg-white text-center gap-4"
  >
    <div class="flex flex-col items-center justify-center gap-3 p-5">
      <CircleAlert class="stroke-primary size-10 shrink-0" />

      <h2 class="text-2xl font-semibold text-gray-700 font-poppins">
        {{ title || "Server Error" }}
      </h2>

      <p class="text-gray-500 max-w-sm font-lora">
        {{
          message || "We couldn’t load the requested data. Please try again."
        }}
      </p>
    </div>

    <button
      @click="handleRetry"
      class="mt-3 px-6 py-2 text-sm font-medium text-white bg-primary rounded-xl shadow-md hover:bg-primary/90 cursor-pointer focus:ring-2 focus:ring-primary transition-all duration-200"
    >
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
import { CircleAlert } from "lucide-vue-next";
interface Props {
  title?: string;
  message?: string;
  onRetry: () => void;
}

const props = defineProps<Props>();

function handleRetry() {
  if (props.onRetry) props.onRetry();
}
</script>
