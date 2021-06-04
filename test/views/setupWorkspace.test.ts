import 'jest';
import { mocked } from 'ts-jest/utils';
import thx from '../../src/service/thx';
import Workspace from '../../src/models/workspace';
import setupWorkspace from '../../src/views/setupWorkspace';
import { buildMockViewPayload } from '../utils';
import { mockAccessToken } from '../utils/constants';

jest.mock('../../src/service/thx');
jest.mock('../../src/models/workspace');
jest.mock('../../src/models/channel', () => ({
  find: jest.fn().mockReturnValue([]),
}));
jest.mock('../../src/models/reaction', () => ({
  find: jest.fn().mockReturnValue([]),
}));

const mockThx = mocked(thx, true);
const mockWorkspace = mocked(Workspace, true);

const private_metadata = {
  channel_id: 'C123',
};

describe('setupWorkspace view submission listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fails if credentails are not valid and sends message to channel', async () => {
    const mockPayload = buildMockViewPayload({
      view: {
        private_metadata: JSON.stringify(private_metadata),
        state: {
          values: {
            client_id_block: {
              client_id: {
                value: 'client-id',
              },
            },
            client_secret_block: {
              client_secret: {
                value: 'client-secret',
              },
            },
          },
        },
      },
    });
    mockThx.getAccessToken.mockResolvedValue({} as any);

    await setupWorkspace.listener(mockPayload as any);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: private_metadata.channel_id,
      text: 'Failed to setup Client Id and Token for your workspace',
    });
  });

  it('successfully adds workspace and sends message to channel', async () => {
    const mockPayload = buildMockViewPayload({
      view: {
        private_metadata: JSON.stringify(private_metadata),
        state: {
          values: {
            client_id_block: {
              client_id: {
                value: 'client-id',
              },
            },
            client_secret_block: {
              client_secret: {
                value: 'client-secret',
              },
            },
          },
        },
      },
    });
    mockThx.getAccessToken.mockResolvedValue({
      access_token: mockAccessToken,
      access_token_expires_at: 0,
    } as any);
    mockWorkspace.findOneAndUpdate.mockResolvedValue({
      client_id: 'client-id',
      client_secret: 'client-secret',
    } as any);

    await setupWorkspace.listener(mockPayload as any);

    expect(thx.getAccessToken).toBeCalled();
    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: private_metadata.channel_id,
      text: 'Successfully setup Client Id and Token for your workspace',
    });
  });
});
