import { loadEnv } from './dotenv';
loadEnv();

import { App } from '@slack/bolt';
import { LogLevel } from '@slack/logger';
import * as customMiddleware from './customMiddleware';
import setupWorkspaceView from './views/setupWorkspace';
import setupWorkspaceCommand from './commands/setup/workspace';
import setupDb from './service/db'

setupDb()

const app = new App({
  logLevel: process.env.SLACK_LOG_LEVEL as LogLevel || LogLevel.INFO,
  processBeforeResponse: false,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

customMiddleware.enableAll(app);

app.command(setupWorkspaceCommand.name, setupWorkspaceCommand.listener);
app.view(setupWorkspaceView.name, setupWorkspaceView.listener);

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log('⚡️ THX Bot is running!');
})();

