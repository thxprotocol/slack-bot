import { Middleware, SlackEventMiddlewareArgs, ReactionMessageItem } from '@slack/bolt';
import Channel from '../models/channel';
import Reaction from '../models/reaction';
import ReactionCache from '../models/reactionCache';
import Workspace from '../models/workspace';
import User from '../models/user';
import thx from '../service/thx';
import { buildWalletUrl } from '../utils';

const listener: Middleware<SlackEventMiddlewareArgs<'reaction_added'>> = async ({ event, context, client, body }) => {
  try {
    const { user, item_user, item, reaction: event_reaction } = event;
    if (user !== item_user) {
      if (item.type === 'message') {
        const channel = await Channel.findOne({
          id: item.channel,
        });

        if (!channel) {
          if (event.item.type == 'message') {
            await client.chat.postMessage({
              channel: user,
              text: 'Please set up channel',
            });
          }

          return;
        }

        const reactions = await Reaction.find({ channel });

        const reward = reactions.find((reaction) => reaction.reaction_id === `:${event_reaction}:`);
        if (!reward) {
          if (event.item.type == 'message') {
            await client.chat.postMessage({
              channel: user,
              text: 'No reward supported for reaction',
            });
          }

          return;
        }

        const workspace = await Workspace.findOne({
          id: body.team_id,
        });
        if (!workspace) {
          if (event.item.type == 'message') {
            await client.chat.postMessage({
              channel: user,
              text: 'Please set up workspace',
            });
          }

          return;
        }

        const persistedUser = await User.findOne({
          uuid: item_user,
        });
        if (!persistedUser || !persistedUser.public_address) {
          if (event.item.type == 'message') {
            await client.chat.postMessage({
              channel: user,
              text: 'Please set up user',
            });
          }

          return;
        }

        const cachedReaction = await ReactionCache.findOne({
          uuid: user,
          reactionId: event_reaction,
          messageId: item.ts,
        });
        if (cachedReaction) {
          if (event.item.type == 'message') {
            await client.chat.postMessage({
              channel: user,
              text: 'You have already reacted',
            });
          }

          return;
        }

        const { access_token } = await thx.getAccessToken(workspace.client_id, workspace.client_secret);

        const giveRewardResponse = await thx.giveReward(
          channel.pool_address,
          access_token,
          reward.reward_id,
          persistedUser.public_address,
        );

        await thx.withdraw(channel.pool_address, access_token, giveRewardResponse.withdrawal);

        const contract_link = buildWalletUrl(channel.pool_address);

        await ReactionCache.create({
          uuid: item_user,
          reactionId: event_reaction,
          messageId: item.ts,
        });

        await client.chat.postMessage({
          channel: item_user,
          text: 'You got a new reward! Now you can claim it by clicking on the link above' + contract_link,
        });
      }
    }
  } catch (e) {
    if (event.item.type == 'message') {
      await client.chat.postMessage({
        channel: event.user,
        text: 'Failed to reward user',
      });
    }
  }
};

export default listener;
