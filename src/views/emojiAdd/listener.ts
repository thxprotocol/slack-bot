import { Middleware, SlackViewMiddlewareArgs } from '@slack/bolt';
import Channel from '../../models/channel';
import Workspace from '../../models/workspace';
import Reaction from '../../models/reaction';
import thx from '../../service/thx';
import { EMOJI_REGEX } from '../../constants';

const listener: Middleware<SlackViewMiddlewareArgs> = async ({ ack, view, client, context }) => {
  let channel_id;
  try {
    await ack();
    console.log(context.h);

    const private_metadata = JSON.parse(view.private_metadata);
    channel_id = private_metadata.channel_id;

    const workspace_id = view.team_id;
    const emoji = view.state.values.emoji_block.emoji.value;
    const withdraw_amount = view.state.values.withdraw_amount_block.withdraw_amount.value;

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

    if (!EMOJI_REGEX.exec(emoji)) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'This is not a valid emoji',
      });

      return;
    }

    const workspace = await Workspace.findOne({
      id: workspace_id,
    });
    if (!workspace?.client_id || !workspace?.client_secret) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'Please setup Client ID and Client Token for your Workspace first',
      });

      return;
    }

    const { access_token } = await thx.getAccessToken(workspace.client_id, workspace.client_secret);
    if (!access_token) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'Invalid Client ID or Client Token, please setup again',
      });

      return;
    }

    const reaction_id = encodeURI(emoji);
    const reward = await thx.createReward(channel.pool_address, withdraw_amount, '0', access_token);

    await Reaction.findOneAndUpdate(
      { reaction_id: reaction_id, channel },
      {
        reaction_id: reaction_id,
        reward_id: reward.data.id || '',
        channel: channel,
      },
      { upsert: true },
    );

    await client.chat.postMessage({
      channel: channel_id,
      text: 'Successfully linked a reward to this reaction',
    });
  } catch (error) {
    console.log(error);
    await client.chat.postMessage({
      channel: channel_id,
      text: 'Failed to add emoji',
    });
  }
};

export default listener;
