import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { EMAIL_REGEX, SECRET } from '../../constants';
import thx from '../../service/thx';
import { decryptString, encryptString } from '../../utils/crypto';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, command, client, context }) => {
  try {
    await ack();

    const { text, user_id } = command;
    const { user, access_token, pool_address } = context;

    const [email] = text.split(' ');
    if (!EMAIL_REGEX.test(email)) {
      await client.chat.postMessage({
        channel: user_id,
        text: 'This e-mail address is invalid',
      });

      return;
    }

    if (!user) {
      await client.chat.postMessage({
        channel: user_id,
        text: 'Please create a wallet first',
      });

      return;
    } else {
      if (!access_token) {
        await client.chat.postMessage({
          channel: user_id,
          text: 'Invalid Client ID or Client Token, please setup again',
        });

        return;
      }

      const res = await thx.getAuthenticationToken(
        pool_address,
        access_token,
        email,
        decryptString(user.password, SECRET),
      );

      if (!res) {
        await client.chat.postMessage({
          channel: user_id,
          text: 'Failed sending your one-time login link.',
        });

        return;
      }

      await client.chat.postMessage({
        channel: user_id,
        text: 'Your one-time login has been sent!. Valid for 10 minutes. Go to your e-mail and get access to your rewards.',
      });
    }
  } catch (error) {
    console.error(error);
    await client.chat.postMessage({
      channel: command.user_id,
      text: 'Failed to link wallet',
    });
  }
};

const walletLoginCommand = {
  name: '/wallet-login',
  listener,
};

export default walletLoginCommand;
