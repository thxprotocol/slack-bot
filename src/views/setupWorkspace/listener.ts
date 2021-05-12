import Workspace from "../../models/workspace";
import Channel from "../../models/channel";
import Reaction from '../../models/reaction';
import thx from "../../service/thx";

const listener = async ({ ack, view, client }: any) => {
	let channel_id
	try {
		await ack();

		channel_id = view.private_metadata
		
		const client_id = view.state.values.client_id_block.client_id.value
		const client_secret = view.state.values.client_secret_block.client_secret.value
		const workspace_id = view.team_id
		
		const access_token = await thx.getAccessToken(client_id, client_secret)
		if (!access_token) {
			throw new Error('Invalid credentials')
		}

		const workspace = await Workspace.findOneAndUpdate(
			{ id: workspace_id }, 
			{ client_id, client_secret, access_token },
			{ upsert: true }
		)
		console.log(workspace, access_token)
		if (!workspace) return

		const channels = await Channel.find({ workspace })
		channels.forEach(async (channel) => {
			const reactions = await Reaction.find({ channel })
			reactions.forEach(reaction => reaction.delete())
			channel.delete()
		})
		
		await client.chat.postMessage({
			channel: channel_id,
			text: 'Successfully setup Client Id and Token for your workspace'
		})
	} catch (error) {
		if (channel_id) {
			await client.chat.postMessage({
				channel: channel_id,
				text: error.message || 'Failed to setup Client Id and Token for your workspace'
			})
		}
	}
}

export default listener