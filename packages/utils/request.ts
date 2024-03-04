import axios from 'axios'

import type { CreateAxiosDefaults } from 'axios'

export const createAPI = (options: CreateAxiosDefaults = {}, responseInterceptorOnFulfilled = (res: any) => res, responseInterceptorOnRejected?: ((error: any) => any) | null) => {
  const api = axios.create({
    withCredentials: true,
    ...options
  })

  // 兼容两种传参形式
  api.interceptors.request.use(req => {
    const { method } = req
    if (method === 'get') {
      req.params = req?.params || req?.data
    } else {
      req.data = req?.data || req?.params
      if (req.params) delete req.params
    }
    return req
  })

  api.interceptors.response.use(responseInterceptorOnFulfilled, responseInterceptorOnRejected)

  return api
}
