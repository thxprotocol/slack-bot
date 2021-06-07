import 'jest';
import thx from '../../src/service/thx';
import emojiAdd from '../../src/views/emojiAdd';
import { buildMockViewPayload } from '../utils';

jest.mock('../../src/service/thx', () => ({
  getAccessToken: jest.fn().mockReturnValue({
    access_token: 'access_token',
  }),
  createReward: jest.fn().mockReturnValue({
    data: {
      id: 'reward_id',
    },
  }),
}));

jest.mock('../../src/models/channel', () => ({
  findOne: jest.fn().mockReturnValue({
    pool_address: '0x3456',
  }),
}));
jest.mock('../../src/models/workspace', () => ({
  findOne: jest.fn().mockReturnValue({
    client_id: 'client-id',
    client_secret: 'client-secret',
  }),
}));
jest.mock('../../src/models/reaction', () => ({
  findOneAndUpdate: jest.fn(),
}));

const private_metadata = {
  channel_id: 'C123',
};

describe('emojiAdd view submission listener', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('successfully creates reward and sends message to channel', async () => {
    const mockPayload = buildMockViewPayload({
      view: {
        private_metadata: JSON.stringify(private_metadata),
        state: {
          values: {
            emoji_block: {
              emoji: {
                value: ':rocket:',
              },
            },
            withdraw_amount_block: {
              withdraw_amount: {
                value: '100',
              },
            },
          },
        },
      },
    });

    await emojiAdd.listener(mockPayload);

    expect(thx.getAccessToken).toBeCalledTimes(1);
    expect(thx.createReward).toBeCalledTimes(1);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: private_metadata.channel_id,
      text: 'Successfully linked a reward to this reaction',
    });
  });

  it('fails when emoji is not added', async () => {
    const mockPayload = buildMockViewPayload({
      view: {
        private_metadata: JSON.stringify(private_metadata),
        state: {
          values: {
            emoji_block: {
              emoji: {
                value: '',
              },
            },
            withdraw_amount_block: {
              withdraw_amount: {
                value: '',
              },
            },
          },
        },
      },
    });

    await emojiAdd.listener(mockPayload);

    expect(mockPayload.client.chat.postMessage).toBeCalledWith({
      channel: private_metadata.channel_id,
      text: 'This is not a valid emoji',
    });
  });
});
