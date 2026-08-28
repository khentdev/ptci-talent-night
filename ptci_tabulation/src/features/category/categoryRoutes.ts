import type { RouteRecordRaw } from 'vue-router'

export const categoryRoutes: RouteRecordRaw[] = [
    {
        path: "category/production-male",
        name: "production-score-male",
        meta: { requiresAuth: true },
        component: () => import("./views/ProductionScore/ProductionScoreMale.vue")
    },
    {
        path: "category/production-female",
        name: "production-score-female",
        meta: { requiresAuth: true },
        component: () => import("./views/ProductionScore/ProductionScoreFemale.vue")
    },
    {
        path: "category/uniform-male",
        name: "uniform-score-male",
        meta: { requiresAuth: true },
        component: () => import("./views/UniformScore/UniformScoreMale.vue")

    },
    {
        path: "category/uniform-female",
        name: "uniform-score-female",
        meta: { requiresAuth: true },
        component: () => import("./views/UniformScore/UniformScoreFemale.vue")
    },
    {
        path: "category/swimwear-male",
        name: "swimwear-score-male",
        meta: { requiresAuth: true },
        component: () => import("./views/SwimwearScore/SwimwearScoreMale.vue")
    },
    {
        path: "category/swimwear-female",
        name: "swimwear-score-female",
        meta: { requiresAuth: true },
        component: () => import("./views/SwimwearScore/SwimwearScoreFemale.vue")
    },
    {
        path: "category/formal-male",
        name: "formal-score-male",
        meta: { requiresAuth: true },
        component: () => import("./views/FormalWearScore/FormalWearScoreMale.vue")
    },
    {
        path: "category/formal-female",
        name: "formal-score-female",
        meta: { requiresAuth: true },
        component: () => import("./views/FormalWearScore/FormalWearScoreFemale.vue")
    },
    {
        path: "category/qa-male",
        name: "qa-score-male",
        meta: { requiresAuth: true },
        component: () => import("./views/QAScore/QuestionAndAnswerMale.vue")
    },
    {
        path: "category/qa-female",
        name: "qa-score-female",
        meta: { requiresAuth: true },
        component: () => import("./views/QAScore/QuestionAndAnswerFemale.vue")
    },
]
