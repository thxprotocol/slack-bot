import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import setupWorkspaceView from '../../views/setupWorkspace';

const listener: Middleware<SlackCommandMiddlewareArgs> = async ({ ack, body, command, client }) => {
  await ack();

  try {
    const { channel_id } = command;

    const private_metadata = JSON.stringify({
      channel_id,
    });

    await client.views.open({
      trigger_id: body.trigger_id,
      view: setupWorkspaceView.buildView({ private_metadata }),
    });
  } catch (error) {
    console.error(error);
  }
};

const setupWorkspaceCommand = {
  name: '/setup-workspace',
  listener,
};

export default setupWorkspaceCommand;
