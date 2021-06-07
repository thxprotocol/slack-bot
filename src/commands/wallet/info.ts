import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import thx from '../../service/thx';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, command, client, context }) => {
  try {
    await ack();

    const { user_id } = command;
    const { user, access_token } = context;

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

      const res = await thx.getMemberInfo(context.pool_address, access_token, user.public_address);

      if (!res) {
        await client.chat.postMessage({
          channel: user_id,
          text: 'Was not able to get member information.',
        });

        return;
      }

      await client.chat.postMessage({
        channel: user_id,
        text: `Balance: ${res.balance.amount} ${res.balance.symbol} \n Address: ${res.address}`,
      });
    }
  } catch (error) {
    console.error(error);
    await client.chat.postMessage({
      channel: command.user_id,
      text: 'Failed to fetch wallet info',
    });
  }
};

const walletInfoCommand = {
  name: '/wallet-info',
  listener,
};

export default walletInfoCommand;
