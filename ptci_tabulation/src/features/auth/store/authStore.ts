import type { AxiosError } from "axios";
import { defineStore } from "pinia";
import { computed, reactive, readonly, ref } from "vue";
import type { LoginErrorResponse, LoginParams, UserData } from "../types/types";
import { authErrorHandler } from "../../errors/authErrorHandler";
import { authService } from "../services/authService";
import { useGlobalUIBanner } from "../../../shared/store/useGlobalUIState";
import { CapitalizeLabel } from "../../../utils/capitalizeWord";

export const useAuthStore = defineStore("auth", () => {

    const global = useGlobalUIBanner()
    const loadingState = reactive({
        isLoggingIn: false,
        isLoggingOut: false,

        isRefreshingSession: false,
        sessionInitialized: false
    })

    const loginErrors = reactive({
        invalidCredentials: "",
        general: ""
    })

    const setLogin = ref<boolean | null>(null)
    const isLoggedIn = computed(() => setLogin.value)

    const clearLoginErrors = () => Object.keys(loginErrors).forEach(key => loginErrors[key as keyof typeof loginErrors] = "")

    const userMetaData = ref<UserData | null>(null)
    const rulesAgreed = ref<boolean>(false)

    const setUserMetaData = ({ id, role, username, has_submitted }: UserData) => {
        userMetaData.value = {
            id,
            role,
            username,
            has_submitted
        }
    }

    const setUserHasSubmitted = async () => {
        try {
            const res = await authService.markUserAsSubmitted()
            if (userMetaData.value !== null) {
                userMetaData.value = { ...userMetaData.value, has_submitted: res.has_submitted }
            }
        } catch (err) {
            throw err;
        }
    }

    const setUserMetaDataAfterScoreSubmit = (val: boolean) => {
        if (userMetaData.value !== null) {
            userMetaData.value = { ...userMetaData.value, has_submitted: val }
        }
    }


    const setRulesAgreed = (agreed: boolean) => {
        // I'll handle the API endpoint for agreement here
        // 
        rulesAgreed.value = agreed
        localStorage.setItem('rulesAgreed', agreed.toString())
    }

    const initializeRulesAgreement = () => {
        const stored = localStorage.getItem('rulesAgreed')
        if (stored !== null) {
            rulesAgreed.value = stored === 'true'
        }
    }

    const capitalizedUsername = computed(() => {
        if (getUserMetaData.value)
            return CapitalizeLabel(getUserMetaData?.value?.username);
    });

    const capitalizedRole = computed(() => {
        if (getUserMetaData.value)
            return CapitalizeLabel(getUserMetaData?.value.role);
    });

    const clearSession = () => {
        userMetaData.value = null
        setLogin.value = null
        rulesAgreed.value = false
        localStorage.removeItem('rulesAgreed')
    }
    const getUserMetaData = computed(() => userMetaData.value)

    type LoginUserReturnType = { success: boolean }
    const loginUser = async ({ username, password }: LoginParams): Promise<LoginUserReturnType> => {

        if (loadingState.isLoggingIn) return { success: false }

        loadingState.isLoggingIn = true
        try {
            const res = await authService.loginUser({ username, password })

            setLogin.value = res.loggedIn
            setUserMetaData({ id: res.user.id, role: res.user.role, username: res.user.username, has_submitted: res.user.has_submitted })
            return { success: true }
        } catch (err) {
            const error = err as AxiosError<LoginErrorResponse>
            const parsed = authErrorHandler(error)
            const infraMaps = [
                "offline",
                "unreachable",
                "serverError",
                "requestTimeout"
            ]
            if (infraMaps.includes(parsed.type)) {
                loginErrors.general = parsed.message
            }
            if (error.response?.data.status === 401 || error.response?.data.status === 422) {
                loginErrors.invalidCredentials = "Invalid username or password."
            }
            if (error.response?.status === 429) {
                loginErrors.general = error.response.data?.message || "Too many login attempts. Please wait a few minutes and try again."
            }

            return { success: false }

        } finally {
            loadingState.isLoggingIn = false
        }
    }

    const logoutUser = async () => {
        if (loadingState.isLoggingOut) return
        loadingState.isLoggingOut = true
        try {
            await authService.logoutUser()
        } catch {
            // Cookie may already be gone - clear the local session regardless.
        } finally {
            clearSession()
            loadingState.isLoggingOut = false
        }
    }

    let refreshPromise: Promise<{ success: boolean, logout: boolean }> | null = null
    const refreshSession = async () => {
        if (loadingState.isRefreshingSession && refreshPromise) return await refreshPromise

        loadingState.isRefreshingSession = true

        refreshPromise = (async () => {
            const MAX_RETRY = 3
            for (let retry = 0; retry < MAX_RETRY; retry++) {
                try {
                    const res = await authService.checkSession()
                    if (res?.loggedIn && res?.user) {
                        const userData: UserData = {
                            id: res.user.id,
                            username: res.user.username,
                            role: res.user.role,
                            has_submitted: res.user.has_submitted
                        }
                        setLogin.value = true
                        userMetaData.value = userData
                        return { success: true, logout: false }
                    }
                } catch (err) {
                    const error = err as AxiosError<LoginErrorResponse>
                    const parsed = authErrorHandler(error)
                    if (parsed.type === "unreachable" && retry < MAX_RETRY - 1) {
                        const maxDelay = 10000
                        const delay = Math.min(1000 * (2 ** retry), maxDelay)
                        await new Promise(r => window.setTimeout(r, delay))
                        continue;
                    }

                    if (parsed.type === "offline") { global.setOfflineUI(true); return { success: false, logout: parsed.logout } }
                    if (parsed?.type === "unreachable" || parsed?.type === "serverError" || parsed?.type === "requestTimeout") {
                        global.setServerState(true, { msg: parsed.message, type: "serverError" })
                        return { success: false, logout: parsed.logout }
                    }
                    if (parsed.err.status === 401) {
                        clearSession()
                        return { success: false, logout: true }
                    }
                    return { success: false, logout: false }
                }
            }
            return { success: false, logout: false }
        })()
        try {
            return await refreshPromise
        } finally {
            refreshPromise = null
            loadingState.isRefreshingSession = false
            loadingState.sessionInitialized = true
        }
    }

    return {
        loginUser,
        logoutUser,
        loadingState: readonly(loadingState),
        loginErrors,
        clearLoginErrors,
        getUserMetaData: readonly(getUserMetaData),
        capitalizedUsername: readonly(capitalizedUsername),
        capitalizedRole: readonly(capitalizedRole),
        refreshSession,
        isLoggedIn,
        rulesAgreed: readonly(rulesAgreed),
        setRulesAgreed,
        initializeRulesAgreement,
        setUserHasSubmitted, setUserMetaDataAfterScoreSubmit
    }
})