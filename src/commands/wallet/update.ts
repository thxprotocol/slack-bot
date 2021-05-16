import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { WALLET_REGEX } from '../../constants';
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

    const [public_address] = text.split(' ');
    if (!WALLET_REGEX.test(public_address)) {
      await client.chat.postMessage({
        channel,
        text: 'This wallet address is invalid',
      });

      return;
    }

    const user = await User.findOne({ uuid: user_id });
    if (!user) {
      await User.create({ uuid: user_id, public_address });
    } else {
      await user.updateOne({ public_address: public_address });
    }

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

    await thx.addMember(access_token, channelModel.pool_address, public_address);

    await client.chat.postMessage({
      channel: channel_id,
      text: 'Successfully linked your wallet',
    });
  } catch (error) {
    if (channel) {
      await client.chat.postMessage({
        channel,
        text: 'Failed to link wallet',
      });
    }
  }
};

const walletUpdateCommand = {
  name: '/wallet-update',
  listener,
};

export default walletUpdateCommand;
