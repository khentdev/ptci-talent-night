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
  import { ChevronRight, House, Venus, Mars, Star } from "lucide-vue-next";
  import type { NavigationBtns } from "../../shared/components/reusables/types/featureBaseLayout";
  const authStore = useAuthStore();

  const toggleMaleCandidates = ref(false);
  const toggleFemaleCandidates = ref(false);
  const toggleTopFiveCandidates = ref(false)

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
        {
          label: "Production Male",
          routeName: "male-candidates-production",
        },

        {
          label: "Uniform Male",
          routeName: "male-candidates-uniform",
        },

        {
          label: "Swimwear Male",
          routeName: "male-candidates-swimwear",
        },

        {
          label: "Formal Male",
          routeName: "male-candidates-formal",
        },
        {
          label: "Question and Answer Male",
          routeName: "male-candidates-QA",
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
        {
          label: "Production Female",
          routeName: "female-candidates-production",
        },
        {
          label: "Uniform Female",
          routeName: "female-candidates-uniform",
        },
        {
          label: "Swimwear Female",
          routeName: "female-candidates-swimwear",
        },
        {
          label: "Formal Female",
          routeName: "female-candidates-formal",
        },
        {
          label: "Question and Answer Female",
          routeName: "female-candidates-QA",
        },
      ],
    },
    {
      icon: Star,
      label: "Top 5 Candidates",
      dropDownIcon: ChevronRight,
      hasChildren: true,
      onClick: () => (toggleTopFiveCandidates.value = !toggleTopFiveCandidates.value),
      isOpen: toggleTopFiveCandidates,
      childrens: [{
        label: "Male Candidates",
        routeName: "male-candidates-top-five-qa"
      },
      {
        label: "Female Candidates",
        routeName: "female-candidates-top-five-qa"
      }]
    }
  ];
</script>
