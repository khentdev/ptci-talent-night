<template>
  <div
    role="alert"
    class="fixed inset-0 w-full bg-white flex flex-col items-center justify-center gap-6 py-8 px-6 z-70"
  >
    <div
      class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center"
    >
      <div class="flex justify-center mb-6">
        <div
          class="size-16 bg-primaryLight rounded-full flex items-center justify-center"
        >
          <AlertTriangle class="stroke-red-500 size-8 shrink-0" />
        </div>
      </div>

      <h2
        class="text-2xl font-bold text-gray-700 mb-3 font-poppins tracking-wide"
      >
        Something went wrong
      </h2>

      <p class="text-gray-600 mb-6 leading-relaxed font-lora italic">
        We ran into a problem connecting to the server. Please try again.
      </p>

      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="handleRetry"
          class="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          Retry
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle } from "lucide-vue-next";
const handleRetry = () => {
  window.location.reload();
};
</script>
