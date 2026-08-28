<template>
  <FeatureBaseLayout :navigation-btns="navigationBtns" :role="authStore.capitalizedRole"
    :user-name="authStore.capitalizedUsername"><template #router-view><router-view></router-view></template>
  </FeatureBaseLayout>
</template>

<script lang="ts" setup>
  import { ref } from "vue";
  import FeatureBaseLayout from "../../shared/components/reusables/FeatureBaseLayout.vue";
  import {
    Spotlight,
    ChartPie,
    ChevronRight,
    Settings,
    Award,
    Star,
    Shapes,
  } from "lucide-vue-next";
  import { useAuthStore } from "../../features/auth/store/authStore";
  import type { NavigationBtns } from "../../shared/components/reusables/types/featureBaseLayout";

  const authStore = useAuthStore();

  const toggleTalentScoreboard = ref(false);
  const toggleCategoryScoreboard = ref(false);
  const toggleSettings = ref(false);

  const navigationBtns: NavigationBtns = [
    {
      icon: ChartPie,
      label: "Overview",
      routeName: "dashboard-overview",
    },
    {
      icon: Spotlight,
      label: "Talent Scoreboard",
      dropDownIcon: ChevronRight,
      hasChildren: true,
      onClick: () =>
        (toggleTalentScoreboard.value = !toggleTalentScoreboard.value),
      isOpen: toggleTalentScoreboard,
      childrens: [
        {
          label: "Judges Scores Male",
          routeName: "talent-judge-male",
        },
        {
          label: "Judges Scores Female",
          routeName: "talent-judge-female",
        },
        {
          label: "Males Overall Score",
          routeName: "overall-score-male",
        },
        {
          label: "Females Overall Score",
          routeName: "overall-score-female",
        },
      ],
    },
    {
      icon: Shapes,
      label: "Category Scoreboard",
      dropDownIcon: ChevronRight,
      hasChildren: true,
      onClick: () =>
        (toggleCategoryScoreboard.value = !toggleCategoryScoreboard.value),
      isOpen: toggleCategoryScoreboard,
      childrens: [
        {
          label: "Production Score Male",
          routeName: "production-score-male",
        },
        {
          label: "Production Score Female",
          routeName: "production-score-female",
        },
        {
          label: "Uniform Score Male",
          routeName: "uniform-score-male",
        },
        {
          label: "Uniform Score Female",
          routeName: "uniform-score-female",
        },
        {
          label: "Swimwear Score Male",
          routeName: "swimwear-score-male",
        },
        {
          label: "Swimwear Score Female",
          routeName: "swimwear-score-female",
        },
        {
          label: "Formal Score Male",
          routeName: "formal-score-male",
        },
        {
          label: "Formal Score Female",
          routeName: "formal-score-female",
        },
        {
          label: "Question and Answer Score Male",
          routeName: "qa-score-male",
        },
        {
          label: "Question and Answer Score Female",
          routeName: "qa-score-female",
        },
      ],
    },
    {
      icon: Star,
      label: "Top 5 Candidates",
      dropDownIcon: ChevronRight,
      hasChildren: true,
    },
    {
      icon: Award,
      label: "Top 3 Finalists",
      dropDownIcon: ChevronRight,
      hasChildren: true,
    },
    {
      icon: Settings,
      label: "Settings",
      dropDownIcon: ChevronRight,
      hasChildren: true,
      onClick: () => (toggleSettings.value = !toggleSettings.value),
      isOpen: toggleSettings,
      childrens: [
        {
          label: "Manage Candidates",
          routeName: "manage-candidates",
        },
        {
          label: "Manage Judge Accounts",
          routeName: "manage-judge-accounts",
        },
        {
          label: "Manage Admin Accounts",
          routeName: "manage-admin-accounts",
        },
        {
          label: "Activity Logs",
          routeName: "activity-logs",
        },
      ],
    },
  ];
</script>
