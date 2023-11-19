//yarn add @pushprotocol/restapi @pushprotocol/socket
import { PushAPI, ethersV5SignerType, CONSTANTS } from "@pushprotocol/restapi";
import { ENV } from "@pushprotocol/restapi/src/lib/constants";
const env = ENV.STAGING;

export const useChatStream = async (signer: ethersV5SignerType) => {
    const user = await PushAPI.initialize(signer, { env });
    const stream = user.initStream([CONSTANTS.STREAM.CHAT], {
        filter: {
            channels: ['*'], // pass in specific channels to only listen to those
            chats: ['*'], // pass in specific chat ids to only listen to those
        },
        connection: {
            retries: 3, // number of retries in case of error
        },
        raw: false // enable true to show all data
    })
        ; (await stream).on(CONSTANTS.STREAM.CHAT, (data: any) => {
            console.log('chat data', data)
            return [data.from, data.content]
        }
        )
        ; (await stream).connect()
}

export const useChatSend = async (message: string, signer: ethersV5SignerType, to: string) => {
    try {
        const user = await PushAPI.initialize(signer, { env });
        await user.chat.send(to, { content: `${message}`, type: "Text" })
    }
    catch (e) {
        console.log(e)
        throw e
    }
}

export const useChatList = async (signer: ethersV5SignerType) => {
    try {
    const user = await PushAPI.initialize(signer, { env });
    const chats = await user.chat.list("CHATS")
    const mapped = chats.map((chat: any) => {
        return {
            address: chat.fromDID.split(":")[1],
            content: chat.messageContent
        }
    }
    )
    } catch (e) {
        console.log(e)
        throw e
    }
}