import { loadEnv } from './dotenv';
loadEnv();

import { App } from '@slack/bolt';
import { LogLevel } from '@slack/logger';
import * as customMiddleware from './customMiddleware';
import setupWorkspaceView from './views/setupWorkspace';
import setupWorkspaceCommand from './commands/setup/workspace';
import setupDb from './service/db';
import setupAssetPoolCommand from './commands/setup/assetPool';
import setupAssetPoolView from './views/setupAssetPool';
import emojiAddCommand from './commands/emoji/add';
import emojiAddView from './views/emojiAdd';
import walletCreateCommand from './commands/wallet/create';
import walletLoginCommand from './commands/wallet/login';
import walletUpdateCommand from './commands/wallet/update';
import walletInfoCommand from './commands/wallet/info';
import isAdminMiddleware from './middleware/isAdmin';

setupDb();

const app = new App({
  logLevel: (process.env.SLACK_LOG_LEVEL as LogLevel) || LogLevel.INFO,
  processBeforeResponse: false,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

customMiddleware.enableAll(app);

// commands
app.command(setupWorkspaceCommand.name, isAdminMiddleware, setupWorkspaceCommand.listener);
app.command(setupAssetPoolCommand.name, isAdminMiddleware, setupAssetPoolCommand.listener);
app.command(emojiAddCommand.name, isAdminMiddleware, emojiAddCommand.listener);
app.command(walletCreateCommand.name, walletCreateCommand.listener);
app.command(walletUpdateCommand.name, walletUpdateCommand.listener);
app.command(walletLoginCommand.name, walletLoginCommand.listener);
app.command(walletInfoCommand.name, walletInfoCommand.listener);

// views
app.view(setupWorkspaceView.name, setupWorkspaceView.listener);
app.view(setupAssetPoolView.name, setupAssetPoolView.listener);
app.view(emojiAddView.name, emojiAddView.listener);

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log('⚡️ THX Bot is running!');
})();
