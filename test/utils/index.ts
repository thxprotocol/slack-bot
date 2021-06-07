import { mockUserId } from "./constants";

export const buildMockCommandPayload = (obj: any) => ({
  ack: jest.fn(),
  client: {
    views: {
      open: jest.fn(),
    },
    chat: {
      postMessage: jest.fn(),
    },
  },
  ...obj,
});

export const buildMockViewPayload = (obj: any) => ({
  ack: jest.fn(),
  body: {
    trigger_id: 'abcd',
    user: {
      name: 'John',
      id: mockUserId,
    },
  },
  client: {
    views: {
      open: jest.fn(),
    },
    chat: {
      postMessage: jest.fn(),
    },
  },
  ...obj,
});
