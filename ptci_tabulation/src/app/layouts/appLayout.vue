<template>
 <AppHeader/>
  <router-view v-slot="{ Component }">
    <component :is="Component"></component>
  </router-view>
</template>
<script setup lang="ts">
import AppHeader from '../../features/shared/components/AppHeader.vue';
</script>
