import { defineStore } from "pinia";
import { reactive } from "vue";

export const useGlobalErrorSetter = defineStore("globalErrorSetter", () => {
    const getError = reactive<Record<string, boolean>>({})
    const setError = (feature: string, type: string, val: boolean) => {
        const key = `${feature}:${type}`
        getError[key] = val
    }
    return { getError, setError }
})