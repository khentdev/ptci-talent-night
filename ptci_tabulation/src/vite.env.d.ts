/// <reference types="vite/client" />
interface ImportMetaEnv {
    readonly VITE_API_URL: string
    /** "true" to answer API calls locally without the PHP backend */
    readonly VITE_MOCK_API?: string
}
declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}