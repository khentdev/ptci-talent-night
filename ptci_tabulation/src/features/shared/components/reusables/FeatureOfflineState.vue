<template>
  <div
    role="alert"
    class="relative flex flex-col items-center justify-center overflow-x-auto text-center px-6 py-10"
  >
    <div
      class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mx-auto"
    >
      <div class="flex justify-center mb-6">
        <div
          class="w-16 h-16 bg-primaryLight rounded-full flex items-center justify-center"
        >
          <wifi-off class="stroke-primary size-8 shrink-0" />
        </div>
      </div>

      <h2
        class="text-2xl font-bold text-gray-700 mb-3 font-poppins tracking-wide"
      >
        You’re Offline
      </h2>

      <p class="text-gray-600 mb-6 leading-relaxed font-lora italic">
        Please check your internet connection and try again.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WifiOff } from "lucide-vue-next";
</script>
