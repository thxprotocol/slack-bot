import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { EMAIL_REGEX, SECRET } from '../../constants';
import Workspace from '../../models/workspace';
import Channel from '../../models/channel';
import User from '../../models/user';
import thx from '../../service/thx';
import { decryptString } from '../../utils';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, command, client }) => {
  let channel;
  try {
    await ack();

    const { channel_id, team_id: workspace_id, text, user_id } = command;
    channel = channel_id;

    const [email] = text.split(' ');
    if (!EMAIL_REGEX.test(email)) {
      await client.chat.postMessage({
        channel,
        text: 'This e-mail address is invalid',
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
      await client.chat.postMessage({
        channel,
        text: 'Please create a wallet first',
      });

      return;
    } else {
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

      const res = await thx.getAuthenticationToken(
        channelModel.pool_address,
        access_token,
        email,
        decryptString(user.password, SECRET),
      );

      if (!res) {
        await client.chat.postMessage({
          channel: channel_id,
          text: 'Failed sending your one-time login link.',
        });

        return;
      }

      await client.chat.postMessage({
        channel: channel_id,
        text: 'Your one-time login has been sent!. Valid for 10 minutes. Go to your e-mail and get access to your rewards.',
      });
    }
  } catch (error) {
    if (channel) {
      await client.chat.postMessage({
        channel,
        text: 'Failed to link wallet',
      });
    }
  }
};

const walletLoginCommand = {
  name: '/wallet-login',
  listener,
};

export default walletLoginCommand;
