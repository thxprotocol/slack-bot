import { SETUP_ASSETPOOL } from './utils';

export default {
  type: 'modal',
  callback_id: SETUP_ASSETPOOL,
  title: {
    type: 'plain_text',
    text: 'Setup Asset Pool',
  },
  blocks: [
    {
      block_id: 'contract_address_block',
      type: 'input',
      label: {
        type: 'plain_text',
        text: 'What is your contract address?',
      },
      element: {
        action_id: 'contract_address',
        type: 'plain_text_input',
      },
    },
  ],
  submit: {
    type: 'plain_text',
    text: 'Submit',
  },
};
