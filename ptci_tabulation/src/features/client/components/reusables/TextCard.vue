<template>
  <div
    class="py-3 md:py-4 bg-gradient-to-r from-primaryLight/10 to-gray-50 rounded-xl flex items-center relative shadow-sm border border-primary/10 hover:shadow-md transition-all duration-200"
    v-for="v in rules"
  >
    <div class="w-1 absolute left-0 h-full top-0 bg-primary rounded-full"></div>
    <div class="flex text-wrap break-words max-w-full text-gray-800 ml-6 px-4">
      <template v-if="v.boldTitle">
        <div class="space-y-1">
          <span
            class="font-bold text-gray-800 md:text-base text-sm font-lora"
            >{{ v.boldTitle }}</span
          >
          <span
            class="font-medium text-gray-700 md:text-base text-sm font-poppins block"
            >{{ v.text }}</span
          >
        </div>
      </template>
      <template v-else>
        <span
          class="font-medium text-gray-700 md:text-base text-sm font-poppins"
          >{{ v.text }}</span
        >
      </template>
    </div>
  </div>
</template>
<script lang="ts" setup>
type Rules = {
  boldTitle?: string;
  text: string;
}[];
defineProps<{ rules: Rules }>();
</script>
