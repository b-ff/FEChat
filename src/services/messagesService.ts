import Message from '../models/Message';

const MESSAGES_STORAGE_KEY = 'fechat-messages'

class MessagesService {
    public messages: Message[] = []

    constructor () {

    }

    getMessages (): Message[] {
        console.log('Receiving messages!') // eslint-disable-line
        this.messages = (JSON.parse(window.localStorage.getItem(MESSAGES_STORAGE_KEY)) || []).map(Message.build)
        return this.messages
    }

    sendMessage (message: Message): void {
        this.getMessages()
        this.messages.push(message)
        this.postMessages()
    }

    postMessages (): void {
        console.log('Posting messages!') // eslint-disable-line
        window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(this.messages))
    }

    clearMessages (): void {
        window.localStorage.removeItem(MESSAGES_STORAGE_KEY)
    }
}

export default new MessagesService()