import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import Channel from '../models/channel';

const isChannelSetup: Middleware<SlackCommandMiddlewareArgs> = async ({ command, client, context, next }) => {
  const { channel_id } = command;

  const channel = await Channel.findOne({
    id: channel_id,
  });

  if (!channel?.pool_address) {
    await client.chat.postMessage({
      channel: channel_id,
      text: 'Please setup Contract Address for your Channel first',
    });

    return;
  }

  context.pool_address = channel.pool_address;

  if (next) await next();
};

export default isChannelSetup;
