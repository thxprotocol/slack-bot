import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { EMAIL_REGEX, SECRET } from '../../constants';
import Workspace from '../../models/workspace';
import Channel from '../../models/channel';
import User from '../../models/user';
import thx from '../../service/thx';
import { encryptString } from '../../utils';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, command, client }) => {
  let channel;
  try {
    await ack();

    const { channel_id, team_id: workspace_id, text, user_id } = command;
    channel = channel_id;

    const [email, password] = text.split(' ');
    if (!EMAIL_REGEX.test(email)) {
      await client.chat.postMessage({
        channel,
        text: 'Please provide a valid email address',
      });

      return;
    }

    if (!password) {
      await client.chat.postMessage({
        channel,
        text: 'Please provide a password',
      });

      return;
    }

    const workspace = await Workspace.findOne({ id: workspace_id });
    if (!workspace?.client_id || !workspace?.client_secret) {
      await client.chat.postMessage({
        channel,
        text: 'Please setup Client ID and Client Token',
      });

      return;
    }

    const user = await User.findOne({ uuid: user_id });
    if (!user) {
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

      const address = await thx.getWalletAddress(channelModel.pool_address, access_token, email, password);
      if (!address) {
        await client.chat.postMessage({
          channel: channel_id,
          text: 'Failed linking your wallet',
        });

        return;
      }

      await User.create({
        uuid: user_id,
        public_address: address,
        password: encryptString(password, SECRET),
      });

      await client.chat.postMessage({
        channel: channel_id,
        text: 'Successfully linked your wallet',
      });
    } else {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'You have already linked your wallet',
      });

      return;
    }
  } catch (error) {
    if (channel) {
      await client.chat.postMessage({
        channel,
        text: 'Failed to create wallet',
      });
    }
  }
};

const walletCreateCommand = {
  name: '/wallet-create',
  listener,
};

export default walletCreateCommand;
