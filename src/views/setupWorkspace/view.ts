import { SETUP_WORKSPACE } from "./utils";

export default {
	type: 'modal',
	callback_id: SETUP_WORKSPACE,
	title: {
		type: 'plain_text',
		text: 'Setup Workspace'
	},
	blocks: [
		{
			block_id: "client_id_block",
			type: "input",
			label: {
				type: "plain_text",
				text: "What is your Client ID?"
			},
			element: {
				action_id: "client_id",
				type: "plain_text_input"
			}
		},
		{
			block_id: "client_secret_block",
			type: "input",
			label: {
				type: "plain_text",
				text: "What is your Client Secret?"
			},
			element: {
				action_id: "client_secret",
				type: "plain_text_input"
			}
		}
	],
	submit: {
		type: 'plain_text',
		text: 'Submit'
	}
}