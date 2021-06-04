import 'jest';
import { mocked } from 'ts-jest/utils';
import walletUpdateCommand from '../../../src/commands/wallet/update';
import thx from '../../../src/service/thx';
import User from '../../../src/models/user';
import { buildMockCommandPayload } from '../../utils';
import { mockAccessToken, mockPoolAddress, mockUserId, mockWalletAddress } from '../../utils/constants';

jest.mock('../../../src/service/thx');
jest.mock('../../../src/models/user');

const mockThx = mocked(thx, true);
const mockUser = mocked(User, true);

describe('wallet update command listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fails if wallet is invalid and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: '0x',
      },
      context: {},
    });

    await walletUpdateCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'This wallet address is invalid',
    });
  });

  it('fails if workspace not set and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: mockWalletAddress,
      },
      context: {
        user: {
          updateOne: jest.fn(),
        },
      },
    });

    await walletUpdateCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Invalid Client ID or Client Token, please setup again',
    });
  });

  it('when user is set updates user then successfully links wallet and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: mockWalletAddress,
      },
      context: {
        user: {
          updateOne: jest.fn(),
        },
        access_token: mockAccessToken,
        pool_address: mockPoolAddress,
      },
    });
    mockThx.addMember.mockResolvedValue(true);

    await walletUpdateCommand.listener(mockPayload);

    expect(mockPayload.context.user.updateOne).toHaveBeenCalledWith({ public_address: mockWalletAddress });
    expect(mockThx.addMember).toHaveBeenCalledWith(mockAccessToken, mockPoolAddress, mockWalletAddress);
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Successfully linked your wallet',
    });
  });

  it('when user is not set creates user then successfully links wallet and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
        text: mockWalletAddress,
      },
      context: {
        access_token: mockAccessToken,
        pool_address: mockPoolAddress,
      },
    });
    mockThx.addMember.mockResolvedValue(true);
    mockUser.create.mockResolvedValue({} as never);

    await walletUpdateCommand.listener(mockPayload);

    expect(mockUser.create).toHaveBeenCalledWith({ uuid: mockUserId, public_address: mockWalletAddress });
    expect(mockThx.addMember).toHaveBeenCalledWith(mockAccessToken, mockPoolAddress, mockWalletAddress);
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Successfully linked your wallet',
    });
  });
});
