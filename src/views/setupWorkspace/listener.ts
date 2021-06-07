import { Middleware, SlackViewMiddlewareArgs } from '@slack/bolt';
import Workspace from '../../models/workspace';
import Channel from '../../models/channel';
import Reaction from '../../models/reaction';
import thx from '../../service/thx';

const listener: Middleware<SlackViewMiddlewareArgs> = async ({ ack, view, client }) => {
  let channel_id;
  try {
    await ack();

    const private_metadata = JSON.parse(view.private_metadata);
    const client_id = view.state.values.client_id_block.client_id.value;
    const client_secret = view.state.values.client_secret_block.client_secret.value;
    const workspace_id = view.team_id;

    channel_id = private_metadata.channel_id;

    const { access_token, access_token_expires_at } = await thx.getAccessToken(client_id, client_secret);
    if (!access_token) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'Failed to setup Client Id and Token for your workspace',
      });

      return;
    }

    const workspace = await Workspace.findOneAndUpdate(
      { id: workspace_id },
      { client_id, client_secret, access_token, access_token_expires_at },
      { upsert: true },
    );
    if (!workspace) return;

    const channels = await Channel.find({ workspace });
    channels.forEach(async (channel: any) => {
      const reactions = await Reaction.find({ channel });
      reactions.forEach((reaction: any) => reaction.delete());
      channel.delete();
    });

    await client.chat.postMessage({
      channel: channel_id,
      text: 'Successfully setup Client Id and Token for your workspace',
    });
  } catch (error) {
    console.error(error);
    if (channel_id) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'Failed to setup Client Id and Token for your workspace',
      });
    }
  }
};

export default listener;
