import { Middleware, SlackViewMiddlewareArgs } from '@slack/bolt';
import Workspace from '../../models/workspace';
import Channel from '../../models/channel';
import Reaction from '../../models/reaction';
import thx from '../../service/thx';
import { WALLET_REGEX } from '../../constants';

const listener: Middleware<SlackViewMiddlewareArgs> = async ({ ack, view, client }) => {
  let channel_id;
  try {
    await ack();

    const private_metadata = JSON.parse(view.private_metadata);
    const contract_address = view.state.values.contract_address_block.contract_address.value;
    const workspace_id = view.team_id;
    channel_id = private_metadata.channel_id;

    const workspace = await Workspace.findOne({ id: workspace_id });
    if (!workspace?.client_id || !workspace?.client_secret) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'Please setup Client ID and Client Token',
      });

      return;
    }

    if (!WALLET_REGEX.test(contract_address)) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'Invalid contract address',
      });

      return;
    }

    const { access_token } = await thx.getAccessToken(workspace.client_id, workspace.client_secret);
    if (!access_token) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'Please setup Client ID and Client Token',
      });

      return;
    }

    const isValid = await thx.checkAssetPool(contract_address, access_token);
    console.log(isValid, access_token);
    if (!isValid) {
      await client.chat.postMessage({
        channel: channel_id,
        text: 'Invalid contract address',
      });

      return;
    }

    const channel = await Channel.findOneAndUpdate(
      { id: channel_id },
      { pool_address: contract_address, workspace: workspace, members: [] },
      { upsert: true },
    );
    if (channel) {
      await Reaction.deleteMany({ channel: channel });
    }

    await client.chat.postMessage({
      channel: channel_id,
      text: 'Successfully update asset pool for this channel',
    });
  } catch (error) {
    await client.chat.postMessage({
      channel: channel_id,
      text: 'Invalid contract address',
    });
  }
};

export default listener;
