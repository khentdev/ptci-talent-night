import { useAuthStore } from '../auth/store/authStore'

import type { RouteRecordRaw } from 'vue-router'

function requireRulesAgreement() {
    const authStore = useAuthStore()
    authStore.initializeRulesAgreement()
    if (!authStore.rulesAgreed) return { name: "judge-home" }
}

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
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./male.candidates/Talent.vue")
    },
    {
        path: "female-candidates/talent",
        name: "female-candidates-talent",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./female.candidates/Talent.vue")
    },
]
