<template>
  <teleport to="body">
    <div
      class="flex items-center justify-center h-screen absolute inset-0 z-50 bg-white"
      v-if="authStore.loadingState.isRefreshingSession"
    >
      <div
        class="w-6 h-6 border-2 rounded-full border-primary border-t-transparent animate-spin"
      ></div></div
  ></teleport>
</template>

<script setup lang="ts">
import { useAuthStore } from "../../features/auth/store/authStore";
const authStore = useAuthStore();
</script>
