<template>
  <teleport to="body">
    <div
      class="fixed inset-0 w-full bg-white flex flex-col items-center justify-center gap-6 py-8 px-6 z-80"
    >
      <div
        class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center"
      >
        <div class="flex justify-center mb-6">
          <div
            class="size-16 bg-primaryLight rounded-full flex items-center justify-center"
          >
            <WifiOff class="size-8 stroke-primary" />
          </div>
        </div>

        <h2
          class="text-2xl font-bold text-gray-700 mb-3 font-poppins tracking-wide"
        >
          You’re Offline
        </h2>

        <p class="text-gray-600 mb-6 leading-relaxed font-lora italic">
          We'll automatically reconnect when your connection is restored.
        </p>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { WifiOff } from "lucide-vue-next";
import { useNetworkCheck } from "../../composables/useNetworkStatus";
import { watch } from "vue";
import { useGlobalUIBanner } from "../../store/useGlobalUIState";
import { useAuthStore } from "../../../features/auth/store/authStore";
const { isOnline } = useNetworkCheck();
const globalUI = useGlobalUIBanner();
const authStore = useAuthStore();

watch(isOnline, (online) => {
  if (
    online &&
    authStore.loadingState.sessionInitialized &&
    globalUI.isOnAppContext
  ) {
    window.location.reload();
  }
});
</script>
