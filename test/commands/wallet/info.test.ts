import 'jest';
import { mocked } from 'ts-jest/utils';
import walletInfoCommand from '../../../src/commands/wallet/info';
import thx from '../../../src/service/thx';
import { buildMockCommandPayload } from '../../utils';
import { mockAccessToken, mockPoolAddress, mockUserId, mockWalletAddress } from '../../utils/constants';

jest.mock('../../../src/service/thx');

const mockThx = mocked(thx, true);

describe('wallet info command listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fails if wallet not set up and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
      },
      context: {},
    });

    await walletInfoCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Please create a wallet first',
    });
  });

  it('fails if workspace not set up and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
      },
      context: {
        user: {},
      },
    });

    await walletInfoCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Invalid Client ID or Client Token, please setup again',
    });
  });

  it('fails if couldnt fetch member info and sends message to user', async () => {
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
      },
      context: {
        user: {},
        access_token: mockAccessToken,
      },
    });
    mockThx.getMemberInfo.mockResolvedValue('');

    await walletInfoCommand.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: 'Was not able to get member information.',
    });
  });

  it('successfully fetches information and sends message to user', async () => {
    const balance = { amount: '100', symbol: 'TEST' };
    const mockPayload: any = buildMockCommandPayload({
      command: {
        user_id: mockUserId,
      },
      context: {
        user: {
          public_address: mockWalletAddress,
        },
        access_token: mockAccessToken,
        pool_address: mockPoolAddress,
      },
    });
    mockThx.getMemberInfo.mockResolvedValue({ address: mockWalletAddress, balance: { amount: '100', symbol: 'TEST' } });

    await walletInfoCommand.listener(mockPayload);

    expect(mockThx.getMemberInfo).toHaveBeenCalledWith(mockPoolAddress, mockAccessToken, mockWalletAddress);
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: mockPayload.command.user_id,
      text: `Balance: ${balance.amount} ${balance.symbol} \n Address: ${mockWalletAddress}`,
    });
  });
});
