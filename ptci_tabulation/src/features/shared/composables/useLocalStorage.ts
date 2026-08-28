export const setLocalStorage = <T>(key: string, data: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
        console.error(`Error saving to localStorage (${key}):`, error)
    }
}

export const getLocalStorage = <T>(key: string): T | null => {
    try {
        const item = localStorage.getItem(key)
        return item ? (JSON.parse(item) as T) : null
    } catch (error) {
        console.error(`Error reading localStorage (${key}):`, error)
        return null
    }
}
export const removeLocalStorage = (key: string): void => {
    try {
        localStorage.removeItem(key)
    } catch (error) {
        console.error(`Error removing localStorage item (${key}):`, error)
    }
}