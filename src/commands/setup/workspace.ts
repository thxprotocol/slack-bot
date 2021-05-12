import setupWorkspaceView from "../../views/setupWorkspace"

const setupWorkspaceCommand = {
  name: '/setup-workspace',
  async listener({ ack, body, command, client }: any) {
    await ack()

    try {
      const { channel_id, user_id } = command
      
      const response = await client.users.info({ user: user_id})
      const user = response.user

      if (!user.is_admin) {
        await client.chat.postMessage({
          channel: channel_id,
          text: 'Only admins can call this command'
        })
      
        return
      }
      
      await client.views.open({
        trigger_id: body.trigger_id,
        view: {
          ...setupWorkspaceView.view,
          private_metadata: channel_id
        },
      })
    } catch (error) {
      console.error(error)
    }
  } 
}

export default setupWorkspaceCommand
