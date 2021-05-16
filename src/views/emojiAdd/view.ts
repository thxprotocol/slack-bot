import { EMOJI_ADD } from './utils';

export default {
  type: 'modal',
  callback_id: EMOJI_ADD,
  title: {
    type: 'plain_text',
    text: 'Create Emoji Reward',
  },
  blocks: [
    {
      block_id: 'emoji_block',
      type: 'input',
      label: {
        type: 'plain_text',
        text: 'What emoji you want to use?',
      },
      element: {
        action_id: 'emoji',
        type: 'plain_text_input',
      },
    },
    {
      block_id: 'withdraw_amount_block',
      type: 'input',
      label: {
        type: 'plain_text',
        text: 'Please specify your reward value?',
      },
      element: {
        action_id: 'withdraw_amount',
        type: 'plain_text_input',
      },
    },
  ],
  submit: {
    type: 'plain_text',
    text: 'Submit',
  },
};
