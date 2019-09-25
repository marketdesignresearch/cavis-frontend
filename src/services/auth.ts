export default {
  init(api: any, user: any) {
    api.interceptors.request.use(
      (config: any) => {
        config.headers['Authorization'] = `Bearer ${user.id_token}`
        return config
      },
      (error: Error) => {
        return Promise.reject(error)
      }
    )
  }
}
