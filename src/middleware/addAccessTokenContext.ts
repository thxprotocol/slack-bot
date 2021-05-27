import { Middleware, SlackCommandMiddlewareArgs } from '@slack/bolt';
import thx from '../service/thx';

const addAccessTokenContext: Middleware<SlackCommandMiddlewareArgs> = async ({ next, context }) => {
  const { access_token } = await thx.getAccessToken(context.client_id, context.client_secret);

  context.access_token = access_token;

  if (next) await next();
};

export default addAccessTokenContext;
