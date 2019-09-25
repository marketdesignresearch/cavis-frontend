import axios from 'axios'
import NProgress from 'nprogress'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || `http://localhost:8080`,
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

// before a request is made start the nprogress
api.interceptors.request.use(
  config => {
    NProgress.start()
    return config
  },
  error => {
    console.warn(error)
    NProgress.done()
  }
)

// before a response is returned stop nprogress
api.interceptors.response.use(response => {
  NProgress.done()
  return response
})

export default api
