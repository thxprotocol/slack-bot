import 'jest';
import { mocked } from 'ts-jest/utils';
import thx from '../../src/service/thx';
import Workspace from '../../src/models/workspace';
import setupAssetPool from '../../src/views/setupAssetPool';
import { buildMockViewPayload } from '../utils';
import { mockAccessToken, mockPoolAddress } from '../utils/constants';

jest.mock('../../src/service/thx');
jest.mock('../../src/models/workspace');
jest.mock('../../src/models/channel', () => ({
  findOneAndUpdate: jest.fn().mockReturnValue({
    pool_address: '0x3456',
  }),
}));
jest.mock('../../src/models/reaction', () => ({
  deleteMany: jest.fn(),
}));

const mockThx = mocked(thx, true);
const mockWorkspace = mocked(Workspace, true);

const private_metadata = {
  channel_id: 'C123',
};

describe('setupAssetPool view submission listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fails if workspace not set and sends message to channel', async () => {
    const mockPayload = buildMockViewPayload({
      view: {
        private_metadata: JSON.stringify(private_metadata),
        state: {
          values: {
            contract_address_block: {
              contract_address: {
                value: mockPoolAddress,
              },
            },
          },
        },
      },
    });
    mockWorkspace.findOne.mockResolvedValue(null);

    await setupAssetPool.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: private_metadata.channel_id,
      text: 'Please setup Client ID and Client Token',
    });
  });

  it('fails if contract address is not valid and sends message to channel', async () => {
    const mockPayload = buildMockViewPayload({
      view: {
        private_metadata: JSON.stringify(private_metadata),
        state: {
          values: {
            contract_address_block: {
              contract_address: {
                value: '0x',
              },
            },
          },
        },
      },
    });
    mockWorkspace.findOne.mockResolvedValue({
      client_id: 'client_id',
      client_secret: 'client_secret',
    } as any);

    await setupAssetPool.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: private_metadata.channel_id,
      text: 'Invalid contract address',
    });
  });

  it('fails if assetPool is not valid and sends message to channel', async () => {
    const mockPayload = buildMockViewPayload({
      view: {
        private_metadata: JSON.stringify(private_metadata),
        state: {
          values: {
            contract_address_block: {
              contract_address: {
                value: mockPoolAddress,
              },
            },
          },
        },
      },
    });
    mockWorkspace.findOne.mockResolvedValue({
      client_id: 'client_id',
      client_secret: 'client_secret',
    } as any);
    mockThx.getAccessToken.mockResolvedValue({
      access_token: mockAccessToken,
      access_token_expires_at: 2,
    });
    mockThx.checkAssetPool.mockResolvedValue(false);

    await setupAssetPool.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: private_metadata.channel_id,
      text: 'Invalid contract address',
    });
  });

  it('successfully adds assetpool and sends message to channel', async () => {
    const mockPayload = buildMockViewPayload({
      view: {
        private_metadata: JSON.stringify(private_metadata),
        state: {
          values: {
            contract_address_block: {
              contract_address: {
                value: mockPoolAddress,
              },
            },
          },
        },
      },
    });
    mockWorkspace.findOne.mockResolvedValue({
      client_id: 'client_id',
      client_secret: 'client_secret',
    } as any);
    mockThx.getAccessToken.mockResolvedValue({
      access_token: mockAccessToken,
      access_token_expires_at: 2,
    });
    mockThx.checkAssetPool.mockResolvedValue(true);

    await setupAssetPool.listener(mockPayload);

    expect(mockThx.getAccessToken).toBeCalledTimes(1);
    expect(mockThx.checkAssetPool).toBeCalledTimes(1);
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: private_metadata.channel_id,
      text: 'Successfully update asset pool for this channel',
    });
  });
});
