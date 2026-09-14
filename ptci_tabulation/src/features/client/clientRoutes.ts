import type { RouteRecordRaw } from "vue-router";
import { useAuthStore } from "../auth/store/authStore.ts";

export const clientRoutes: RouteRecordRaw[] = [
  {
    path: "home",
    name: "judge-home",
    meta: { requiresAuth: true },
    component: () => import("./Home.vue"),
    beforeEnter: () => {
      const authStore = useAuthStore();
      if (authStore.getUserMetaData?.role === "admin") {
        return { name: "home-default" };
      }
    },
  },
  {
    path: "male-candidates/talent",
    name: "male-candidates-talent",
    meta: { requiresAuth: true },
    component: () => import("./male.candidates/Talent.vue"),
    beforeEnter: () => {
      const authStore = useAuthStore();
      if (authStore.getUserMetaData?.role === "admin") {
        return { name: "home-default" };
      }
    },
  },
  {
    path: "female-candidates/talent",
    name: "female-candidates-talent",
    meta: { requiresAuth: true },
    component: () => import("./female.candidates/Talent.vue"),
    beforeEnter: () => {
      const authStore = useAuthStore();
      if (authStore.getUserMetaData?.role === "admin") {
        return { name: "home-default" };
      }
    },
  },
];
