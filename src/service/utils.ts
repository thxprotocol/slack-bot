import axios, { AxiosInstance } from "axios";

export const createClient = (clientId: string, clientToken: string): AxiosInstance => {
  const authStr = `${clientId}:${clientToken}`
  const authToken = Buffer.from(authStr).toString('base64')
  const authPayload = `Basic ${authToken}`

  const client = axios.create({
    timeout: 60000
  })
  client.interceptors.request.use((config) => {
    config.headers['Authorization'] = authPayload
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    return config
  })

  return client
}