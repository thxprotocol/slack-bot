import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import Workspace from '../models/workspace';

const isWorkspaceSetup: Middleware<SlackCommandMiddlewareArgs> = async ({ command, client, context, next }) => {
  const { channel_id, team_id: workspace_id } = command;

  const workspace = await Workspace.findOne({ id: workspace_id });
  if (!workspace?.client_id || !workspace?.client_secret) {
    await client.chat.postMessage({
      channel: channel_id,
      text: 'Please setup Client ID and Client Token',
    });

    return;
  }

  context.client_id = workspace.client_id;
  context.client_secret = workspace.client_secret;

  if (next) await next();
};

export default isWorkspaceSetup;
