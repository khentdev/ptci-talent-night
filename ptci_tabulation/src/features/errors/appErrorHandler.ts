import type { AxiosError } from "axios";
import { InfraErrorMessages } from "../../core/errors/infraMessages";

export type ErrorReturns = {
    type: keyof typeof InfraErrorMessages | "unknownError",
    message: string, retryable: boolean,
    logout: boolean,
    err: AxiosError
}
export const appErrorHandler = (err: AxiosError): ErrorReturns => {
    if (err.code === "ECONNABORTED" || err.response?.status === 408) {
        return { retryable: true, message: InfraErrorMessages.requestTimeout, logout: false, type: "requestTimeout", err }
    }

    if (!err.response || err.code === "ERR_NETWORK") {
        if (!navigator.onLine)
            return { type: "offline", message: InfraErrorMessages.offline, retryable: true, logout: false, err }
        return { type: "unreachable", message: InfraErrorMessages.unreachable, retryable: true, logout: false, err }
    }

    if ((err.response.status ?? 0) >= 500)
        return { type: "serverError", message: InfraErrorMessages.serverError, retryable: true, logout: false, err }


    const message = "Something went wrong. Please try again."
    return { type: "unknownError", message, retryable: false, logout: false, err }
}