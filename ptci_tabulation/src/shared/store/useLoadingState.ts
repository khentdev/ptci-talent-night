import { defineStore } from "pinia";
import { reactive } from "vue";

export const useLoadingStore = defineStore("loadingStore", () => {
    const useLoading = reactive<Record<string, boolean>>({})
    const setLoading = (feature: string, type: string, val: boolean) => {
        const key = `${feature}:${type}`;
        useLoading[key] = val
    }
    return { useLoading, setLoading }
})