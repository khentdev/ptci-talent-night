<template>
  <global-session-loading />
</template>
<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import GlobalSessionLoading from "../shared/components/GlobalSessionLoading.vue";
import { useAuthStore } from "../features/auth/store/authStore";
// I'll handle the token check here on very first app mount to check if user has a token already. 
const router = useRouter();
const authStore = useAuthStore();
onMounted(async () => {
  try {
    await authStore.refreshSession();
  } finally {
    if (!authStore.isLoggedIn) {
      router.push({ name: "login" });
    } else router.push({ name: "home-default" });
  }
});
</script>
