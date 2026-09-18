import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "../../features/auth/store/authStore";
import { authRoutes } from "../../features/auth/authRoutes";
import {
  homeRoutes,
} from "../../features/dashboard/dashboardRoutes";
import { talentRoutes } from "../../features/talent/talentRoutes";
import { settingsRoutes } from "../../features/settings/settingsRoutes";
import { clientRoutes } from "../../features/client/clientRoutes";

import type { RouteRecordRaw } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean;
    /** Role required to enter. Enforced by the global guard below. */
    role?: "admin" | "judge";
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "",
    name: "root",
    component: () => import("../../views/initialMount.vue"),
  },
  {
    path: "/auth",
    name: "auth",
    component: () => import("../layouts/authLayout.vue"),
    redirect: { name: "login" },
    children: [...authRoutes],
  },
  {
    path: "/home",
    name: "home",
    component: () => import("../layouts/appLayout.vue"),
    redirect: { name: "home-default" },
    children: [...homeRoutes],
  },
  {
    path: "/dashboard",
    name: "dashboard",
    meta: { requiresAuth: true, role: "admin" },
    redirect: { name: "talent-judge-male" },
    component: () => import("../layouts/dashboardLayout.vue"),
    children: [
      ...talentRoutes,
      ...settingsRoutes,
      {
        path: ":pathMatch(.*)*",
        name: "dashboard-not-found",
        meta: { requiresAuth: true },
        component: () =>
          import("../../features/shared/components/404/AppNotFound.vue"),
      },
    ],
  },
  {
    path: "/judge",
    name: "judge",
    component: () => import("../layouts/ClientLayout.vue"),
    redirect: { name: "judge-home" },
    meta: { requiresAuth: true, role: "judge" },
    children: [...clientRoutes],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "global-not-found",
    component: () => import("../../views/404/Global404NotFound.vue"),
  },
];
export const router = createRouter({
  history: createWebHistory(),
  routes,
});
router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  if (!to.matched.some((r) => r.meta.requiresAuth)) return true;

  if (!authStore.loadingState.sessionInitialized) {
    await authStore.refreshSession();
  }

  const user = authStore.getUserMetaData;
  if (!user) return { name: "login" };

  const required = to.matched.find((r) => r.meta.role)?.meta.role;
  if (required && user.role !== required) return { name: "home-default" };

  return true;
});
