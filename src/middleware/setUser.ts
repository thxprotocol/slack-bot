import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import User from '../models/user';

const setUser: Middleware<SlackCommandMiddlewareArgs> = async ({ command, next, context }) => {
  const { user_id } = command;

  const user = await User.findOne({ uuid: user_id });

  context.user = user;

  if (next) await next();
};

export default setUser;
