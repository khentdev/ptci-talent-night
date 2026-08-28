<template>
  <GlobalOfflineUI v-if="global.isAppOffline && global.isOnAppContext" />
  <GlobalServerUI v-else-if="global.isServerError && global.isOnAppContext" />
  <slot v-else></slot>
</template>
<script setup lang="ts">
import { useGlobalUIBanner } from "../../store/useGlobalUIState";
import GlobalOfflineUI from "./GlobalOfflineUI.vue";
import GlobalServerUI from "./GlobalServerUI.vue";
const global = useGlobalUIBanner();
</script>
