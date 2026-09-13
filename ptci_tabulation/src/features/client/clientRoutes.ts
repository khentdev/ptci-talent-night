import type { RouteRecordRaw } from 'vue-router'

export const clientRoutes: RouteRecordRaw[] = [
    {
        path: "home",
        name: "judge-home",
        meta: { requiresAuth: true },
        component: () => import("./Home.vue")
    },
    {
        path: "male-candidates/talent",
        name: "male-candidates-talent",
        meta: { requiresAuth: true },
        component: () => import("./male.candidates/Talent.vue")
    },
    {
        path: "female-candidates/talent",
        name: "female-candidates-talent",
        meta: { requiresAuth: true },
        component: () => import("./female.candidates/Talent.vue")
    },
]
