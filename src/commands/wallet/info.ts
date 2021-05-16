import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import Workspace from '../../models/workspace';
import Channel from '../../models/channel';
import User from '../../models/user';
import thx from '../../service/thx';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, command, client }) => {
  let channel;
  try {
    await ack();

    const { channel_id, team_id: workspace_id, text, user_id } = command;
    channel = channel_id;

    const user = await User.findOne({ uuid: user_id });
    if (!user) {
      await client.chat.postMessage({
        channel,
        text: 'Please create a wallet first',
      });

      return;
    } else {
      const workspace = await Workspace.findOne({ id: workspace_id });
      if (!workspace?.client_id || !workspace?.client_secret) {
        await client.chat.postMessage({
          channel,
          text: 'Please setup Client ID and Client Token',
        });

        return;
      }

      const { access_token } = await thx.getAccessToken(workspace.client_id, workspace.client_secret);
      if (!access_token) {
        await client.chat.postMessage({
          channel,
          text: 'Invalid Client ID or Client Token, please setup again',
        });

        return;
      }

      const channelModel = await Channel.findOne({
        id: channel,
      });

      if (!channelModel?.pool_address) {
        await client.chat.postMessage({
          channel: channel_id,
          text: 'Please setup Contract Address for your Channel first',
        });

        return;
      }

      const res = await thx.getMemberInfo(channelModel.pool_address, access_token, user.public_address);

      if (!res) {
        await client.chat.postMessage({
          channel: channel_id,
          text: 'Was not able to get member information.',
        });

        return;
      }

      await client.chat.postMessage({
        channel: channel_id,
        text: `Balance: ${res.balance.amount} ${res.balance.symbol} \n Address: ${res.address}`,
      });
    }
  } catch (error) {
    if (channel) {
      await client.chat.postMessage({
        channel,
        text: 'Failed to fetch wallet info',
      });
    }
  }
};

const walletInfoCommand = {
  name: '/wallet-info',
  listener,
};

export default walletInfoCommand;
