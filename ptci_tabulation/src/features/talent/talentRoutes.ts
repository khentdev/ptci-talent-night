import type { RouteRecordRaw } from 'vue-router'

export const talentRoutes: RouteRecordRaw[] = [
    {
        path: "talent/males-score",
        name: "talent-judge-male",
        meta: { requiresAuth: true },
        component: () => import("./views/JudgeScoresMale.vue")
    },
    {
        path: "talent/female-score",
        name: "talent-judge-female",
        meta: { requiresAuth: true },
        component: () => import("./views/JudgeScoresFemale.vue")
    },
    {
        path: "talent/overall-score-male",
        name: "overall-score-male",
        meta: { requiresAuth: true },
        component: () => import("./views/OverallScoreMale.vue")
    },
    {
        path: "talent/overall-score-female",
        name: "overall-score-female",
        meta: { requiresAuth: true },
        component: () => import("./views/OverallScoreFemale.vue")
    },
]
