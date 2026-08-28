<template>
  <router-view v-slot="{ Component }">
    <BaseGlobalUIState>
      <component :is="Component"></component
    ></BaseGlobalUIState>
  </router-view>
  <GlobalSessionLoading />
  <Toast />
  <MockApiBadge />
</template>
<script setup lang="ts">
import Toast from "./features/shared/components/toast/Toast.vue";
import GlobalSessionLoading from "./shared/components/GlobalSessionLoading.vue";
import BaseGlobalUIState from "./shared/components/system/BaseGlobalUIState.vue";
import MockApiBadge from "./shared/components/system/MockApiBadge.vue";
</script>
