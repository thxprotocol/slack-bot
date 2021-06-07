import 'jest';
import { mocked } from 'ts-jest/utils';
import walletCreateCommand from '../../../src/commands/wallet/create';
import thx from '../../../src/service/thx';
import { buildMockCommandPayload } from '../../utils';
import {
  mockAccessToken,
  mockEmail,
  mockPassword,
  mockPoolAddress,
  mockUserId,
  mockWalletAddress,
} from '../../utils/constants';

jest.mock('../../../src/service/thx');

jest.mock('../../../src/models/user', () => ({
  create: jest.fn(),
}));

const mockThx = mocked(thx, true);

describe('wallet create command listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully creates wallet and sends message to channel', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: `${mockEmail} ${mockPassword}`,
      },
      context: {
        access_token: mockAccessToken,
        pool_address: mockPoolAddress,
      },
    });
    mockThx.getWalletAddress.mockResolvedValue(mockWalletAddress);

    await walletCreateCommand.listener(mockPayload);

    expect(mockThx.getWalletAddress).toBeCalledWith(mockPoolAddress, mockAccessToken, mockEmail, mockPassword);
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Successfully linked your wallet',
    });
  });

  it('fails when wallet is already created', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: `${mockEmail} ${mockPassword}`,
      },
      context: {
        user: {},
        access_token: mockAccessToken,
      },
    });

    await walletCreateCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'You have already linked your wallet',
    });
  });

  it('fails when wallet retrival returns no address', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: `${mockEmail} ${mockPassword}`,
      },
      context: {
        access_token: mockAccessToken,
      },
    });
    mockThx.getWalletAddress.mockResolvedValue('');

    await walletCreateCommand.listener(mockPayload);

    expect(mockThx.getWalletAddress).toBeCalled();
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Failed linking your wallet',
    });
  });

  it('fails when invalid email is not provided', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: `email ${mockPassword}`,
      },
      context: {
        access_token: mockAccessToken,
      },
    });

    await walletCreateCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Please provide a valid email address',
    });
  });

  it('fails when password is not provided and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: `${mockEmail}`,
      },
      context: {
        access_token: mockAccessToken,
      },
    });

    await walletCreateCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Please provide a password',
    });
  });

  it('fails when access token is not set and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: `${mockEmail} ${mockPassword}`,
      },
      context: {},
    });

    await walletCreateCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Invalid Client ID or Client Token, please setup again',
    });
  });
});
