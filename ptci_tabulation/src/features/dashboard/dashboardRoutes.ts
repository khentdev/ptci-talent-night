import type { RouteRecordRaw } from "vue-router";

export const homeRoutes: RouteRecordRaw[] = [
  {
    path: "",
    name: "home-default",
    component: () => import("./views/Homepage.vue"),
  },
];

export const dashboardOverviewRoutes: RouteRecordRaw[] = [
  {
    path: "overview",
    name: "dashboard-overview",
    meta: { requiresAuth: true },
    component: () => import("./views/Overview.vue"),
  },
];
