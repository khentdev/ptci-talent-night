import { computed, nextTick, ref } from 'vue';

import { createToastFn } from '../types/toastTypes';

import type { Toasts, ToastOptions } from "../types/toastTypes"

const toastsList = ref<Toasts[]>([])
const MAX_TOASTS = 3

const timeoutMap = new Map<string, ReturnType<typeof setTimeout>>()

export const baseToast = (toast: ToastOptions) => {

    const dedupKey = toast.dedup ?? crypto.randomUUID()
    const id = `[${toast.type.toUpperCase()}]-[${dedupKey}]-${toast.message}`


    if (toast.dedup) {
        const index = toastsList.value.findIndex(t => t.id === id)
        if (index !== -1) {
            toastsList.value.splice(0, index)
            clearTimeout(timeoutMap.get(id))
            timeoutMap.delete(id)
        }
    }

    if (toastsList.value.length >= MAX_TOASTS) {
        const removedOne = toastsList.value.shift()
        if (removedOne) {
            clearTimeout(timeoutMap.get(removedOne.id))
            timeoutMap.delete(removedOne.id)
        }
    }

    const toastData: Toasts = { id, ...toast }
    toastsList.value.push(toastData)

    const timeout = setTimeout(() => {
        toastsList.value = toastsList.value.filter(t => t.id !== id)
        timeoutMap.delete(id)
    }, toast.duration ?? 5000)
    timeoutMap.set(id, timeout)
}

const removeToast = async (id: string) => {
    const timeout = timeoutMap.get(id)
    if (timeout) clearTimeout(timeout)

    timeoutMap.delete(id)
    await nextTick()
    toastsList.value = toastsList.value.filter(t => t.id !== id)

}

const toast = {
    success: createToastFn("success", baseToast),
    error: createToastFn("error", baseToast),
    info: createToastFn("info", baseToast),
}

const toasts = computed(() => toastsList.value)
export const useToast = () => {
    return {
        toasts,
        removeToast,
        toast
    }
}