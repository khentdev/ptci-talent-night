import type { RouteRecordRaw } from 'vue-router'

export const settingsRoutes: RouteRecordRaw[] = [
    {
        path: "settings/manage-candidates",
        name: "manage-candidates",
        meta: { requiresAuth: true },
        component: () => import("./views/ManageCandidates.vue")
    },
    {
        path: "settings/manage-judge-accounts",
        name: "manage-judge-accounts",
        meta: { requiresAuth: true },
        component: () => import("./views/ManageJudgeAccounts.vue")
    },
    {
        path: "settings/manage-admin-accounts",
        name: "manage-admin-accounts",
        meta: { requiresAuth: true },
        component: () => import("./views/ManageAdminAccounts.vue")
    },
    {
        path: "settings/activity-logs",
        name: "activity-logs",
        meta: { requiresAuth: true },
        component: () => import("./views/ActivityLogs.vue")
    },
]
