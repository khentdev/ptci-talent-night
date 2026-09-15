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
  } from "lucide-vue-next";
  import { useAuthStore } from "../../features/auth/store/authStore";
  import type { NavigationBtns } from "../../shared/components/reusables/types/featureBaseLayout";

  const authStore = useAuthStore();

  const toggleTalentScoreboard = ref(false);
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
        {
          label: "Top 3 (Male & Female)",
          routeName: "overall-score-top3",
        },
      ],
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
        }
      ],
    },
  ];
</script>
