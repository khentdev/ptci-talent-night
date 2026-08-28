
export type ToastType = "success" | "error" | "info"

export type ToastOptions = {
    message: string,
    type: ToastType
    duration?: number,
    dedup?: boolean
}


export type Toasts = ToastOptions & {
    id: string
}

export type PickedToastOptions = Pick<ToastOptions, "duration" | "dedup">
export type ToastFn = (message: string, opts?: PickedToastOptions) => void

export const createToastFn = <T extends ToastType, F extends (toast: ToastOptions) => void>(type: T, Fn: F): ToastFn =>
    (message, opts) => Fn({ message, type, ...opts })

export type retryFn = <T = unknown>() => Promise<T>;