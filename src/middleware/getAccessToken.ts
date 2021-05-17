import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';

const isAdmin: Middleware<SlackCommandMiddlewareArgs> = async ({ command, client, next }) => {
  const { channel_id, user_id } = command;

  const response = await client.users.info({ user: user_id });
  const user: any = response.user;

  if (!user.is_admin) {
    await client.chat.postMessage({
      channel: channel_id,
      text: 'Only admins can call this command',
    });

    return;
  }

  if (next) await next();
};

export default isAdmin;
