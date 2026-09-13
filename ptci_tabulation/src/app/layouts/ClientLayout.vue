<template>
  <feature-base-layout :navigation-btns="navigationBtns" :user-name="authStore.capitalizedUsername"
    :role="authStore.capitalizedRole">
    <template #router-view><router-view></router-view></template>
  </feature-base-layout>
</template>
<script setup lang="ts">
  import { ref } from "vue";
  import { useAuthStore } from "../../features/auth/store/authStore";
  import FeatureBaseLayout from "../../shared/components/reusables/FeatureBaseLayout.vue";
  import { ChevronRight, House, Venus, Mars } from "lucide-vue-next";
  import type { NavigationBtns } from "../../shared/components/reusables/types/featureBaseLayout";
  const authStore = useAuthStore();

  const toggleMaleCandidates = ref(false);
  const toggleFemaleCandidates = ref(false);

  const navigationBtns: NavigationBtns = [
    {
      icon: House,
      label: "Home",
      routeName: "judge-home",
    },
    {
      icon: Mars,
      label: "Male Candidates",
      dropDownIcon: ChevronRight,
      hasChildren: true,
      onClick: () => (toggleMaleCandidates.value = !toggleMaleCandidates.value),
      isOpen: toggleMaleCandidates,
      childrens: [
        {
          label: "Talent Male",
          routeName: "male-candidates-talent",
        },
      ],
    },
    {
      icon: Venus,
      label: "Female Candidates",
      dropDownIcon: ChevronRight,
      hasChildren: true,
      onClick: () =>
        (toggleFemaleCandidates.value = !toggleFemaleCandidates.value),
      isOpen: toggleFemaleCandidates,
      childrens: [
        {
          label: "Talent Female",
          routeName: "female-candidates-talent",
        },
      ],
    },
  ];
</script>
