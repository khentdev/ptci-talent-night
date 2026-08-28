import axiosInstance from "./axiosConfig";

export const useAxiosInterceptor = async () => {
    axiosInstance.interceptors.response.use((res) => {
        return res.data
    }, (err) => {
        return Promise.reject(err)
    })
}