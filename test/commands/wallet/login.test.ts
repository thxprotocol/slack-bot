import 'jest';
import { mocked } from 'ts-jest/utils';
import walletLoginCommand from '../../../src/commands/wallet/login';
import { SECRET } from '../../../src/constants';
import thx from '../../../src/service/thx';
import { decryptString } from '../../../src/utils/crypto';
import { buildMockCommandPayload } from '../../utils';
import { mockAccessToken, mockEmail, mockPassword, mockPoolAddress, mockUserId } from '../../utils/constants';

jest.mock('../../../src/service/thx');

const mockThx = mocked(thx, true);

describe('wallet login command listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fails if email is invalid and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: 'email',
      },
      context: {},
    });

    await walletLoginCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'This e-mail address is invalid',
    });
  });

  it('fails if wallet is not set and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: mockEmail,
      },
      context: {},
    });

    await walletLoginCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Please create a wallet first',
    });
  });

  it('fails if workspace is not set and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: mockEmail,
      },
      context: {
        user: {},
      },
    });

    await walletLoginCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Invalid Client ID or Client Token, please setup again',
    });
  });

  it('fails if couldnt get auth token and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: mockEmail,
      },
      context: {
        user: {
          password: mockPassword,
        },
        access_token: mockAccessToken,
      },
    });
    mockThx.getAuthenticationToken.mockResolvedValue(false);

    await walletLoginCommand.listener(mockPayload);

    expect(mockThx.getAuthenticationToken).toHaveBeenCalled();
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Failed sending your one-time login link.',
    });
  });

  it('Successfully logins and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: mockEmail,
      },
      context: {
        user: {
          password: mockPassword,
        },
        access_token: mockAccessToken,
        pool_address: mockPoolAddress,
      },
    });
    mockThx.getAuthenticationToken.mockResolvedValue(true);

    await walletLoginCommand.listener(mockPayload);

    expect(mockThx.getAuthenticationToken).toHaveBeenCalledWith(
      mockPoolAddress,
      mockAccessToken,
      mockEmail,
      decryptString(mockPassword, SECRET),
    );
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Your one-time login has been sent!. Valid for 10 minutes. Go to your e-mail and get access to your rewards.',
    });
  });
});
