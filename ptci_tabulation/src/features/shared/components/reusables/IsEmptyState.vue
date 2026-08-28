<template>
  <div
    class="flex flex-col items-center justify-center py-16 px-6 absolute inset-0"
  >
    <div
      class="size-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"
    >
      <FileText class="size-8 text-gray-400" />
    </div>
    <p class="text-sm text-gray-500">No data available yet</p>
  </div>
</template>

<script setup lang="ts">
import { FileText } from "lucide-vue-next";
</script>
