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
        path: "male-candidates/production",
        name: "male-candidates-production",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./male.candidates/Production.vue")
    },
    {
        path: "male-candidates/uniform",
        name: "male-candidates-uniform",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./male.candidates/Uniform.vue")
    },
    {
        path: "male-candidates/swimwear",
        name: "male-candidates-swimwear",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./male.candidates/Swimwear.vue")
    },
    {
        path: "male-candidates/formal",
        name: "male-candidates-formal",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./male.candidates/Formal.vue")
    },
    {
        path: "male-candidates/question-and-answer",
        name: "male-candidates-QA",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./male.candidates/QuestionAnswer.vue")
    },
    {
        path: "female-candidates/talent",
        name: "female-candidates-talent",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./female.candidates/Talent.vue")
    },
    {
        path: "female-candidates/production",
        name: "female-candidates-production",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./female.candidates/Production.vue")
    },
    {
        path: "female-candidates/uniform",
        name: "female-candidates-uniform",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./female.candidates/Uniform.vue")
    },
    {
        path: "female-candidates/swimwear",
        name: "female-candidates-swimwear",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./female.candidates/Swimwear.vue")
    },
    {
        path: "female-candidates/formal",
        name: "female-candidates-formal",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./female.candidates/Formal.vue")
    },
    {
        path: "female-candidates/question-and-answer",
        name: "female-candidates-QA",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./female.candidates/QuestionAnswer.vue")
    },
    {
        path: "male-candidates/top-five/question-and-answer",
        name: "male-candidates-top-five-qa",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./top-five/TopFiveMaleCandidates.vue")
    },
    {
        path: "female-candidates/top-five/question-and-answer",
        name: "female-candidates-top-five-qa",
        meta: { requiresAuth: true, requiresRulesAgreement: true },
        beforeEnter: requireRulesAgreement,
        component: () => import("./top-five/TopFiveFemaleCandidates.vue")
    },
]
