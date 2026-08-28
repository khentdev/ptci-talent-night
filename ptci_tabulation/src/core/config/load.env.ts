type EnvKey = keyof ImportMetaEnv

export const LoadEnv = (k: EnvKey, fallback?: string) => {
    const value = import.meta.env[k]

    if (value !== undefined) return value
    if (fallback !== undefined) return fallback

    throw new Error(`Missing env variable: ${value}`)
}

export const VITE_API_URL = LoadEnv("VITE_API_URL")