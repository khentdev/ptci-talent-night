import { Thumbmark } from "@thumbmarkjs/thumbmarkjs"


export const getDeviceDetails = async () => {

    const tm = new Thumbmark()
    try {
        const t = await tm.get({ logging: false, cache_api_call: true, performance: true })
        return t.components
    } catch (err) {
        console.error("Error fetching thumbmark: ", err)
    }
}