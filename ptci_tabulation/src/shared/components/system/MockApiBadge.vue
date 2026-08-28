<template>
  <div
    v-if="IS_MOCK_API"
    class="fixed bottom-3 left-3 z-[80] flex items-center gap-2 rounded-full bg-amber-500/95 px-3 py-1.5 text-xs font-semibold text-white shadow-lg font-poppins"
    title="VITE_MOCK_API=true — API calls are answered locally, no backend is running."
  >
    <span>MOCK API</span>
    <button
      type="button"
      class="rounded-full bg-white/25 px-2 py-0.5 hover:bg-white/40 transition-colors cursor-pointer"
      title="Clear mock session & data, then reload"
      @click="resetMockApi"
    >
      Reset
    </button>
  </div>
</template>

<script setup lang="ts">
import { IS_MOCK_API, resetMockApi } from "../../../core/API/mockApi";
</script>
