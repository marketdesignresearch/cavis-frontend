import axios from 'axios'

export default () => {
  return axios.create({
    baseURL: `http://localhost:8080` || process.env.VUE_APP_API_URL,
    withCredentials: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}
