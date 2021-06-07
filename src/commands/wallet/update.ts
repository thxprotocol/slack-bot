import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import { WALLET_REGEX } from '../../constants';
import User from '../../models/user';
import thx from '../../service/thx';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, command, client, context }) => {
  try {
    await ack();

    const { text, user_id } = command;
    const { user, access_token, pool_address } = context;

    const [public_address] = text.split(' ');
    if (!WALLET_REGEX.test(public_address)) {
      await client.chat.postMessage({
        channel: user_id,
        text: 'This wallet address is invalid',
      });

      return;
    }

    if (!user) {
      await User.create({ uuid: user_id, public_address });
    } else {
      await user.updateOne({ public_address });
    }

    if (!access_token) {
      await client.chat.postMessage({
        channel: user_id,
        text: 'Invalid Client ID or Client Token, please setup again',
      });

      return;
    }

    await thx.addMember(access_token, pool_address, public_address);

    await client.chat.postMessage({
      channel: user_id,
      text: 'Successfully linked your wallet',
    });
  } catch (error) {
    console.error(error);
    await client.chat.postMessage({
      channel: command.user_id,
      text: 'Failed to link wallet',
    });
  }
};

const walletUpdateCommand = {
  name: '/wallet-update',
  listener,
};

export default walletUpdateCommand;
