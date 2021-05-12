import { createClient } from "./utils"

export default {
  async getAccessToken(clientId: string, clientToken: string): Promise<string | undefined> {
    try {
      const params = new URLSearchParams()
      params.append('grant_type', 'client_credentials')
      params.append('scope', 'openid admin')

      const client = createClient(clientId, clientToken)

      const response = await client({
        method: 'POST',
        url: 'https://api.thx.network/token',
        data: params
      })

      return response.data.access_token
    } catch (e) {
      return 
    }
  }
}