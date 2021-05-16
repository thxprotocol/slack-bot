import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import setupAssetPoolView from '../../views/setupAssetPool';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, body, command, client }) => {
  await ack();

  try {
    const { channel_id } = command;

    const private_metadata = JSON.stringify({
      channel_id,
    });

    await client.views.open({
      trigger_id: body.trigger_id,
      view: setupAssetPoolView.buildView({ private_metadata }),
    });
  } catch (error) {
    console.error(error);
  }
};

const setupAssetPool = {
  name: '/setup-assetpool',
  listener,
};

export default setupAssetPool;
