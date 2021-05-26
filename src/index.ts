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
import isAdmin from './middleware/isAdmin';
import setCredentials from './middleware/setCredentials';
import setPoolAddress from './middleware/setPoolAddress';
import reactionAddedEvent from './events/reactionAdded';
import setUser from './middleware/setUser';

setupDb();

const app = new App({
  logLevel: (process.env.SLACK_LOG_LEVEL as LogLevel) || LogLevel.INFO,
  processBeforeResponse: false,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

customMiddleware.enableAll(app);

// commands
app.command(setupWorkspaceCommand.name, isAdmin, setupWorkspaceCommand.listener);
app.command(setupAssetPoolCommand.name, isAdmin, setupAssetPoolCommand.listener);
app.command(emojiAddCommand.name, isAdmin, emojiAddCommand.listener);
app.command(walletCreateCommand.name, setCredentials, setPoolAddress, setUser, walletCreateCommand.listener);
app.command(walletUpdateCommand.name, walletUpdateCommand.listener);
app.command(walletLoginCommand.name, setCredentials, setPoolAddress, walletLoginCommand.listener);
app.command(walletInfoCommand.name, setCredentials, setPoolAddress, walletInfoCommand.listener);

// events
app.event('reaction_added', reactionAddedEvent);

// views
app.view(setupWorkspaceView.name, setupWorkspaceView.listener);
app.view(setupAssetPoolView.name, setupAssetPoolView.listener);
app.view(emojiAddView.name, emojiAddView.listener);

(async () => {
  await app.start(Number(process.env.PORT) || 3000);
  console.log('⚡️ THX Bot is running!');
})();
