import { Middleware, SlackEventMiddlewareArgs } from '@slack/bolt';

const listener: Middleware<SlackEventMiddlewareArgs<'reaction_added'>> = async ({}) => {
  try {
  } catch (e) {}
};

export default listener;
