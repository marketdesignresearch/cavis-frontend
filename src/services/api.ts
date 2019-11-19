import axios, { AxiosInstance } from 'axios'
import { loadProgressBar } from 'axios-progress-bar'

interface CaVisAxiosInstance extends AxiosInstance {
  postResponseErrorHandlers: Function[]
  registerResponseErrorHandler(handler: Function): void
}

const api: CaVisAxiosInstance = Object.assign(
  {
    postResponseErrorHandlers: [] as Function[],
    registerResponseErrorHandler: function(handler: Function) {
      this.postResponseErrorHandlers.push(handler)
    }
  },
  axios.create({
    baseURL: process.env.VUE_APP_API_URL || `http://localhost:8080`,
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
)

loadProgressBar({ minimum: 0.1 }, api)

// before a request is made start the nprogress
api.interceptors.request.use(
  config => {
    return config
  },
  error => {
    console.warn(error)
  }
)

// before a response is returned stop nprogress
api.interceptors.response.use(
  response => {
    return response
  },
  error => {
    // if we have registered any handlers, use 'em
    api.postResponseErrorHandlers.forEach(value => {
      value(error)
    })

    console.error(error)
  }
)

export default api
