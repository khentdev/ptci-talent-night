import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '../../features/auth/store/authStore';

import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: "",
        name: "root",
        component: () => import("../../views/initialMount.vue")
    },
    {
        path: "/auth",
        name: "auth",
        component: () => import("../layouts/authLayout.vue"),
        redirect: { name: "login" },
        children: [{
            path: "login",
            name: "login",
            component: () => import("../../features/auth/views/Login.vue")
        }]
    },
    {
        path: "/home",
        name: "home",
        component: () => import("../layouts/appLayout.vue"),
        meta: { requiresAuth: true },
        redirect: { name: "home-default" },
        children: [{
            path: "",
            name: "home-default",
            meta: { requiresAuth: true },
            component: () => import("../../features/dashboard/views/Homepage.vue"),
        },
        ]
    },
    {
        path: "/dashboard",
        name: "dashboard",
        meta: { requiresAuth: true },
        redirect: { name: "dashboard-overview" },
        component: () => import("../layouts/dashboardLayout.vue"),
        beforeEnter: () => {
            const authStore = useAuthStore()
            if (!authStore.isLoggedIn || authStore.getUserMetaData?.role !== "admin")
                return { name: "home-default" }
        },
        children: [{
            path: "overview",
            name: "dashboard-overview",
            meta: { requiresAuth: true },
            component: () => import("../../features/dashboard/views/Overview.vue"),
        }, {
            path: "talent/males-score",
            name: "talent-judge-male",
            meta: { requiresAuth: true },
            component: () => import("../../features/talent/views/JudgeScoresMale.vue")
        },
        {
            path: "talent/female-score",
            name: "talent-judge-female",
            meta: { requiresAuth: true },
            component: () => import("../../features/talent/views/JudgeScoresFemale.vue")
        },
        {
            path: "talent/overall-score-male",
            name: "overall-score-male",
            meta: { requiresAuth: true },
            component: () => import("../../features/talent/views/OverallScoreMale.vue")
        },
        {
            path: "talent/overall-score-female",
            name: "overall-score-female",
            meta: { requiresAuth: true },
            component: () => import("../../features/talent/views/OverallScoreFemale.vue")
        },
        {
            path: "category/production-male",
            name: "production-score-male",
            meta: { requiresAuth: true },
            component: () => import("../../features/category/views/ProductionScore/ProductionScoreMale.vue")
        },
        {
            path: "category/production-female",
            name: "production-score-female",
            meta: { requiresAuth: true },
            component: () => import("../../features/category/views/ProductionScore/ProductionScoreFemale.vue")
        },
        {
            path: "category/uniform-male",
            name: "uniform-score-male",
            meta: { requiresAuth: true },
            component: () => import("../../features/category/views/UniformScore/UniformScoreMale.vue")

        },
        {
            path: "category/uniform-female",
            name: "uniform-score-female",
            meta: { requiresAuth: true },
            component: () => import("../../features/category/views/UniformScore/UniformScoreFemale.vue")
        },
        {
            path: "category/swimwear-male",
            name: "swimwear-score-male",
            meta: { requiresAuth: true },
            component: () => import("../../features/category/views/SwimwearScore/SwimwearScoreMale.vue")
        },
        {
            path: "category/swimwear-female",
            name: "swimwear-score-female",
            meta: { requiresAuth: true },
            component: () => import("../../features/category/views/SwimwearScore/SwimwearScoreFemale.vue")
        },
        {
            path: "category/formal-male",
            name: "formal-score-male",
            meta: { requiresAuth: true },
            component: () => import("../../features/category/views/FormalWearScore/FormalWearScoreMale.vue")
        },
        {
            path: "category/formal-female",
            name: "formal-score-female",
            meta: { requiresAuth: true },
            component: () => import("../../features/category/views/FormalWearScore/FormalWearScoreFemale.vue")
        },

        // Tops Candidates and Tops Finalists are here


        // --

        // settings and shits are here
        {
            path: "settings/manage-candidates",
            name: "manage-candidates",
            meta: { requiresAuth: true },
            component: () => import("../../features/settings/views/ManageCandidates.vue")
        },
        {
            path: "settings/manage-judge-accounts",
            name: "manage-judge-accounts",
            meta: { requiresAuth: true },
            component: () => import("../../features/settings/views/ManageJudgeAccounts.vue")
        },
        {
            path: "settings/manage-admin-accounts",
            name: "manage-admin-accounts",
            meta: { requiresAuth: true },
            component: () => import("../../features/settings/views/ManageAdminAccounts.vue")
        },
        {
            path: "settings/activity-logs",
            name: "activity-logs",
            meta: { requiresAuth: true },
            component: () => import("../../features/settings/views/ActivityLogs.vue")
        },
        {
            path: ":pathMatch(.*)*",
            name: "dashboard-not-found",
            meta: { requiresAuth: true },
            component: () => import("../../features/shared/components/404/AppNotFound.vue")
        }
        ]
    },
    {
        path: "/judge",
        name: "judge",
        component: () => import("../layouts/ClientLayout.vue"),
        redirect: { name: "judge-home" },
        meta: { requiresAuth: true },
        // beforeEnter: () => {
        //     const authStore = useAuthStore()
        //     if (!authStore.isLoggedIn || authStore.getUserMetaData?.role !== "judge")
        //         return { name: "home-default" }
        // },
        children: [{
            path: "home",
            name: "judge-home",
            meta: { requiresAuth: true },
            component: () => import("../../features/client/Home.vue")
        },
        {
            path: "male-candidates/talent",
            name: "male-candidates-talent",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/male.candidates/Talent.vue")
        },
        {
            path: "male-candidates/production",
            name: "male-candidates-production",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/male.candidates/Production.vue")
        },
        {
            path: "male-candidates/uniform",
            name: "male-candidates-uniform",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/male.candidates/Uniform.vue")
        },
        {
            path: "male-candidates/swimwear",
            name: "male-candidates-swimwear",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/male.candidates/Swimwear.vue")
        },
        {
            path: "male-candidates/formal",
            name: "male-candidates-formal",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/male.candidates/Formal.vue")
        },
        {
            path: "male-candidates/question-and-answer",
            name: "male-candidates-QA",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/male.candidates/QuestionAnswer.vue")
        },
        {
            path: "female-candidates/talent",
            name: "female-candidates-talent",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/female.candidates/Talent.vue")
        },
        {
            path: "female-candidates/production",
            name: "female-candidates-production",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/female.candidates/Production.vue")
        },
        {
            path: "female-candidates/uniform",
            name: "female-candidates-uniform",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/female.candidates/Uniform.vue")
        },
        {
            path: "female-candidates/swimwear",
            name: "female-candidates-swimwear",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/female.candidates/Swimwear.vue")
        },
        {
            path: "female-candidates/formal",
            name: "female-candidates-formal",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/female.candidates/Formal.vue")
        },
        {
            path: "female-candidates/question-and-answer",
            name: "female-candidates-QA",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/female.candidates/QuestionAnswer.vue")
        },
        {
            path: "male-candidates/top-five/question-and-answer",
            name: "male-candidates-top-five-qa",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/top-five/TopFiveMaleCandidates.vue")
        },

        {
            path: "female-candidates/top-five/question-and-answer",
            name: "female-candidates-top-five-qa",
            meta: { requiresAuth: true, requiresRulesAgreement: true },
            beforeEnter: () => {
                const authStore = useAuthStore()
                authStore.initializeRulesAgreement()
                if (!authStore.rulesAgreed) return { name: "judge-home" }
            },
            component: () => import("../../features/client/top-five/TopFiveFemaleCandidates.vue")
        },
        ]
    },
    {
        path: "/:pathMatch(.*)*",
        name: "global-not-found",
        component: () => import("../../views/404/Global404NotFound.vue")
    }

]
export const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    console.log("Guard entry:", {
        original: to.fullPath,
        toName: to.name,
        toPath: to.path,
        fromName: from.name,
    });

    const authStore = useAuthStore()

    const requiresAuth = to.matched.some(r => r.meta.requiresAuth)
    if (!requiresAuth) return next()

    if (requiresAuth && !authStore.loadingState.sessionInitialized) {
        if (authStore.isLoggedIn) return next()
        const res = await authStore.refreshSession()
        if (!res.success && res.logout) return next({ name: "login" })
    }
    return next()
})