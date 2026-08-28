import { defineStore } from 'pinia';
import { computed, readonly, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { InfraErrorMessages } from '../../core/errors/infraMessages';

type AuthRoutes = "login";
type ServerTypeOption = keyof typeof InfraErrorMessages | null
type ServerStateParams = { msg?: string, type: ServerTypeOption }

const isProd = import.meta.env.PROD
export const useGlobalUIBanner = defineStore("globalBanner", () => {
    const route = useRoute()

    const serverMessage = ref<undefined | string>("")
    const serverType = ref<ServerTypeOption>(null)
    const isServerError = ref(false)
    const isAppOffline = ref(false)

    const isOnAppContext = computed(() =>
        !(["login"] as AuthRoutes[]).includes(route.name as AuthRoutes)
    );

    const setOfflineUI = (val: boolean) => isAppOffline.value = val
    const setServerState = (val: boolean, { msg, type }: ServerStateParams) => { isServerError.value = val; serverMessage.value = msg, serverType.value = type }

    if (!isProd) watch([isServerError, isAppOffline], ([error, offline]) => {
        console.info("Server Error:", error)
        console.info("App offline:", offline)
    })

    return {
        setOfflineUI,
        setServerState,
        serverType: readonly(serverType),
        isAppOffline: readonly(isAppOffline),
        isServerError: readonly(isServerError),
        isOnAppContext: readonly(isOnAppContext),
        serverMessage: readonly(serverMessage)
    }
})