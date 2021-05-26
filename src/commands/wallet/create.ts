import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { EMAIL_REGEX, SECRET } from '../../constants';
import User from '../../models/user';
import thx from '../../service/thx';
import { encryptString } from '../../utils/crypto';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, command, context, client }) => {
  try {
    await ack();

    const { text, user_id } = command;
    const { user, access_token } = context;

    const [email, password] = text.split(' ');
    if (!EMAIL_REGEX.test(email)) {
      await client.chat.postMessage({
        channel: user_id,
        text: 'Please provide a valid email address',
      });

      return;
    }

    if (!password) {
      await client.chat.postMessage({
        channel: user_id,
        text: 'Please provide a password',
      });

      return;
    }

    if (!user) {
      if (!access_token) {
        await client.chat.postMessage({
          channel: user_id,
          text: 'Invalid Client ID or Client Token, please setup again',
        });

        return;
      }

      const address = await thx.getWalletAddress(context.pool_address, access_token, email, password);
      if (!address) {
        await client.chat.postMessage({
          channel: user_id,
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
        channel: user_id,
        text: 'Successfully linked your wallet',
      });
    } else {
      await client.chat.postMessage({
        channel: user_id,
        text: 'You have already linked your wallet',
      });

      return;
    }
  } catch (error) {
    await client.chat.postMessage({
      channel: command.user_id,
      text: 'Failed to create wallet',
    });
  }
};

const walletCreateCommand = {
  name: '/wallet-create',
  listener,
};

export default walletCreateCommand;
