<template>
  <router-view v-slot="{ Component, route }">
    <component :is="Component" :key="route.name"></component>
  </router-view>
</template>
