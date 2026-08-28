import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '../../features/auth/store/authStore';
import { authRoutes } from '../../features/auth/authRoutes';
import { homeRoutes, dashboardOverviewRoutes } from '../../features/dashboard/dashboardRoutes';
import { talentRoutes } from '../../features/talent/talentRoutes';
import { categoryRoutes } from '../../features/category/categoryRoutes';
import { settingsRoutes } from '../../features/settings/settingsRoutes';
import { clientRoutes } from '../../features/client/clientRoutes';

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
        children: [...authRoutes]
    },
    {
        path: "/home",
        name: "home",
        component: () => import("../layouts/appLayout.vue"),
        meta: { requiresAuth: true },
        redirect: { name: "home-default" },
        children: [...homeRoutes]
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
        children: [
            ...dashboardOverviewRoutes,
            ...talentRoutes,
            ...categoryRoutes,
            ...settingsRoutes,
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
        children: [...clientRoutes]
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
