import { createClient, getClientWithAccess } from './utils';
import Workspace from '../models/workspace';

const isExpired = (time: number) => time - new Date().getTime() < 0;

export default {
  // TODO: query db for access_token, if expired fetch new token and add
  async getAccessToken(
    clientId: string,
    clientToken: string,
  ): Promise<{ access_token: string; access_token_expires_at: number }> {
    try {
      const workspace = await Workspace.findOne({
        client_id: clientId,
        client_secret: clientToken,
      });

      if (workspace && workspace.access_token && !isExpired(workspace.access_token_expires_at)) {
        return {
          access_token: workspace.access_token,
          access_token_expires_at: workspace.access_token_expires_at,
        };
      }

      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('scope', 'openid admin');

      const client = createClient(clientId, clientToken);
      const response = await client({
        method: 'POST',
        url: 'https://api.thx.network/token',
        data: params,
      });

      const access_token = response.data.access_token;
      const currentTime = new Date().getTime() - 100;
      const access_token_expires_at = currentTime + response.data.expires_in * 1000;

      return {
        access_token,
        access_token_expires_at,
      };
    } catch (e) {
      return {
        access_token: '',
        access_token_expires_at: 0,
      };
    }
  },

  async checkAssetPool(contract_address: string, access_token: string): Promise<boolean> {
    const axios = getClientWithAccess(access_token);

    try {
      const response = await axios({
        method: 'GET',
        url: `https://api.thx.network/v1/asset_pools/${contract_address}`,
        headers: {
          AssetPool: contract_address,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async createReward(pool_address: string, withdraw_amount: string, withdraw_duration: string, access_token: string) {
    const axios = getClientWithAccess(access_token);

    const data = new URLSearchParams();
    data.append('withdrawAmount', withdraw_amount);
    data.append('withdrawDuration', withdraw_duration);

    const response = await axios({
      method: 'POST',
      url: 'https://api.thx.network/v1/rewards',
      headers: {
        AssetPool: pool_address,
      },
      data,
    });

    return response;
  },

  async getWalletAddress(pool_address: string, access_token: string, email: string, password: string) {
    try {
      const axios = getClientWithAccess(access_token);

      const data = new URLSearchParams();
      data.append('email', email);
      data.append('password', password);
      data.append('confirmPassword', password);

      const response = await axios({
        method: 'POST',
        url: 'https://api.thx.network/v1/signup',
        headers: {
          AssetPool: pool_address,
        },
        data,
      });

      if (response.status !== 201) {
        return;
      }

      return response.data.address;
    } catch (error) {
      console.log(error);
      return;
    }
  },

  async addMember(access_token: string, pool_address: string, public_address: string): Promise<boolean> {
    try {
      const axios = getClientWithAccess(access_token);

      const data = new URLSearchParams();
      data.append('address', public_address);

      const response = await axios({
        method: 'POST',
        url: 'https://api.thx.network/v1/members',
        headers: {
          AssetPool: pool_address,
        },
        data,
      });

      if (response.status !== 201) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  async getAuthenticationToken(
    contract_address: string,
    access_token: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    const axios = getClientWithAccess(access_token);
    try {
      const data = new URLSearchParams();
      data.append('email', email);
      data.append('password', password);

      const response = await axios({
        method: 'POST',
        url: `https://api.thx.network/v1/authentication_token`,
        headers: {
          AssetPool: contract_address,
        },
        data,
      });

      if (response.status !== 200) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  async getMemberInfo(contract_address: string, access_token: string, address: string): Promise<any> {
    const axios = getClientWithAccess(access_token);

    try {
      const res = await axios({
        method: 'GET',
        url: `https://api.thx.network/v1/members/${address}`,
        headers: {
          AssetPool: contract_address,
        },
      });

      if (res.status !== 200) {
        return;
      }

      return res.data;
    } catch {
      return;
    }
  },

  async giveReward(pool_address: string, access_token: string, reward_id: string, user_address: string) {
    const axios = getClientWithAccess(access_token);
    const data = new URLSearchParams()
    data.append('member', user_address);

    const res = await axios({
      method: 'POST',
      url: `https://api.thx.network/v1/rewards/${reward_id}/give`,
      headers: {
        AssetPool: pool_address
      },
      data
    })

    return res.data;
  },

  async withdraw(pool_address: string, access_token: string, withdrawal: string) {
    const axios = getClientWithAccess(access_token);

    const res = await axios({
      method: 'POST',
      url: `https://api.thx.network/v1/withdrawals/${withdrawal}/withdraw`,
      headers: {
        AssetPool: pool_address
      }
    });

    return res.data;
  }
};
