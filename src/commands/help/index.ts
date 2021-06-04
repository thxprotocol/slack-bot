import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, body, command, client }) => {
  await ack();

  try {
    const { channel_id } = command;

    const commands = [
      '- /emoji-add',
      '- /setup-assetpool',
      '- /setup-workspace',
      '- /wallet-create',
      '- /wallet-info',
      '- /wallet-login',
      '- /wallet-update',
    ].join('\n');

    await client.chat.postMessage({
      channel: channel_id,
      text: `Available THX commands: \n ${commands}`,
    });
  } catch (error) {
    console.error(error);
  }
};

const help = {
  name: '/help',
  listener,
};

export default help;
